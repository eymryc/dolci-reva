"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { extractApiData } from "@/types/api-response.types";

export type MoneyMovementType =
  | "CLIENT_CHARGE"
  | "CLIENT_REFUND"
  | "OWNER_RELEASE"
  | "PLATFORM_COMMISSION"
  | "PLATFORM_RETENTION"
  | "OWNER_WITHDRAWAL"
  | "OWNER_TRANSFER_SUCCESS"
  | "OWNER_TRANSFER_FAILED"
  | "WALLET_RECHARGE"
  | "CREDIT_ISSUED"
  | "CREDIT_REDEEMED";

export type MoneyMovement = {
  id: number;
  type: MoneyMovementType;
  direction: "IN" | "OUT" | "INTERNAL";
  amount: number;
  currency: string;
  status: string;
  booking_id?: number | null;
  user_id?: number | null;
  counterparty_user_id?: number | null;
  withdrawal_id?: number | null;
  wallet_id?: number | null;
  external_reference?: string | null;
  idempotency_key: string;
  meta?: Record<string, unknown> | null;
  occurred_at: string;
  user?: {
    id: number;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
  } | null;
  counterparty?: {
    id: number;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
  } | null;
  booking?: {
    id: number;
    booking_reference?: string;
    status?: string;
    payment_status?: string;
    total_price?: number;
  } | null;
};

export type FinanceSummary = {
  gmv: number;
  refunded: number;
  net_collected: number;
  commissions: number;
  retentions: number;
  owner_released: number;
  escrow_open_amount: number;
  escrow_open_count: number;
  pending_withdrawals: number;
  processing_withdrawals: number;
  platform_balance: number;
  currency: string;
};

export type EscrowBooking = {
  id: number;
  booking_reference?: string;
  status: string;
  payment_status: string;
  total_price: number;
  owner_amount: number;
  commission_amount: number;
  payment_reference?: string | null;
  start_date?: string;
  created_at?: string;
  customer?: {
    id: number;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
  } | null;
  owner?: {
    id: number;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
  } | null;
};

export function useFinanceSummary(enabled = true) {
  return useQuery({
    queryKey: ["finance-summary"],
    queryFn: async () => {
      const response = await api.get("/finance/summary");
      const data = extractApiData<FinanceSummary>(response.data);
      if (!data) throw new Error("Résumé finance indisponible");
      return data;
    },
    enabled,
    staleTime: 1000 * 20,
  });
}

export function useFinanceMovements(params: {
  page?: number;
  type?: string;
  enabled?: boolean;
}) {
  const page = params.page ?? 1;
  const type = params.type;
  return useQuery({
    queryKey: ["finance-movements", page, type],
    queryFn: async () => {
      const response = await api.get("/finance/movements", {
        params: {
          page,
          per_page: 20,
          ...(type ? { type } : {}),
        },
      });
      return response.data as {
        data: MoneyMovement[];
        meta?: {
          current_page: number;
          last_page: number;
          total: number;
        };
      };
    },
    enabled: params.enabled !== false,
  });
}

export function useFinanceEscrow(page = 1, enabled = true) {
  return useQuery({
    queryKey: ["finance-escrow", page],
    queryFn: async () => {
      const response = await api.get("/finance/escrow", {
        params: { page, per_page: 20 },
      });
      return response.data as {
        data: EscrowBooking[];
        meta?: {
          current_page: number;
          last_page: number;
          total: number;
        };
      };
    },
    enabled,
  });
}
