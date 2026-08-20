import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';

/**
 * Porte d'entrée : redirige vers l'app (tabs) si connecté, sinon vers l'auth.
 * Le layout racine garantit que isInitialized est déjà true à ce stade.
 */
export default function Index() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <Redirect href="/(tabs)" />;
}
