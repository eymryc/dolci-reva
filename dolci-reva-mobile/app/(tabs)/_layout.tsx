import { Redirect, Tabs } from 'expo-router';
import { Home, Building2, CalendarCheck, User } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth.store';
import { colors } from '@/core/theme/colors';

export default function TabsLayout() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray[400],
        tabBarLabelStyle: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 12 },
        tabBarStyle: { borderTopColor: colors.gray[100] },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="residences"
        options={{
          title: 'Résidences',
          tabBarIcon: ({ color, size }) => <Building2 color={color} size={size} />,
        }}
      />
      {/*
        Les autres verticales (hôtels, restaurants, bars/lounges, night-clubs)
        restent des routes normales sous (tabs) — mêmes garde d'auth, même
        layout — mais ne sont pas affichées comme onglet séparé (href: null)
        pour ne pas surcharger la tab bar. On y accède depuis l'accueil.
      */}
      <Tabs.Screen name="hotels" options={{ href: null }} />
      <Tabs.Screen name="restaurants" options={{ href: null }} />
      <Tabs.Screen name="lounges" options={{ href: null }} />
      <Tabs.Screen name="bars" options={{ href: null }} />
      <Tabs.Screen name="night-clubs" options={{ href: null }} />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Réservations',
          tabBarIcon: ({ color, size }) => <CalendarCheck color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
