/**
 * Service pour la gestion des réservations
 */

import api from '@/lib/axios';
import {
  ApiResponse,
  PaginatedApiResponse,
  SingleDataApiResponse,
  extractApiData,
} from '@/types/api-response.types';
import type { Booking } from '@/types/entities/booking.types';

export class BookingService {
  /**
   * Récupère toutes les réservations avec pagination
   */
  async getAll(params?: {
    page?: number;
    owner_id?: number;
    customer_id?: number;
  }): Promise<PaginatedApiResponse<Booking>> {
    const response = await api.get<PaginatedApiResponse<Booking>>('/bookings', {
      params,
    });
    return response.data;
  }

  /**
   * Récupère une réservation par son ID
   */
  async getById(id: number): Promise<Booking> {
    const response = await api.get<SingleDataApiResponse<Booking>>(`/bookings/${id}`);
    const booking = extractApiData<Booking>(response.data);
    if (!booking) throw new Error('Booking not found');
    return booking;
  }

  /**
   * Annule une réservation
   */
  async cancel(
    id: number,
    reason?: string,
    settlement?: "paystack" | "credit"
  ): Promise<Booking> {
    const response = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/cancel`, {
      cancellation_reason:
        reason?.trim() || "Annulation demandée par le client",
      ...(settlement ? { settlement } : {}),
    });
    const booking = extractApiData<Booking>(response.data);
    if (!booking) throw new Error("Failed to cancel booking");
    return booking;
  }

  /**
   * Supprime une réservation
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/bookings/${id}`);
  }
}

export const bookingService = new BookingService();






