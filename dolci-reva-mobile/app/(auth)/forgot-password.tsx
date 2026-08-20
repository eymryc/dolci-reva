import { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react-native';
import { Text } from '@/presentation/components/ui/Text';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { authRepository } from '@/data/repositories/auth.repository.impl';
import { colors } from '@/core/theme/colors';

const schema = z.object({
  email: z.string().email({ message: 'Email invalide' }),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await authRepository.forgotPassword(values.email);
      setSent(true);
    } catch {
      setServerError("Impossible d'envoyer l'email. Vérifiez l'adresse saisie.");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-white">
      <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-12" keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} className="absolute left-6 top-12 h-9 w-9 items-center justify-center">
          <ArrowLeft size={20} color={colors.secondary} />
        </Pressable>

        <View className="mb-8 gap-2">
          <Text className="font-rajdhani-bold text-2xl text-theme-secondary">Mot de passe oublié</Text>
          <Text className="text-sm text-gray-500">
            Indiquez votre adresse e-mail, nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </Text>
        </View>

        {sent ? (
          <View className="gap-4">
            <Text className="text-sm text-theme-success">
              Un e-mail a été envoyé. Suivez le lien reçu, ou saisissez le code manuellement.
            </Text>
            <Button onPress={() => router.push('/(auth)/reset-password')}>Réinitialiser avec le code reçu</Button>
          </View>
        ) : (
          <View className="gap-4">
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Adresse e-mail"
                  placeholder="votre@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.email?.message}
                />
              )}
            />

            {serverError && <Text className="text-sm text-theme-error">{serverError}</Text>}

            <Button onPress={handleSubmit(onSubmit)} isLoading={isSubmitting}>
              Envoyer le lien
            </Button>
          </View>
        )}

        <View className="mt-8 flex-row justify-center gap-1">
          <Text className="text-sm text-gray-500">Vous vous souvenez de votre mot de passe ?</Text>
          <Link href="/(auth)/sign-in">
            <Text className="text-sm font-rajdhani-semibold text-theme-primary">Se connecter</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
