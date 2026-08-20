import { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react-native';
import { Text } from '@/presentation/components/ui/Text';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { useAuthStore } from '@/store/auth.store';
import { colors } from '@/core/theme/colors';

const loginSchema = z.object({
  email: z.string().email({ message: 'Email invalide' }),
  password: z.string().min(4, { message: 'Le mot de passe doit contenir au moins 4 caractères' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function SignInScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      await login(values);
      router.replace('/(tabs)');
    } catch {
      setServerError('Email ou mot de passe incorrect.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-12" keyboardShouldPersistTaps="handled">
        <View className="mb-10 items-center gap-3">
          <Image
            source={require('../../assets/icon.png')}
            style={{ width: 72, height: 72, borderRadius: 16 }}
          />
          <Text className="font-rajdhani-bold text-2xl text-theme-secondary">Dolci Rêva</Text>
          <Text className="text-sm text-gray-500">Connectez-vous pour continuer</Text>
        </View>

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

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <Input
                  label="Mot de passe"
                  placeholder="Votre mot de passe"
                  secureTextEntry={!showPassword}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.password?.message}
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-10"
                >
                  {showPassword ? (
                    <EyeOff size={20} color={colors.gray[400]} />
                  ) : (
                    <Eye size={20} color={colors.gray[400]} />
                  )}
                </Pressable>
              </View>
            )}
          />

          {serverError && <Text className="text-sm text-theme-error">{serverError}</Text>}

          <Link href="/(auth)/forgot-password" className="self-end">
            <Text className="text-sm font-rajdhani-medium text-theme-primary">Mot de passe oublié ?</Text>
          </Link>

          <Button onPress={handleSubmit(onSubmit)} isLoading={isSubmitting} className="mt-2">
            Se connecter
          </Button>
        </View>

        <View className="mt-8 flex-row justify-center gap-1">
          <Text className="text-sm text-gray-500">Pas encore de compte ?</Text>
          <Link href="/(auth)/sign-up">
            <Text className="text-sm font-rajdhani-semibold text-theme-primary">S&apos;inscrire</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
