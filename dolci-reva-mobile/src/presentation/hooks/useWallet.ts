import { useQuery } from '@tanstack/react-query';
import { walletRepository } from '@/data/repositories/wallet.repository.impl';
import type { TransactionCategory } from '@/domain/entities/wallet-transaction';

export function useWalletTransactions(page = 1, category?: TransactionCategory) {
  return useQuery({
    queryKey: ['wallet_transactions', page, category],
    queryFn: () => walletRepository.getTransactions(page, category),
  });
}
