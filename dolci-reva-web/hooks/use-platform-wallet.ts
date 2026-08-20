"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { extractApiData } from "@/types/api-response.types";

export type PlatformWallet = {
  id: number;
  balance: number;
  currency: string;
  pending_withdrawals: number;
  processing_withdrawals: number;
};

export function usePlatformWallet(enabled = true) {
  return useQuery({
    queryKey: ["platform-wallet"],
    queryFn: async () => {
      const response = await api.get("/platform-wallet");
      const data = extractApiData<PlatformWallet>(response.data);
      if (!data) throw new Error("Wallet plateforme indisponible");
      return data;
    },
    enabled,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });
}
