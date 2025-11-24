import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { ApiResponse, ValidationErrorResponse } from '@/types/api-responses';

export interface RechargeWalletData {
  amount: number;
}

export interface RechargeWalletResponse {
  payment_url: string;
  reference: string;
  amount: number;
}

export function useRechargeWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RechargeWalletData) => {
      const response = await api.post<ApiResponse<RechargeWalletResponse>>('/wallets/recharge', data);
      return response.data.data as RechargeWalletResponse;
    },
    onSuccess: (data) => {
      // Rediriger vers l'URL de paiement
      if (data.payment_url) {
        window.location.href = data.payment_url;
      }
      toast.success('Redirection vers le paiement...');
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

