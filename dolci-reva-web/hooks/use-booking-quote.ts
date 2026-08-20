"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { extractApiData } from "@/types/api-response.types";

export type BookingQuoteType =
  | "residence"
  | "hotel"
  | "restaurant"
  | "lounge"
  | "bar"
  | "night_club";

export type BookingQuotePayload = {
  start_date: string;
  end_date: string;
  guests: number;
  hotel_room_id?: number;
  restaurant_table_ids?: number[];
  lounge_table_ids?: number[];
  night_club_area_ids?: number[];
};

export type BookingQuoteLine = {
  label: string;
  amount: number;
};

export type BookingQuoteCancellation = {
  summary: string;
  free_cancel_hours: number;
  late_refund_percent: number;
  vertical?: string;
};

export type BookingQuote = {
  total: number;
  currency: string;
  lines: BookingQuoteLine[];
  cancellation: BookingQuoteCancellation;
  nights?: number;
  unit_price?: number;
  guests?: number;
  hotel_room_id?: number;
};

/**
 * Devis serveur pour le FO.
 * Activer (`enabled`) seulement quand dates + guests (et options requises) sont valides.
 */
export function useBookingQuote(
  type: BookingQuoteType,
  id: number,
  payload: BookingQuotePayload | null,
  enabled: boolean
) {
  return useQuery({
    queryKey: ["booking-quote", type, id, payload],
    queryFn: async () => {
      if (!payload) return null;
      const response = await api.post(
        `/public/bookings/quote/${type}/${id}`,
        payload
      );
      return extractApiData<BookingQuote>(response.data);
    },
    enabled: Boolean(enabled && id && payload),
    staleTime: 30_000,
  });
}
