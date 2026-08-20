import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingRepository } from '@/data/repositories/booking.repository.impl';

export function useMyBookings(page = 1) {
  return useQuery({
    queryKey: ['bookings', page],
    queryFn: () => bookingRepository.getMine(page),
  });
}

export function useBooking(id: number) {
  return useQuery({
    queryKey: ['bookings', 'detail', id],
    queryFn: () => bookingRepository.getById(id),
    enabled: !!id,
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      bookingRepository.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
