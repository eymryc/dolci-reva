import { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react-native';
import { Text } from '@/presentation/components/ui/Text';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { authRepository } from '@/data/repositories/auth.repository.impl';
import { colors } from '@/core/theme/colors';

const schema = z
  .object({
    email: z.string().email({ message: 'Email invalide' }),
    token: z.string().min(1, { message: 'Le code reçu par e-mail est requis' }),
    password: z.string().min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordScreen() {
  const router = useRouter();
  // Si l'utilisateur arrive via le lien reçu par email (deep link
  // dolcireva://reset-password?token=...&email=...), ces champs sont
  // pré-remplis automatiquement par Expo Router.
  const params = useLocalSearchParams<{ token?: string; email?: string }>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: params.email ?? '',
      token: params.token ?? '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await authRepository.resetPassword({
        email: values.email,
        token: values.token,
        password: values.password,
        password_confirmation: values.confirmPassword,
      });
      setSuccess(true);
    } catch {
      setServerError('Le code est invalide ou a expiré. Refaites une demande.');
    }
  };

  if (success) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-white px-6">
        <Text className="text-center font-rajdhani-bold text-xl text-theme-secondary">
          Mot de passe réinitialisé !
        </Text>
        <Button onPress={() => router.replace('/(auth)/sign-in')}>Se connecter</Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-white">
      <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-12" keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} className="absolute left-6 top-12 h-9 w-9 items-center justify-center">
          <ArrowLeft size={20} color={colors.secondary} />
        </Pressable>

        <Text className="mb-8 font-rajdhani-bold text-2xl text-theme-secondary">Réinitialiser le mot de passe</Text>

        <View className="gap-4">
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Adresse e-mail"
                keyboardType="email-address"
                autoCapitalize="none"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.email?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="token"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Code reçu par e-mail"
                autoCapitalize="none"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.token?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Nouveau mot de passe"
                secureTextEntry
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.password?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Confirmation du mot de passe"
                secureTextEntry
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.confirmPassword?.message}
              />
            )}
          />

          {serverError && <Text className="text-sm text-theme-error">{serverError}</Text>}

          <Button onPress={handleSubmit(onSubmit)} isLoading={isSubmitting} className="mt-2">
            Réinitialiser
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
