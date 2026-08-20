import { useState } from 'react';
import { View, ScrollView, ActivityIndicator, Pressable, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Star, Minus, Plus, Calendar, BedDouble } from 'lucide-react-native';
import { openPaymentSession } from '@/core/payments/openPaymentSession';
import { Text } from '@/presentation/components/ui/Text';
import { Button } from '@/presentation/components/ui/Button';
import { Badge } from '@/presentation/components/ui/Badge';
import { PhotoGallery } from '@/presentation/components/ui/PhotoGallery';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { usePublicHotel, useHotelRooms, useBookHotel } from '@/presentation/hooks/useHotels';
import { colors } from '@/core/theme/colors';
import { cn } from '@/core/lib/cn';
import type { HotelRoom } from '@/domain/entities/hotel';

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export default function HotelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const hotelId = Number(id);
  const { data: hotel, isLoading } = usePublicHotel(hotelId);
  const { data: rooms, isLoading: roomsLoading } = useHotelRooms(hotelId);
  const bookMutation = useBookHotel(hotelId);

  const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState(1);
  const [pickerTarget, setPickerTarget] = useState<'start' | 'end' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const nights =
    startDate && endDate ? Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86400000)) : 0;
  const estimatedTotal = selectedRoom ? Number(selectedRoom.price) * nights : 0;

  const handlePickerChange = (event: unknown, selected?: Date) => {
    if (Platform.OS === 'android') setPickerTarget(null);
    if (!selected) return;
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

    if (!selectedRoom) {
      setError('Veuillez sélectionner une chambre.');
      return;
    }
    if (!startDate || !endDate) {
      setError("Veuillez sélectionner les dates d'arrivée et de départ.");
      return;
    }

    try {
      const result = await bookMutation.mutateAsync({
        hotel_room_id: selectedRoom.id,
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

  if (isLoading || !hotel) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  const galleryUrls = hotel.gallery_images?.length
    ? hotel.gallery_images.map((g) => g.large_url ?? g.medium_url ?? g.url)
    : hotel.main_image_url
      ? [hotel.main_image_url]
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
              <Text className="flex-1 font-rajdhani-bold text-2xl text-theme-secondary">{hotel.name}</Text>
              {!!hotel.star_rating && (
                <View className="flex-row items-center gap-1">
                  <Star size={16} color={colors.warning} fill={colors.warning} />
                  <Text className="font-rajdhani-medium text-base text-gray-700">{hotel.star_rating}</Text>
                </View>
              )}
            </View>
            <View className="mt-1 flex-row items-center gap-1">
              <MapPin size={14} color={colors.gray[400]} />
              <Text className="text-sm text-gray-500">
                {hotel.address}, {hotel.city}
              </Text>
            </View>
          </View>

          {hotel.description && (
            <Text className="text-sm leading-5 text-gray-600">{hotel.description}</Text>
          )}

          {hotel.amenities?.length > 0 && (
            <View className="flex-row flex-wrap gap-2">
              {hotel.amenities.map((amenity) => (
                <Badge key={amenity.id} variant="secondary">
                  {amenity.name}
                </Badge>
              ))}
            </View>
          )}

          {/* Sélection de chambre */}
          <View className="gap-2">
            <Text className="font-rajdhani-semibold text-base text-theme-secondary">Choisir une chambre</Text>

            {roomsLoading ? (
              <View className="gap-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </View>
            ) : rooms && rooms.length > 0 ? (
              rooms.map((room) => (
                <Pressable
                  key={room.id}
                  onPress={() => setSelectedRoom(room)}
                  className={cn(
                    'flex-row items-center justify-between gap-3 rounded-xl border p-3',
                    selectedRoom?.id === room.id ? 'border-theme-primary bg-orange-50' : 'border-gray-200 bg-white'
                  )}
                >
                  <View className="flex-1 flex-row items-center gap-3">
                    <BedDouble size={20} color={colors.gray[500]} />
                    <View className="flex-1">
                      <Text className="font-rajdhani-semibold text-sm text-theme-secondary">
                        {room.display_name || room.name || room.type}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {room.standing} · {room.max_guests} pers. max
                      </Text>
                    </View>
                  </View>
                  <Text className="font-rajdhani-bold text-sm text-theme-primary">
                    {Number(room.price).toLocaleString('fr-FR')} FCFA
                  </Text>
                </Pressable>
              ))
            ) : (
              <Text className="text-sm text-gray-500">Aucune chambre disponible actuellement.</Text>
            )}
          </View>

          {/* Réservation */}
          {selectedRoom && (
            <View className="gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <Text className="font-rajdhani-semibold text-base text-theme-secondary">Réserver</Text>

              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setPickerTarget('start')}
                  className="flex-1 flex-row items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-3"
                >
                  <Calendar size={16} color={colors.gray[400]} />
                  <Text className="text-sm text-gray-700">{startDate ? formatDate(startDate) : 'Arrivée'}</Text>
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
                    onPress={() => setGuests((g) => Math.min(selectedRoom.max_guests, g + 1))}
                    className="h-8 w-8 items-center justify-center rounded-full border border-gray-300"
                  >
                    <Plus size={16} color={colors.secondary} />
                  </Pressable>
                </View>
              </View>

              {nights > 0 && (
                <View className="flex-row justify-between border-t border-gray-200 pt-3">
                  <Text className="text-sm text-gray-600">
                    {Number(selectedRoom.price).toLocaleString('fr-FR')} FCFA × {nights} nuit{nights > 1 ? 's' : ''}
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
          )}
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
