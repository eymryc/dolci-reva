import type { WalletTransaction, TransactionCategory } from '@/domain/entities/wallet-transaction';

export interface WalletRepository {
  getTransactions(page?: number, category?: TransactionCategory): Promise<WalletTransaction[]>;
}
