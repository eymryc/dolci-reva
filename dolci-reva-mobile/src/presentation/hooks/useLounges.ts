import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { loungeRepository } from '@/data/repositories/lounge.repository.impl';
import type { LoungeFilters } from '@/domain/repositories/lounge.repository';
import type { LoungeBookingData } from '@/domain/entities/lounge';

export function usePublicLounges(filters?: LoungeFilters) {
  return useQuery({
    queryKey: ['lounges', filters],
    queryFn: () => loungeRepository.getAllLounges(filters),
  });
}

export function usePublicBars(filters?: LoungeFilters) {
  return useQuery({
    queryKey: ['bars', filters],
    queryFn: () => loungeRepository.getAllBars(filters),
  });
}

export function usePublicLounge(id: number) {
  return useQuery({
    queryKey: ['lounges', id],
    queryFn: () => loungeRepository.getByIdPublic(id),
    enabled: !!id,
  });
}

export function useBookLounge(loungeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoungeBookingData) => loungeRepository.book(loungeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
