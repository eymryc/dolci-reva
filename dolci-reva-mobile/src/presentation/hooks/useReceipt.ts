import { useQuery } from '@tanstack/react-query';
import { receiptRepository } from '@/data/repositories/receipt.repository.impl';

export function useReceipt(bookingId: number) {
  return useQuery({
    queryKey: ['receipt', bookingId],
    queryFn: () => receiptRepository.getForBooking(bookingId),
    enabled: !!bookingId,
  });
}
