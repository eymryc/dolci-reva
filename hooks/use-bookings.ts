import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { usePermissions } from './use-permissions';

// Types
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  type: string;
  email_verified_at?: string | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Bookable {
  id: number;
  owner_id: number;
  name: string;
  description?: string | null;
  address: string;
  city: string;
  country: string;
  latitude?: string | null;
  longitude?: string | null;
  type: string;
  max_guests: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  piece_number?: number | null;
  price: string;
  standing: string;
  average_rating: string;
  total_ratings: number;
  rating_count: number;
  is_available: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface Booking {
  id: number;
  customer_id: number;
  owner_id: number;
  bookable_type: string;
  bookable_id: number;
  start_date: string;
  end_date: string;
  guests: number;
  booking_reference: string;
  total_price: string;
  commission_amount: string;
  owner_amount: string;
  status: 'CONFIRME' | 'EN_ATTENTE' | 'ANNULE' | 'TERMINE';
  payment_status: 'PAYE' | 'EN_ATTENTE' | 'REFUSE' | 'REMBOURSE';
  notes?: string | null;
  cancellation_reason?: string | null;
  cancelled_at?: string | null;
  confirmed_at?: string | null;
  created_at: string;
  updated_at: string;
  customer: User;
  owner: User;
  bookable: Bookable;
}

export interface PaginatedBookingsResponse {
  data: Booking[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

export interface BookingFormData {
  name: string;
  venue: string;
  date: string;
  time: string;
}

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

      const response = await api.get('/bookings', { params });
      return response.data as PaginatedBookingsResponse;
    },
  });
}

// GET - Fetch single booking
export function useBooking(id: number) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: async () => {
      const response = await api.get(`/bookings/${id}`);
      return response.data.data as Booking;
    },
    enabled: !!id,
  });
}

// POST - Create booking
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BookingFormData) => {
      const response = await api.post('/bookings', data);
      return response.data.data as Booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Réservation créée avec succès !');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { message?: string; error?: string } } };
      toast.error(axiosError.response?.data?.message || axiosError.response?.data?.error || 'Erreur lors de la création de la réservation');
    },
  });
}

// PUT - Update booking
export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<BookingFormData> }) => {
      const response = await api.put(`/bookings/${id}`, data);
      return response.data.data as Booking;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', variables.id] });
      toast.success('Réservation mise à jour avec succès !');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { message?: string; error?: string } } };
      toast.error(axiosError.response?.data?.message || axiosError.response?.data?.error || 'Erreur lors de la mise à jour de la réservation');
    },
  });
}

// PUT - Cancel booking
export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason?: string }) => {
      const response = await api.put(`/bookings/${id}/cancel`, { cancellation_reason: reason });
      return response.data.data as Booking;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', variables.id] });
      toast.success('Réservation annulée avec succès !');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { message?: string; error?: string } } };
      toast.error(axiosError.response?.data?.message || axiosError.response?.data?.error || 'Erreur lors de l\'annulation de la réservation');
    },
  });
}

// DELETE - Delete booking
export function useDeleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/bookings/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Réservation supprimée avec succès !');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { message?: string; error?: string } } };
      toast.error(axiosError.response?.data?.message || axiosError.response?.data?.error || 'Erreur lors de la suppression de la réservation');
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

