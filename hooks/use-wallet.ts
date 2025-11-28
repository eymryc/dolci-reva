import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { ApiResponse, ValidationErrorResponse, PaginatedApiResponse } from '@/types/api-responses';

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

export type PaginatedTransactionsResponse = PaginatedApiResponse<Transaction>;

// GET - Fetch wallet transactions with pagination
export function useWalletTransactions(page: number = 1) {
  return useQuery({
    queryKey: ['wallet_transactions', page],
    queryFn: async () => {
      const response = await api.get('/wallet_transactions', { params: { page } });
      return response.data as PaginatedTransactionsResponse;
    },
  });
}

export function useRechargeWallet() {
  return useMutation({
    mutationFn: async (data: RechargeWalletData) => {
      const response = await api.post<ApiResponse<RechargeWalletResponse>>('/wallets/recharge', data);
      console.log(response);
      return {
        data: response.data.data as RechargeWalletResponse,
        message: response.data.message,
      };
    },
    onSuccess: (result) => {
      console.log(result);
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
      const axiosError = error as {
        response?: {
          status?: number;
          data?: ValidationErrorResponse | { message?: string; error?: string };
        };
      };
      
      if (axiosError.response?.status === 422) {
        const validationError = axiosError.response.data as ValidationErrorResponse;
        if (validationError?.data) {
          const errorMessages = Object.values(validationError.data).flat().join(', ');
          toast.error(errorMessages || validationError.message || 'Erreurs de validation');
        } else {
          toast.error(validationError?.message || 'Erreurs de validation');
        }
      } else {
        const errorData = axiosError.response?.data as { message?: string; error?: string };
        toast.error(
          errorData?.message ||
          errorData?.error ||
          'Erreur lors de l\'initialisation de la recharge'
        );
      }
    },
  });
}

