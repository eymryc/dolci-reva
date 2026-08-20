import { View, FlatList, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/presentation/components/ui/Text';
import { Card, CardContent } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { useMyBookings, useCancelBooking } from '@/presentation/hooks/useBookings';
import type { Booking, BookingStatus } from '@/domain/entities/booking';

const STATUS_LABEL: Record<BookingStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'secondary' }> = {
  EN_ATTENTE: { label: 'En attente', variant: 'warning' },
  CONFIRME: { label: 'Confirmée', variant: 'success' },
  ANNULE: { label: 'Annulée', variant: 'secondary' },
  COMPLETE: { label: 'Terminée', variant: 'default' },
  NO_SHOW: { label: 'Absent', variant: 'error' },
};

function BookingRow({ booking }: { booking: Booking }) {
  const router = useRouter();
  const cancelMutation = useCancelBooking();
  const canCancel = booking.status === 'EN_ATTENTE' || booking.status === 'CONFIRME';
  const statusInfo = STATUS_LABEL[booking.status];

  const handleCancel = () => {
    Alert.alert('Annuler la réservation', 'Confirmez-vous l\'annulation ?', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Oui, annuler',
        style: 'destructive',
        onPress: () => cancelMutation.mutate({ id: booking.id }),
      },
    ]);
  };

  return (
    <Pressable onPress={() => router.push(`/(tabs)/bookings/${booking.id}`)}>
      <Card className="mb-3">
        <CardContent className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="font-rajdhani-bold text-base text-theme-secondary">{booking.bookable.name}</Text>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </View>
          <Text className="text-sm text-gray-500">
            {booking.start_date.slice(0, 10)} → {booking.end_date.slice(0, 10)} · {booking.guests} pers.
          </Text>
          <Text className="font-rajdhani-semibold text-base text-theme-primary">
            {Number(booking.total_price).toLocaleString('fr-FR')} FCFA
          </Text>
          <Text className="text-xs text-gray-400">Réf. {booking.booking_reference}</Text>
          {canCancel && (
            <Button variant="outline" size="sm" onPress={handleCancel} isLoading={cancelMutation.isPending}>
              Annuler
            </Button>
          )}
        </CardContent>
      </Card>
    </Pressable>
  );
}

export default function BookingsScreen() {
  const { data: bookings, isLoading, isRefetching, refetch } = useMyBookings();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-6 pb-2 pt-4">
        <Text className="font-rajdhani-bold text-2xl text-theme-secondary">Mes réservations</Text>
      </View>

      {isLoading ? (
        <View className="gap-3 px-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </View>
      ) : (
        <FlatList
          data={bookings ?? []}
          keyExtractor={(item) => String(item.id)}
          contentContainerClassName="px-6 pb-8"
          onRefresh={refetch}
          refreshing={isRefetching}
          renderItem={({ item }) => <BookingRow booking={item} />}
          ListEmptyComponent={
            <Text className="mt-8 text-center text-sm text-gray-500">
              Vous n&apos;avez aucune réservation pour le moment.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}
