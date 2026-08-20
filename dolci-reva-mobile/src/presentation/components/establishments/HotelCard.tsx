import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MapPin, Star } from 'lucide-react-native';
import { Text } from '@/presentation/components/ui/Text';
import { colors } from '@/core/theme/colors';
import type { Hotel } from '@/domain/entities/hotel';

export function HotelCard({ hotel }: { hotel: Hotel }) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/hotels/${hotel.id}`)}
      className="mb-4 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm active:opacity-90"
    >
      <View className="relative h-44 w-full bg-gray-100">
        <Image
          source={{ uri: hotel.main_image_url ?? undefined }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={200}
        />
        {!!hotel.star_rating && (
          <View className="absolute left-3 top-3 flex-row items-center gap-1 rounded-full bg-theme-primary px-3 py-1.5">
            <Star size={12} color="white" fill="white" />
            <Text className="text-xs font-rajdhani-semibold text-white">{hotel.star_rating} étoiles</Text>
          </View>
        )}
      </View>

      <View className="gap-1.5 p-4">
        <Text className="font-rajdhani-bold text-base text-theme-secondary" numberOfLines={1}>
          {hotel.name}
        </Text>
        <View className="flex-row items-center gap-1">
          <MapPin size={14} color={colors.gray[400]} />
          <Text className="text-sm text-gray-500">{hotel.city}</Text>
        </View>
      </View>
    </Pressable>
  );
}
