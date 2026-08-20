import type { Booking } from '@/domain/entities/booking';

export interface BookingRepository {
  getMine(page?: number): Promise<Booking[]>;
  getById(id: number): Promise<Booking>;
  cancel(id: number, reason?: string): Promise<Booking>;
}
