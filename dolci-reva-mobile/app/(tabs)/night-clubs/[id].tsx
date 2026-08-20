import { useState } from 'react';
import { View, ScrollView, ActivityIndicator, Pressable, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Minus, Plus, Calendar } from 'lucide-react-native';
import { openPaymentSession } from '@/core/payments/openPaymentSession';
import { Text } from '@/presentation/components/ui/Text';
import { Button } from '@/presentation/components/ui/Button';
import { Badge } from '@/presentation/components/ui/Badge';
import { PhotoGallery } from '@/presentation/components/ui/PhotoGallery';
import { usePublicNightClub, useBookNightClub } from '@/presentation/hooks/useNightClubs';
import { colors } from '@/core/theme/colors';

function formatDateTime(date: Date): string {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${mo}-${d} ${h}:${mi}:00`;
}

function formatDisplay(date: Date): string {
  return date.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function NightClubDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const nightClubId = Number(id);
  const { data: nightClub, isLoading } = usePublicNightClub(nightClubId);
  const bookMutation = useBookNightClub(nightClubId);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState(2);
  const [pickerTarget, setPickerTarget] = useState<'start' | 'end' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePickerChange = (event: unknown, selected?: Date) => {
    if (Platform.OS === 'android') setPickerTarget(null);
    if (!selected) return;
    if (pickerTarget === 'start') setStartDate(selected);
    else if (pickerTarget === 'end') setEndDate(selected);
    if (Platform.OS === 'ios') setPickerTarget(null);
  };

  const handleBooking = async () => {
    setError(null);
    if (!startDate || !endDate) {
      setError('Veuillez sélectionner les horaires de votre soirée.');
      return;
    }

    try {
      const result = await bookMutation.mutateAsync({
        start_date: formatDateTime(startDate),
        end_date: formatDateTime(endDate),
        guests,
      });

      if (result.payment_url) {
        const paid = await openPaymentSession(result.payment_url);
        if (paid) {
          queryClient.invalidateQueries({ queryKey: ['bookings'] });
        }
      }
      router.push('/(tabs)/bookings');
    } catch {
      setError('Une erreur est survenue lors de la réservation.');
    }
  };

  if (isLoading || !nightClub) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  const galleryUrls = nightClub.gallery_images?.length
    ? nightClub.gallery_images.map((g) => g.large_url ?? g.medium_url ?? g.url)
    : nightClub.main_image_url
      ? [nightClub.main_image_url]
      : [];

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerClassName="pb-8">
        <View className="relative">
          <PhotoGallery images={galleryUrls} height={288} />
          <SafeAreaView edges={['top']} className="absolute left-0 top-0">
            <Pressable
              onPress={() => router.back()}
              className="ml-4 mt-2 h-10 w-10 items-center justify-center rounded-full bg-white/90"
            >
              <ArrowLeft size={20} color={colors.secondary} />
            </Pressable>
          </SafeAreaView>
        </View>

        <View className="gap-4 p-6">
          <View>
            <Text className="font-rajdhani-bold text-2xl text-theme-secondary">{nightClub.name}</Text>
            <View className="mt-1 flex-row items-center gap-1">
              <MapPin size={14} color={colors.gray[400]} />
              <Text className="text-sm text-gray-500">
                {nightClub.address}, {nightClub.city}
              </Text>
            </View>
          </View>

          {nightClub.description && (
            <Text className="text-sm leading-5 text-gray-600">{nightClub.description}</Text>
          )}

          <View className="flex-row flex-wrap gap-2">
            {!!nightClub.age_restriction && <Badge variant="secondary">{`${nightClub.age_restriction}+`}</Badge>}
            {nightClub.parking && <Badge variant="secondary">Parking</Badge>}
          </View>

          {nightClub.amenities?.length > 0 && (
            <View className="flex-row flex-wrap gap-2">
              {nightClub.amenities.map((amenity) => (
                <Badge key={amenity.id} variant="secondary">
                  {amenity.name}
                </Badge>
              ))}
            </View>
          )}

          <View className="gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <Text className="font-rajdhani-semibold text-base text-theme-secondary">Réserver</Text>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setPickerTarget('start')}
                className="flex-1 flex-row items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-3"
              >
                <Calendar size={16} color={colors.gray[400]} />
                <Text className="text-sm text-gray-700">{startDate ? formatDisplay(startDate) : 'Arrivée'}</Text>
              </Pressable>
              <Pressable
                onPress={() => setPickerTarget('end')}
                className="flex-1 flex-row items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-3"
              >
                <Calendar size={16} color={colors.gray[400]} />
                <Text className="text-sm text-gray-700">{endDate ? formatDisplay(endDate) : 'Départ'}</Text>
              </Pressable>
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-700">Invités</Text>
              <View className="flex-row items-center gap-3">
                <Pressable
                  onPress={() => setGuests((g) => Math.max(1, g - 1))}
                  className="h-8 w-8 items-center justify-center rounded-full border border-gray-300"
                >
                  <Minus size={16} color={colors.secondary} />
                </Pressable>
                <Text className="w-6 text-center font-rajdhani-semibold text-base">{guests}</Text>
                <Pressable
                  onPress={() => setGuests((g) => g + 1)}
                  className="h-8 w-8 items-center justify-center rounded-full border border-gray-300"
                >
                  <Plus size={16} color={colors.secondary} />
                </Pressable>
              </View>
            </View>

            {error && <Text className="text-sm text-theme-error">{error}</Text>}

            <Button onPress={handleBooking} isLoading={bookMutation.isPending}>
              Réserver maintenant
            </Button>
          </View>
        </View>
      </ScrollView>

      {pickerTarget && (
        <DateTimePicker
          value={(pickerTarget === 'start' ? startDate : endDate) ?? new Date()}
          mode="datetime"
          minimumDate={new Date()}
          onChange={handlePickerChange}
        />
      )}
    </View>
  );
}
