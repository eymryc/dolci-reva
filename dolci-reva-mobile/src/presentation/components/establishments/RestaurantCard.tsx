import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MapPin, UtensilsCrossed } from 'lucide-react-native';
import { Text } from '@/presentation/components/ui/Text';
import { colors } from '@/core/theme/colors';
import type { Restaurant } from '@/domain/entities/restaurant';

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/restaurants/${restaurant.id}`)}
      className="mb-4 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm active:opacity-90"
    >
      <View className="relative h-44 w-full bg-gray-100">
        <Image
          source={{ uri: restaurant.main_image_url ?? undefined }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={200}
        />
        <View className="absolute left-3 top-3 flex-row items-center gap-1 rounded-full bg-theme-primary px-3 py-1.5">
          <UtensilsCrossed size={12} color="white" />
          <Text className="text-xs font-rajdhani-semibold text-white">Restaurant</Text>
        </View>
      </View>

      <View className="gap-1.5 p-4">
        <Text className="font-rajdhani-bold text-base text-theme-secondary" numberOfLines={1}>
          {restaurant.name}
        </Text>
        <View className="flex-row items-center gap-1">
          <MapPin size={14} color={colors.gray[400]} />
          <Text className="text-sm text-gray-500">{restaurant.city}</Text>
        </View>
      </View>
    </Pressable>
  );
}
