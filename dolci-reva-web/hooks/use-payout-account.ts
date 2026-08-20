"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import { extractApiData } from "@/types/api-response.types";
import { handleError } from "@/lib/error-handler";

export type PayoutChannel = "wave" | "orange_money" | "mtn" | "moov" | "bank";

export type PayoutAccount = {
  id: number;
  user_id: number;
  channel: PayoutChannel;
  account_name: string;
  account_number: string;
  bank_code?: string | null;
  bank_name?: string | null;
  currency: string;
  paystack_recipient_code?: string | null;
  paystack_recipient_type?: string | null;
  is_verified: boolean;
};

export type PaystackBank = {
  name: string;
  code: string;
  slug?: string;
  type?: string;
  currency?: string;
  active?: boolean;
};

export type UpsertPayoutAccountPayload = {
  channel: PayoutChannel;
  account_name: string;
  account_number: string;
  bank_code?: string;
  bank_name?: string;
  currency?: string;
};

export function usePayoutAccount() {
  return useQuery({
    queryKey: ["payout-account"],
    queryFn: async () => {
      const response = await api.get("/payout-account");
      return extractApiData<PayoutAccount | null>(response.data) ?? null;
    },
  });
}

export function useUpsertPayoutAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpsertPayoutAccountPayload) => {
      const response = await api.put("/payout-account", payload);
      const data = extractApiData<PayoutAccount>(response.data);
      if (!data) throw new Error("Échec de l'enregistrement du compte de versement");
      return {
        account: data,
        message: (response.data as { message?: string })?.message,
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["payout-account"] });
      toast.success(result.message || "Compte de versement enregistré");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Impossible d'enregistrer le compte de versement" });
    },
  });
}

export function usePaystackBanks(currency = "XOF", type?: string, enabled = true) {
  return useQuery({
    queryKey: ["paystack-banks", currency, type],
    queryFn: async () => {
      const response = await api.get("/paystack/banks", {
        params: { currency, ...(type ? { type } : {}) },
      });
      return extractApiData<PaystackBank[]>(response.data) || [];
    },
    enabled,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
}
