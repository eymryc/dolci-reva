import { View, ScrollView, ActivityIndicator, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Receipt as ReceiptIcon } from 'lucide-react-native';
import { Text } from '@/presentation/components/ui/Text';
import { Button } from '@/presentation/components/ui/Button';
import { Badge } from '@/presentation/components/ui/Badge';
import { useBooking, useCancelBooking } from '@/presentation/hooks/useBookings';
import { colors } from '@/core/theme/colors';
import type { BookingStatus } from '@/domain/entities/booking';

const STATUS_LABEL: Record<BookingStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'secondary' }> = {
  EN_ATTENTE: { label: 'En attente', variant: 'warning' },
  CONFIRME: { label: 'Confirmée', variant: 'success' },
  ANNULE: { label: 'Annulée', variant: 'secondary' },
  COMPLETE: { label: 'Terminée', variant: 'default' },
  NO_SHOW: { label: 'Absent', variant: 'error' },
};

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const bookingId = Number(id);
  const { data: booking, isLoading } = useBooking(bookingId);
  const cancelMutation = useCancelBooking();

  if (isLoading || !booking) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  const statusInfo = STATUS_LABEL[booking.status];
  const canCancel = booking.status === 'EN_ATTENTE' || booking.status === 'CONFIRME';
  const hasReceipt = booking.payment_status === 'PAYE';

  const handleCancel = () => {
    Alert.alert('Annuler la réservation', "Confirmez-vous l'annulation ?", [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Oui, annuler',
        style: 'destructive',
        onPress: () => cancelMutation.mutate({ id: booking.id }),
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-row items-center gap-3 px-6 pb-2 pt-4">
        <Pressable onPress={() => router.back()} className="h-9 w-9 items-center justify-center">
          <ArrowLeft size={20} color={colors.secondary} />
        </Pressable>
        <Text className="font-rajdhani-bold text-xl text-theme-secondary">Détail de la réservation</Text>
      </View>

      <ScrollView contentContainerClassName="gap-4 p-6">
        <View className="flex-row items-center justify-between">
          <Text className="flex-1 font-rajdhani-bold text-lg text-theme-secondary">{booking.bookable.name}</Text>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </View>

        <View className="gap-2 rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <Row label="Référence" value={booking.booking_reference} />
          <Row label="Arrivée" value={booking.start_date.slice(0, 10)} />
          <Row label="Départ" value={booking.end_date.slice(0, 10)} />
          <Row label="Personnes" value={String(booking.guests)} />
          <Row label="Statut du paiement" value={booking.payment_status} />
          {booking.notes && <Row label="Notes" value={booking.notes} />}
        </View>

        <View className="flex-row items-baseline justify-between rounded-2xl border border-gray-100 p-4">
          <Text className="text-sm text-gray-600">Total</Text>
          <Text className="font-rajdhani-bold text-xl text-theme-primary">
            {Number(booking.total_price).toLocaleString('fr-FR')} FCFA
          </Text>
        </View>

        {hasReceipt && (
          <Button
            variant="outline"
            onPress={() => router.push(`/(tabs)/bookings/${booking.id}/receipt`)}
          >
            <View className="flex-row items-center gap-2">
              <ReceiptIcon size={18} color={colors.primary} />
              <Text className="font-rajdhani-semibold text-sm text-theme-primary">Voir le reçu</Text>
            </View>
          </Button>
        )}

        {canCancel && (
          <Button variant="destructive" onPress={handleCancel} isLoading={cancelMutation.isPending}>
            Annuler la réservation
          </Button>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text className="font-rajdhani-medium text-sm text-theme-secondary">{value}</Text>
    </View>
  );
}
