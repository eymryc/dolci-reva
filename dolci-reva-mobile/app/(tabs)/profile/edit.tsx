import { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/presentation/components/ui/Text';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { useAuthStore } from '@/store/auth.store';
import { colors } from '@/core/theme/colors';

const editProfileSchema = z.object({
  firstName: z.string().min(2, { message: 'Le prénom doit contenir au moins 2 caractères' }),
  lastName: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères' }),
  email: z.string().email({ message: 'Email invalide' }),
  phone: z.string().min(8, { message: 'Le numéro de téléphone est invalide' }),
});

type EditProfileFormValues = z.infer<typeof editProfileSchema>;

export default function EditProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: user?.first_name ?? '',
      lastName: user?.last_name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
    },
  });

  const onSubmit = async (values: EditProfileFormValues) => {
    setServerError(null);
    setSuccess(false);
    try {
      await updateProfile({
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        phone: values.phone,
      });
      setSuccess(true);
    } catch {
      setServerError('Impossible de mettre à jour le profil.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-row items-center gap-3 px-6 pb-2 pt-4">
        <Pressable onPress={() => router.back()} className="h-9 w-9 items-center justify-center">
          <ArrowLeft size={20} color={colors.secondary} />
        </Pressable>
        <Text className="font-rajdhani-bold text-xl text-theme-secondary">Modifier mon profil</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerClassName="gap-4 p-6" keyboardShouldPersistTaps="handled">
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Prénom" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.firstName?.message} />
            )}
          />
          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Nom" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.lastName?.message} />
            )}
          />
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
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Téléphone"
                keyboardType="phone-pad"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.phone?.message}
              />
            )}
          />

          {serverError && <Text className="text-sm text-theme-error">{serverError}</Text>}
          {success && <Text className="text-sm text-theme-success">Profil mis à jour avec succès !</Text>}

          <Button onPress={handleSubmit(onSubmit)} isLoading={isSubmitting} className="mt-2">
            Enregistrer
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
