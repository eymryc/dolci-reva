import { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Text } from '@/presentation/components/ui/Text';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/core/lib/cn';

const signUpSchema = z
  .object({
    firstName: z.string().min(2, { message: 'Le prénom doit contenir au moins 2 caractères' }),
    lastName: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères' }),
    email: z.string().email({ message: 'Email invalide' }),
    phone: z.string().min(8, { message: 'Le numéro de téléphone est invalide' }),
    password: z.string().min(4, { message: 'Le mot de passe doit contenir au moins 4 caractères' }),
    confirmPassword: z.string(),
    type: z.enum(['CUSTOMER', 'OWNER']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpScreen() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      type: 'CUSTOMER',
    },
  });

  const selectedType = watch('type');

  const onSubmit = async (values: SignUpFormValues) => {
    setServerError(null);
    try {
      await register({
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        phone: values.phone,
        password: values.password,
        password_confirmation: values.confirmPassword,
        type: values.type,
      });
      setDone(true);
    } catch {
      setServerError("Impossible de créer le compte. Vérifiez vos informations.");
    }
  };

  if (done) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-white px-6">
        <Text className="text-center font-rajdhani-bold text-xl text-theme-secondary">
          Compte créé !
        </Text>
        <Text className="text-center text-sm text-gray-500">
          Un email de vérification vient de vous être envoyé. Confirmez votre adresse avant de vous
          connecter.
        </Text>
        <Button onPress={() => router.replace('/(auth)/sign-in')}>Retour à la connexion</Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerClassName="flex-grow px-6 py-12" keyboardShouldPersistTaps="handled">
        <Text className="mb-8 font-rajdhani-bold text-2xl text-theme-secondary">Créer un compte</Text>

        <View className="mb-5 flex-row gap-3">
          {(['CUSTOMER', 'OWNER'] as const).map((type) => (
            <Pressable
              key={type}
              onPress={() => setValue('type', type)}
              className={cn(
                'flex-1 items-center rounded-lg border py-3',
                selectedType === type ? 'border-theme-primary bg-orange-50' : 'border-gray-300 bg-white'
              )}
            >
              <Text
                className={cn(
                  'font-rajdhani-semibold text-sm',
                  selectedType === type ? 'text-theme-primary' : 'text-gray-600'
                )}
              >
                {type === 'CUSTOMER' ? 'Client' : 'Propriétaire'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="gap-4">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Prénom" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.firstName?.message} />
                )}
              />
            </View>
            <View className="flex-1">
              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Nom" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.lastName?.message} />
                )}
              />
            </View>
          </View>

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

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Téléphone"
                placeholder="+225 07 00 00 00 00"
                keyboardType="phone-pad"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.phone?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Mot de passe"
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
            Créer mon compte
          </Button>
        </View>

        <View className="mt-8 flex-row justify-center gap-1">
          <Text className="text-sm text-gray-500">Déjà un compte ?</Text>
          <Link href="/(auth)/sign-in">
            <Text className="text-sm font-rajdhani-semibold text-theme-primary">Se connecter</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
