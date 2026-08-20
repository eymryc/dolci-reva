import { View, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowDownCircle, ArrowUpCircle } from 'lucide-react-native';
import { Text } from '@/presentation/components/ui/Text';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { useAuthStore } from '@/store/auth.store';
import { useWalletTransactions } from '@/presentation/hooks/useWallet';
import { colors } from '@/core/theme/colors';
import type { WalletTransaction } from '@/domain/entities/wallet-transaction';

function formatAmount(amount: string): string {
  return `${Number(amount).toLocaleString('fr-FR')} FCFA`;
}

function TransactionRow({ transaction }: { transaction: WalletTransaction }) {
  const isCredit = transaction.type === 'CREDIT';

  return (
    <View className="flex-row items-center gap-3 border-b border-gray-100 py-3">
      {isCredit ? (
        <ArrowDownCircle size={22} color={colors.success} />
      ) : (
        <ArrowUpCircle size={22} color={colors.error} />
      )}
      <View className="flex-1">
        <Text className="text-sm text-theme-secondary" numberOfLines={2}>
          {transaction.reason}
        </Text>
        <Text className="text-xs text-gray-400">{transaction.created_at.slice(0, 10)}</Text>
      </View>
      <Text
        className="font-rajdhani-semibold text-sm"
        style={{ color: isCredit ? colors.success : colors.error }}
      >
        {isCredit ? '+' : '-'}
        {formatAmount(transaction.amount)}
      </Text>
    </View>
  );
}

export default function WalletScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { data: transactions, isLoading, isRefetching, refetch } = useWalletTransactions();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-row items-center gap-3 px-6 pb-2 pt-4">
        <Pressable onPress={() => router.back()} className="h-9 w-9 items-center justify-center">
          <ArrowLeft size={20} color={colors.secondary} />
        </Pressable>
        <Text className="font-rajdhani-bold text-xl text-theme-secondary">Mon wallet</Text>
      </View>

      <View className="mx-6 mb-4 gap-4 rounded-2xl bg-theme-secondary p-5">
        <Text className="text-sm text-white/70">Solde disponible</Text>
        <Text className="font-rajdhani-bold text-3xl text-white">
          {formatAmount(user?.wallet?.balance ?? '0')}
        </Text>
        <View className="flex-row justify-between border-t border-white/10 pt-3">
          <View>
            <Text className="text-xs text-white/60">Gelé</Text>
            <Text className="font-rajdhani-semibold text-sm text-white">
              {formatAmount(user?.wallet?.frozen_balance ?? '0')}
            </Text>
          </View>
          <View>
            <Text className="text-xs text-white/60">Recharge</Text>
            <Text className="font-rajdhani-semibold text-sm text-white">
              {formatAmount(user?.wallet?.recharge_balance ?? '0')}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-1 px-6">
        <Text className="mb-2 font-rajdhani-semibold text-base text-theme-secondary">Transactions</Text>

        {isLoading ? (
          <View className="gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </View>
        ) : (
          <FlatList
            data={transactions ?? []}
            keyExtractor={(item) => String(item.id)}
            onRefresh={refetch}
            refreshing={isRefetching}
            renderItem={({ item }) => <TransactionRow transaction={item} />}
            ListEmptyComponent={
              <Text className="mt-8 text-center text-sm text-gray-500">Aucune transaction pour le moment.</Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
