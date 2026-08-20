import { View, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Building2, Hotel, UtensilsCrossed, Wine, Beer, Music2 } from 'lucide-react-native';
import { Text } from '@/presentation/components/ui/Text';
import { Button } from '@/presentation/components/ui/Button';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { ResidenceCard } from '@/presentation/components/establishments/ResidenceCard';
import { usePublicResidences } from '@/presentation/hooks/useResidences';
import { useAuthStore } from '@/store/auth.store';
import { colors } from '@/core/theme/colors';

const CATEGORIES: Array<{ label: string; href: Href; icon: typeof Building2 }> = [
  { label: 'Résidences', href: '/(tabs)/residences', icon: Building2 },
  { label: 'Hôtels', href: '/(tabs)/hotels', icon: Hotel },
  { label: 'Restaurants', href: '/(tabs)/restaurants', icon: UtensilsCrossed },
  { label: 'Lounges', href: '/(tabs)/lounges', icon: Wine },
  { label: 'Bars', href: '/(tabs)/bars', icon: Beer },
  { label: 'Night-Clubs', href: '/(tabs)/night-clubs', icon: Music2 },
];

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { data: residences, isLoading, isRefetching, refetch } = usePublicResidences();
  const featured = residences?.slice(0, 4) ?? [];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView
        contentContainerClassName="pb-8"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        {/* En-tête, inspiré du hero de la home web */}
        <View className="gap-1 px-6 pb-6 pt-4">
          <Text className="text-sm text-gray-500">Bonjour {user?.first_name} 👋</Text>
          <Text className="font-rajdhani-bold text-2xl text-theme-secondary">
            Où voulez-vous aller aujourd&apos;hui ?
          </Text>
        </View>

        {/* Catégories — accès rapide à toutes les verticales */}
        <View className="mb-6 flex-row flex-wrap gap-3 px-6">
          {CATEGORIES.map(({ label, href, icon: Icon }) => (
            <Pressable
              key={label}
              onPress={() => router.push(href)}
              className="items-center gap-1.5"
              style={{ width: '30%' }}
            >
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-orange-50">
                <Icon size={22} color={colors.primary} />
              </View>
              <Text className="text-center text-xs font-rajdhani-medium text-gray-700">{label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Sélections d'exception */}
        <View className="px-6">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="font-rajdhani-bold text-lg text-theme-secondary">
              Sélections d&apos;exception
            </Text>
            <Button variant="ghost" size="sm" onPress={() => router.push('/(tabs)/residences')}>
              Voir plus
            </Button>
          </View>

          {isLoading ? (
            <View className="gap-4">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-52 w-full" />
              ))}
            </View>
          ) : featured.length > 0 ? (
            featured.map((residence) => <ResidenceCard key={residence.id} residence={residence} />)
          ) : (
            <Text className="text-sm text-gray-500">Aucune résidence disponible pour le moment.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
