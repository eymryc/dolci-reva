import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';

export default function AuthLayout() {
  const user = useAuthStore((state) => state.user);

  // Un utilisateur déjà connecté n'a rien à faire sur les écrans d'auth.
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
