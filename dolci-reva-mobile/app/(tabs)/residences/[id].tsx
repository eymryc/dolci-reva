import { useState } from 'react';
import { View, ScrollView, ActivityIndicator, Pressable, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Star, Minus, Plus, Calendar } from 'lucide-react-native';
import { openPaymentSession } from '@/core/payments/openPaymentSession';
import { Text } from '@/presentation/components/ui/Text';
import { Button } from '@/presentation/components/ui/Button';
import { Badge } from '@/presentation/components/ui/Badge';
import { PhotoGallery } from '@/presentation/components/ui/PhotoGallery';
import { OpinionsList } from '@/presentation/components/establishments/OpinionsList';
import { usePublicResidence, useBookResidence } from '@/presentation/hooks/useResidences';
import { colors } from '@/core/theme/colors';

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/** Une date (YYYY-MM-DD) tombe-t-elle dans une des indisponibilités déclarées ? */
function isDateUnavailable(date: Date, unavailableDates: string[] = []): boolean {
  const iso = formatDate(date);
  return unavailableDates.includes(iso);
}

export default function ResidenceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const residenceId = Number(id);
  const { data: residence, isLoading } = usePublicResidence(residenceId);
  const bookMutation = useBookResidence(residenceId);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState(1);
  const [pickerTarget, setPickerTarget] = useState<'start' | 'end' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const nights =
    startDate && endDate ? Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86400000)) : 0;
  const estimatedTotal = residence ? Number(residence.price) * nights : 0;

  const handlePickerChange = (event: unknown, selected?: Date) => {
    if (Platform.OS === 'android') {
      setPickerTarget(null);
    }
    if (!selected) return;

    if (isDateUnavailable(selected, residence?.unavailable_dates)) {
      setError('Cette date est déjà réservée, merci d\'en choisir une autre.');
      if (Platform.OS === 'ios') setPickerTarget(null);
      return;
    }
    setError(null);

    if (pickerTarget === 'start') {
      setStartDate(selected);
      if (endDate && endDate <= selected) setEndDate(null);
    } else if (pickerTarget === 'end') {
      setEndDate(selected);
    }
    if (Platform.OS === 'ios') setPickerTarget(null);
  };

  const handleBooking = async () => {
    setError(null);

    if (!startDate || !endDate) {
      setError("Veuillez sélectionner les dates d'arrivée et de départ.");
      return;
    }

    // Revérifie chaque nuit de la période (une date isolée peut être libre
    // alors qu'une nuit intermédiaire de la période choisie ne l'est pas).
    const unavailable = residence?.unavailable_dates ?? [];
    const cursor = new Date(startDate);
    while (cursor < endDate) {
      if (isDateUnavailable(cursor, unavailable)) {
        setError('La période sélectionnée inclut une ou plusieurs dates déjà réservées.');
        return;
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    try {
      const result = await bookMutation.mutateAsync({
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
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

  if (isLoading || !residence) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  const rating = Number(residence.average_rating) || 0;
  const galleryUrls = residence.gallery_images?.length
    ? residence.gallery_images.map((g) => g.large_url ?? g.medium_url ?? g.url)
    : residence.main_image_url
      ? [residence.main_image_url]
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
            <View className="flex-row items-center justify-between">
              <Text className="flex-1 font-rajdhani-bold text-2xl text-theme-secondary">
                {residence.name}
              </Text>
              {rating > 0 && (
                <View className="flex-row items-center gap-1">
                  <Star size={16} color={colors.warning} fill={colors.warning} />
                  <Text className="font-rajdhani-medium text-base text-gray-700">{rating.toFixed(1)}</Text>
                </View>
              )}
            </View>
            <View className="mt-1 flex-row items-center gap-1">
              <MapPin size={14} color={colors.gray[400]} />
              <Text className="text-sm text-gray-500">
                {residence.address}, {residence.city}
              </Text>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-2">
            {residence.type && <Badge variant="secondary">{residence.type}</Badge>}
            {residence.standing && <Badge variant="secondary">{residence.standing}</Badge>}
            <Badge variant="secondary">{`${residence.max_guests} Personnes max`}</Badge>
          </View>

          {residence.description && (
            <Text className="text-sm leading-5 text-gray-600">{residence.description}</Text>
          )}

          {residence.amenities?.length > 0 && (
            <View className="gap-2">
              <Text className="font-rajdhani-semibold text-base text-theme-secondary">Équipements</Text>
              <View className="flex-row flex-wrap gap-2">
                {residence.amenities.map((amenity) => (
                  <Badge key={amenity.id} variant="secondary">
                    {amenity.name}
                  </Badge>
                ))}
              </View>
            </View>
          )}

          <OpinionsList residenceId={residenceId} />

          {/* Réservation */}
          <View className="gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <Text className="font-rajdhani-semibold text-base text-theme-secondary">Réserver</Text>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setPickerTarget('start')}
                className="flex-1 flex-row items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-3"
              >
                <Calendar size={16} color={colors.gray[400]} />
                <Text className="text-sm text-gray-700">
                  {startDate ? formatDate(startDate) : 'Arrivée'}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setPickerTarget('end')}
                className="flex-1 flex-row items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-3"
              >
                <Calendar size={16} color={colors.gray[400]} />
                <Text className="text-sm text-gray-700">{endDate ? formatDate(endDate) : 'Départ'}</Text>
              </Pressable>
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-700">Personnes</Text>
              <View className="flex-row items-center gap-3">
                <Pressable
                  onPress={() => setGuests((g) => Math.max(1, g - 1))}
                  className="h-8 w-8 items-center justify-center rounded-full border border-gray-300"
                >
                  <Minus size={16} color={colors.secondary} />
                </Pressable>
                <Text className="w-6 text-center font-rajdhani-semibold text-base">{guests}</Text>
                <Pressable
                  onPress={() => setGuests((g) => Math.min(residence.max_guests, g + 1))}
                  className="h-8 w-8 items-center justify-center rounded-full border border-gray-300"
                >
                  <Plus size={16} color={colors.secondary} />
                </Pressable>
              </View>
            </View>

            {nights > 0 && (
              <View className="flex-row justify-between border-t border-gray-200 pt-3">
                <Text className="text-sm text-gray-600">
                  {Number(residence.price).toLocaleString('fr-FR')} FCFA × {nights} nuit{nights > 1 ? 's' : ''}
                </Text>
                <Text className="font-rajdhani-semibold text-base text-theme-secondary">
                  {estimatedTotal.toLocaleString('fr-FR')} FCFA
                </Text>
              </View>
            )}

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
          mode="date"
          minimumDate={pickerTarget === 'start' ? new Date() : (startDate ?? new Date())}
          onChange={handlePickerChange}
        />
      )}
    </View>
  );
}
