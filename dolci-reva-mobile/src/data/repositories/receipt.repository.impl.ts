import { apiClient } from '@/core/api/client';
import type { Receipt } from '@/domain/entities/receipt';
import type { ReceiptRepository } from '@/domain/repositories/receipt.repository';

interface ReceiptApiResponse {
  success: boolean;
  data: Receipt;
}

export class ReceiptRepositoryImpl implements ReceiptRepository {
  async getForBooking(bookingId: number): Promise<Receipt> {
    const response = await apiClient.get<ReceiptApiResponse>(`/bookings/${bookingId}/receipt`);
    return response.data.data;
  }
}

export const receiptRepository = new ReceiptRepositoryImpl();
