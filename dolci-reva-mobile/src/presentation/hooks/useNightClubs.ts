import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { nightClubRepository } from '@/data/repositories/nightclub.repository.impl';
import type { NightClubFilters } from '@/domain/repositories/nightclub.repository';
import type { NightClubBookingData } from '@/domain/entities/nightclub';

export function usePublicNightClubs(filters?: NightClubFilters) {
  return useQuery({
    queryKey: ['night-clubs', filters],
    queryFn: () => nightClubRepository.getAllPublic(filters),
  });
}

export function usePublicNightClub(id: number) {
  return useQuery({
    queryKey: ['night-clubs', id],
    queryFn: () => nightClubRepository.getByIdPublic(id),
    enabled: !!id,
  });
}

export function useBookNightClub(nightClubId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NightClubBookingData) => nightClubRepository.book(nightClubId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
