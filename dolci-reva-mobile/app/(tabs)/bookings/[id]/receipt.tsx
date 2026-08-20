import { View, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { ArrowLeft } from 'lucide-react-native';
import { Text } from '@/presentation/components/ui/Text';
import { useReceipt } from '@/presentation/hooks/useReceipt';
import { colors } from '@/core/theme/colors';
import type { EscrowStatus } from '@/domain/entities/receipt';

const ESCROW_LABEL: Record<EscrowStatus, { label: string; color: string; bg: string }> = {
  EN_ATTENTE_PAIEMENT: { label: 'En attente de paiement', color: colors.warning, bg: '#fef3c7' },
  SECURISE: { label: "Fonds sécurisés jusqu'à votre arrivée", color: colors.info, bg: '#dbeafe' },
  LIBERE: { label: "Fonds versés à l'établissement", color: colors.success, bg: '#d1fae5' },
  REMBOURSE: { label: 'Remboursé', color: colors.gray[600], bg: colors.gray[100] },
};

export default function BookingReceiptScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const bookingId = Number(id);
  const { data: receipt, isLoading } = useReceipt(bookingId);

  if (isLoading || !receipt) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  const escrow = ESCROW_LABEL[receipt.receipt_info.escrow_status];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-row items-center gap-3 px-6 pb-2 pt-4">
        <Pressable onPress={() => router.back()} className="h-9 w-9 items-center justify-center">
          <ArrowLeft size={20} color={colors.secondary} />
        </Pressable>
        <Text className="font-rajdhani-bold text-xl text-theme-secondary">Reçu de réservation</Text>
      </View>

      <ScrollView contentContainerClassName="items-center gap-5 p-6">
        <View className="items-center gap-1">
          <Text className="text-sm text-gray-500">Référence</Text>
          <Text className="font-rajdhani-bold text-lg text-theme-secondary">
            {receipt.receipt_info.booking_reference}
          </Text>
        </View>

        <View style={{ backgroundColor: escrow.bg }} className="w-full rounded-xl px-4 py-3">
          <Text style={{ color: escrow.color }} className="text-center font-rajdhani-semibold text-sm">
            {escrow.label}
          </Text>
        </View>

        <View className="items-center rounded-2xl border border-gray-100 p-6">
          <QRCode value={receipt.qr_code.token} size={200} color={colors.secondary} backgroundColor="white" />
          <Text className="mt-3 text-xs text-gray-400">
            À présenter à l&apos;arrivée pour validation
          </Text>
        </View>

        <View className="w-full gap-2 rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <Row label="Établissement" value={receipt.property.name} />
          <Row label="Arrivée" value={receipt.booking.start_date.slice(0, 10)} />
          <Row label="Départ" value={receipt.booking.end_date.slice(0, 10)} />
          <Row label="Personnes" value={receipt.booking.guests} />
          <Row
            label="Montant payé"
            value={`${receipt.payment.total_price.toLocaleString('fr-FR')} ${receipt.payment.payment_currency}`}
          />
          <Row label="Méthode de paiement" value={receipt.payment.payment_method} />
          <Row label="Référence de transaction" value={receipt.payment.payment_reference} />
        </View>
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
