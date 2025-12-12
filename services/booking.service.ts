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
import type { Booking, BookingFormData } from '@/types/entities/booking.types';

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
   * Crée une nouvelle réservation
   */
  async create(data: BookingFormData): Promise<Booking> {
    const response = await api.post<ApiResponse<Booking>>('/bookings', data);
    const booking = extractApiData<Booking>(response.data);
    if (!booking) throw new Error('Failed to create booking');
    return booking;
  }

  /**
   * Met à jour une réservation
   */
  async update(id: number, data: Partial<BookingFormData>): Promise<Booking> {
    const response = await api.put<ApiResponse<Booking>>(`/bookings/${id}`, data);
    const booking = extractApiData<Booking>(response.data);
    if (!booking) throw new Error('Failed to update booking');
    return booking;
  }

  /**
   * Annule une réservation
   */
  async cancel(id: number, reason?: string): Promise<Booking> {
    const response = await api.put<ApiResponse<Booking>>(`/bookings/${id}/cancel`, {
      cancellation_reason: reason,
    });
    const booking = extractApiData<Booking>(response.data);
    if (!booking) throw new Error('Failed to cancel booking');
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






