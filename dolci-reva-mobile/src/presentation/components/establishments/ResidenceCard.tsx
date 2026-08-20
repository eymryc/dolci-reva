import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MapPin, Star } from 'lucide-react-native';
import { Text } from '@/presentation/components/ui/Text';
import { colors } from '@/core/theme/colors';
import type { Residence } from '@/domain/entities/residence';

/**
 * Équivalent mobile de dolci-reva-web/components/cards/ResidenceListingCard.tsx :
 * même hiérarchie visuelle (image + badge type, note, ville, prix).
 */
export function ResidenceCard({ residence }: { residence: Residence }) {
  const router = useRouter();
  const rating = Number(residence.average_rating) || 0;

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/residences/${residence.id}`)}
      className="mb-4 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm active:opacity-90"
    >
      <View className="relative h-44 w-full bg-gray-100">
        <Image
          source={{ uri: residence.main_image_url ?? undefined }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={200}
        />
        {residence.type && (
          <View className="absolute left-3 top-3 rounded-full bg-theme-primary px-3 py-1.5">
            <Text className="text-xs font-rajdhani-semibold text-white">{residence.type}</Text>
          </View>
        )}
      </View>

      <View className="gap-1.5 p-4">
        <View className="flex-row items-center justify-between">
          <Text className="flex-1 font-rajdhani-bold text-base text-theme-secondary" numberOfLines={1}>
            {residence.name}
          </Text>
          {rating > 0 && (
            <View className="flex-row items-center gap-1">
              <Star size={14} color={colors.warning} fill={colors.warning} />
              <Text className="text-sm font-rajdhani-medium text-gray-600">{rating.toFixed(1)}</Text>
            </View>
          )}
        </View>

        <View className="flex-row items-center gap-1">
          <MapPin size={14} color={colors.gray[400]} />
          <Text className="text-sm text-gray-500">{residence.city}</Text>
        </View>

        <View className="mt-1 flex-row items-baseline gap-1">
          <Text className="font-rajdhani-bold text-lg text-theme-primary">
            {Number(residence.price).toLocaleString('fr-FR')} FCFA
          </Text>
          <Text className="text-xs text-gray-500">/ nuit</Text>
        </View>
      </View>
    </Pressable>
  );
}
