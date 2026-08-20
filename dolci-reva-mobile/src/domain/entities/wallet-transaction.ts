export type TransactionCategory = 'RECHARGE' | 'BOOKING' | 'COMMISSION' | 'WITHDRAWAL';

export interface WalletTransaction {
  id: number;
  wallet_id: string;
  type: string;
  transaction_category: TransactionCategory;
  amount: string;
  reason: string;
  created_at: string;
}
