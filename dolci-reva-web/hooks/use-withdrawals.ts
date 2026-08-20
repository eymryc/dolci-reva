"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import { extractApiData } from "@/types/api-response.types";
import { handleError } from "@/lib/error-handler";

export type WithdrawalStatus =
  | "PENDING"
  | "PROCESSING"
  | "APPROVED"
  | "REJECTED"
  | "FAILED";

export type Withdrawal = {
  id: number;
  user_id: number;
  amount: number | string;
  status: WithdrawalStatus;
  transfer_reference?: string | null;
  transfer_code?: string | null;
  payout_snapshot?: Record<string, unknown> | null;
  failure_reason?: string | null;
  reviewed_by?: number | null;
  reviewed_at?: string | null;
  created_at?: string;
  updated_at?: string;
  user?: {
    id: number;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
};

export function useWithdrawals() {
  return useQuery({
    queryKey: ["withdrawals"],
    queryFn: async () => {
      const response = await api.get("/withdrawals");
      const data = extractApiData<Withdrawal[]>(response.data);
      if (Array.isArray(data)) return data;
      // Laravel Resource collection may nest under data already extracted
      return (response.data?.data as Withdrawal[]) || [];
    },
  });
}

export function useCreateWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: number) => {
      const response = await api.post("/withdrawals", { amount });
      const data = extractApiData<Withdrawal>(response.data);
      if (!data) throw new Error("Échec de la demande de retrait");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      toast.success("Demande de retrait envoyée");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Impossible de créer le retrait" });
    },
  });
}

export function useApproveWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.patch(`/withdrawals/${id}/approve`);
      return extractApiData<Withdrawal>(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["platform-wallet"] });
      toast.success("Retrait approuvé / transfert initié");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de l'approbation" });
    },
  });
}

export function useApproveWithdrawalManual() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/withdrawals/${id}/approve-manual`);
      return extractApiData<Withdrawal>(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["platform-wallet"] });
      toast.success("Retrait validé manuellement");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la validation manuelle" });
    },
  });
}

export function useRejectWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.patch(`/withdrawals/${id}/reject`);
      return extractApiData<Withdrawal>(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["platform-wallet"] });
      toast.success("Retrait rejeté — solde recrédité");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec du rejet" });
    },
  });
}
