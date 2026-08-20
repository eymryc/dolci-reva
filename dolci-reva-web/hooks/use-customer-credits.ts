"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { extractApiData } from "@/types/api-response.types";

export type CustomerCreditLine = {
  id: number;
  amount: number;
  remaining_amount: number;
  bonus_amount: number;
  source_booking_id?: number | null;
  expires_at?: string | null;
  status: string;
  created_at?: string;
};

export type CustomerCreditsPayload = {
  balance: number;
  bonus_percent: number;
  enabled: boolean;
  currency: string;
  credits: CustomerCreditLine[];
};

export function useCustomerCredits(enabled = true) {
  return useQuery({
    queryKey: ["customer-credits"],
    queryFn: async () => {
      const response = await api.get("/customer-credits");
      const data = extractApiData<CustomerCreditsPayload>(response.data);
      if (!data) throw new Error("Impossible de charger l'avoir Dolci");
      return data;
    },
    enabled,
    staleTime: 1000 * 30,
  });
}
