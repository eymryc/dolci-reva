import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { usePermissions } from './use-permissions';
import { handleError } from '@/lib/error-handler';
import { bookingService } from '@/services/booking.service';
import type { Booking, BookingFormData } from '@/types/entities/booking.types';

// Réexporter les types pour la compatibilité
export type { Booking, BookingFormData };

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

// POST - Create booking
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BookingFormData) => bookingService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Réservation créée avec succès !');
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: 'Erreur lors de la création de la réservation' });
    },
  });
}

// PUT - Update booking
export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<BookingFormData> }) =>
      bookingService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', variables.id] });
      toast.success('Réservation mise à jour avec succès !');
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: 'Erreur lors de la mise à jour de la réservation' });
    },
  });
}

// PUT - Cancel booking
export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      bookingService.cancel(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', variables.id] });
      toast.success('Réservation annulée avec succès !');
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: 'Erreur lors de l\'annulation de la réservation' });
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
  type: string;
  standing: string;
  max_guests: string;
  bedrooms: number | null;
  bathrooms: number | null;
  piece_number: number | null;
  price: number;
  average_rating: number;
  rating_count: string;
}

export interface ReceiptPropertyDetails {
  id: number;
  name: string;
  description: string;
  address: ReceiptPropertyAddress;
  residence: ReceiptPropertyResidence;
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
  owner: ReceiptOwner;
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
      const response = await api.get(`/payments/bookings/${bookingId}/receipt`);
      return response.data as ReceiptResponse;
    },
    enabled: !!bookingId,
  });
}

