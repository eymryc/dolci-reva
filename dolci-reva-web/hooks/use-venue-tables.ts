"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { extractApiData } from "@/types/api-response.types";

export type VenueTable = {
  id: number;
  table_number: string;
  capacity: number;
  location?: string | null;
  table_type?: string | null;
  minimum_spend?: number | string | null;
  display_name?: string | null;
  location_description?: string | null;
  type_description?: string | null;
  availability?: {
    status: string;
    label?: string;
    free_from?: string | null;
    message?: string | null;
    next_booking_start?: string | null;
  } | null;
};

export type VenueKind = "restaurants" | "lounges" | "bars";

export function useVenueAvailableTables(
  kind: VenueKind,
  venueId: number,
  date: string | null,
  time: string | null,
  guests: number
) {
  return useQuery({
    queryKey: ["public", kind, venueId, "available-tables", date, time, guests],
    queryFn: async () => {
      const response = await api.get(`/public/${kind}/${venueId}/available-tables`, {
        params: { date, time, guests },
      });
      const data = extractApiData<VenueTable[]>(response.data);
      return data || [];
    },
    enabled: !!venueId && !!date && !!time && guests > 0,
    // Ne pas masquer une panne API comme une liste vide
    retry: 1,
  });
}
