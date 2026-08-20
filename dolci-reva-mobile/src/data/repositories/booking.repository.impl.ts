import { apiClient } from '@/core/api/client';
import { extractApiData } from '@/core/api/response';
import type { Booking } from '@/domain/entities/booking';
import type { BookingRepository } from '@/domain/repositories/booking.repository';

export class BookingRepositoryImpl implements BookingRepository {
  async getMine(page = 1): Promise<Booking[]> {
    const response = await apiClient.get('/bookings', { params: { page } });
    return extractApiData<Booking[]>(response.data) ?? [];
  }

  async getById(id: number): Promise<Booking> {
    const response = await apiClient.get(`/bookings/${id}`);
    const booking = extractApiData<Booking>(response.data);
    if (!booking) {
      throw new Error('Réservation introuvable');
    }
    return booking;
  }

  async cancel(id: number, reason?: string): Promise<Booking> {
    const response = await apiClient.patch(`/bookings/${id}/cancel`, {
      cancellation_reason: reason,
    });
    return extractApiData<Booking>(response.data) as Booking;
  }
}

export const bookingRepository = new BookingRepositoryImpl();
