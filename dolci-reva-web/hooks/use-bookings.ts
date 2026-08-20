import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { usePermissions } from './use-permissions';
import { handleError } from '@/lib/error-handler';
import { bookingService } from '@/services/booking.service';
import { extractApiData } from '@/types/api-response.types';
import type { Booking } from '@/types/entities/booking.types';

// Réexporter les types pour la compatibilité
export type { Booking };

// GET - Fetch all bookings with pagination
export function useBookings(page: number = 1) {
  const { canViewAll, getUserId, isOwner, isCustomer } = usePermissions();
  const userId = getUserId();

  return useQuery({
    queryKey: ['bookings', page, userId, canViewAll()],
    queryFn: async () => {
      const params: Record<string, string | number> = { page };
      
      // Si l'utilisateur n'est pas admin, filtrer selon son type
      if (!canViewAll() && userId) {
        if (isOwner()) {
          // Les propriétaires voient leurs réservations en tant que propriétaire
          params.owner_id = userId;
        } else if (isCustomer()) {
          // Les clients voient leurs réservations en tant que client
          params.customer_id = userId;
        }
      }

      return bookingService.getAll(params);
    },
  });
}

// GET - Fetch single booking
export function useBooking(id: number) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: () => bookingService.getById(id),
    enabled: !!id,
  });
}

// PATCH - Confirm booking (owner / admin)
export function useConfirmBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes?: string }) => {
      const response = await api.patch(`/bookings/${id}/confirm`, { notes });
      const booking = extractApiData<Booking>(response.data);
      if (!booking) throw new Error('Failed to confirm booking');
      return booking;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', variables.id] });
      toast.success('Réservation confirmée avec succès !');
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: 'Erreur lors de la confirmation' });
    },
  });
}

// PUT - Cancel booking
export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      reason,
      settlement,
    }: {
      id: number;
      reason?: string;
      settlement?: "paystack" | "credit";
    }) => bookingService.cancel(id, reason, settlement),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["customer-credits"] });
      toast.success(
        variables.settlement === "credit"
          ? "Réservation annulée — avoir Dolci crédité"
          : "Réservation annulée avec succès !"
      );
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Erreur lors de l'annulation de la réservation" });
    },
  });
}

// DELETE - Delete booking
export function useDeleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => {
      return bookingService.delete(id).then(() => id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Réservation supprimée avec succès !');
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: 'Erreur lors de la suppression de la réservation' });
    },
  });
}

// Types pour le reçu
export interface ReceiptInfo {
  booking_reference: string;
  payment_reference: string;
  payment_date: string;
  payment_status: string;
  escrow_status: string | null;
  funds_released_at?: string | null;
  generated_at: string;
}

export interface ReceiptCustomer {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
}

export interface ReceiptBooking {
  id: number;
  booking_reference: string;
  booking_type: string;
  start_date: string;
  end_date: string;
  guests: string;
  status: string;
  payment_status: string;
  confirmed_at: string;
  notes: string | null;
}

export interface ReceiptPropertyAddress {
  address: string;
  city: string;
  country: string;
  latitude: string;
  longitude: string;
}

export interface ReceiptPropertyResidence {
  type?: string | null;
  standing?: string | null;
  max_guests?: string | number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  piece_number?: number | null;
  price?: number | null;
  average_rating?: number | null;
  rating_count?: string | null;
}

export interface ReceiptPropertyDetails {
  id: number;
  name: string;
  description?: string | null;
  address: ReceiptPropertyAddress;
  /** Présent uniquement pour certaines résidences (legacy / enrichi). */
  residence?: ReceiptPropertyResidence | null;
  type?: string | null;
  standing?: string | null;
  max_guests?: string | number | null;
}

export interface ReceiptProperty {
  id: number;
  name: string;
  type: string;
  details: ReceiptPropertyDetails;
}

export interface ReceiptOwner {
  id: number;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

export interface ReceiptPayment {
  total_price: number;
  commission_amount: number | null;
  owner_amount: number | null;
  payment_fees: number | null;
  amount_received: number | null;
  payment_method: string;
  payment_currency: string;
  payment_reference: string;
  gateway_response: string | null;
  authorization_code: string | null;
  paystack_transaction_id: string | null;
}

export interface ReceiptQRCode {
  token: string;
  booking_id: number;
  booking_reference: string;
  qr_code_url: string;
  generated_at: string;
}

export interface ReceiptData {
  receipt_info: ReceiptInfo;
  customer: ReceiptCustomer;
  booking: ReceiptBooking;
  property: ReceiptProperty;
  owner: ReceiptOwner | null;
  payment: ReceiptPayment;
  qr_code: ReceiptQRCode;
}

export interface ReceiptResponse {
  success: boolean;
  data: ReceiptData;
}

// GET - Fetch receipt
export function useReceipt(bookingId: number) {
  return useQuery({
    queryKey: ['receipt', bookingId],
    queryFn: async () => {
      const response = await api.get(`/bookings/${bookingId}/receipt`);
      return response.data as ReceiptResponse;
    },
    enabled: !!bookingId,
  });
}

