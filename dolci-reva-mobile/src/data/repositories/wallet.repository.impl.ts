import { apiClient } from '@/core/api/client';
import { extractApiData } from '@/core/api/response';
import type { WalletTransaction, TransactionCategory } from '@/domain/entities/wallet-transaction';
import type { WalletRepository } from '@/domain/repositories/wallet.repository';

export class WalletRepositoryImpl implements WalletRepository {
  async getTransactions(page = 1, category?: TransactionCategory): Promise<WalletTransaction[]> {
    const response = await apiClient.get('/wallet_transactions', {
      params: { page, transaction_category: category },
    });
    return extractApiData<WalletTransaction[]>(response.data) ?? [];
  }
}

export const walletRepository = new WalletRepositoryImpl();
