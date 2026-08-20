import type { Receipt } from '@/domain/entities/receipt';

export interface ReceiptRepository {
  getForBooking(bookingId: number): Promise<Receipt>;
}
