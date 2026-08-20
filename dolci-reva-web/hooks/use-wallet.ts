import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { ApiResponse, PaginatedApiResponse, extractApiData, extractApiMessage } from '@/types/api-response.types';
import { logger } from '@/lib/logger';
import { handleError } from '@/lib/error-handler';

export interface RechargeWalletData {
  amount: number;
}

export interface RechargeWalletResponse {
  payment_url: string;
  reference: string;
  amount: number;
}

export interface TransactionUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface Transaction {
  id: number;
  wallet_id: string;
  type: string;
  transaction_type?: string;
  transaction_category: string;
  amount: string;
  reason: string;
  performed_by: string;
  performed_by_user: TransactionUser;
  created_at: string;
  updated_at: string;
}

// PaginatedTransactionsResponse est maintenant PaginatedApiResponse<Transaction>

/**
 * Catégories de transactions disponibles
 */
export enum TransactionCategory {
  RECHARGE = 'RECHARGE',
  BOOKING = 'BOOKING',
  COMMISSION = 'COMMISSION',
  WITHDRAWAL = 'WITHDRAWAL',
}

/**
 * Hook pour récupérer les transactions du portefeuille avec pagination
 * 
 * @param page - Numéro de page pour la pagination (défaut: 1)
 * @param transaction_category - Catégorie de transaction à filtrer (défaut: BOOKING)
 * @returns {Object} Objet contenant les données, l'état de chargement, et les fonctions de rafraîchissement
 * 
 * @example
 * ```tsx
 * // Récupérer toutes les transactions BOOKING
 * const { data, isLoading } = useWalletTransactions(1, TransactionCategory.BOOKING);
 * 
 * // Récupérer les transactions RECHARGE
 * const { data: recharges } = useWalletTransactions(1, TransactionCategory.RECHARGE);
 * ```
 */
export function useWalletTransactions(page: number = 1, transaction_category: TransactionCategory = TransactionCategory.BOOKING) {
  return useQuery({
    queryKey: ['wallet_transactions', page, transaction_category],
    queryFn: async () => {
      const params: Record<string, string | number> = { 
        page,
        transaction_category 
      };
      const response = await api.get('/wallet_transactions', { params });
      return response.data as PaginatedApiResponse<Transaction>;
    },
  });
}

/**
 * Hook pour initialiser une recharge de portefeuille
 * 
 * Redirige automatiquement vers l'URL de paiement après succès.
 * 
 * @returns {Object} Mutation object avec les fonctions mutate, isPending, etc.
 * 
 * @example
 * ```tsx
 * const rechargeMutation = useRechargeWallet();
 * 
 * const handleRecharge = () => {
 *   rechargeMutation.mutate({ amount: 5000 });
 * };
 * ```
 */
export function useRechargeWallet() {
  return useMutation({
    mutationFn: async (data: RechargeWalletData) => {
      const response = await api.post<ApiResponse<RechargeWalletResponse>>('/wallets/recharge', data);
      logger.debug('Wallet recharge response:', response);
      const rechargeData = extractApiData<RechargeWalletResponse>(response.data);
      const message = extractApiMessage(response.data);
      if (!rechargeData) throw new Error('Failed to initialize wallet recharge');
      return {
        data: rechargeData,
        message: message || '',
      };
    },
    onSuccess: (result) => {
      logger.info('Wallet recharge successful:', result);
      // Afficher le message de succès
      toast.success(result.message || 'Redirection vers le paiement...');
      
      // Rediriger vers l'URL de paiement après un délai pour laisser le temps au toast de s'afficher
      if (result.data.payment_url) {
        setTimeout(() => {
          window.location.href = result.data.payment_url;
        }, 500); // Délai de 500 millisecondes
      }
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: 'Erreur lors de l\'initialisation de la recharge' });
    },
  });
}

