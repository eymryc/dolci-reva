import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { residenceRepository } from '@/data/repositories/residence.repository.impl';
import type { ResidenceFilters } from '@/domain/repositories/residence.repository';
import type { ResidenceBookingData } from '@/domain/entities/residence';

export function usePublicResidences(filters?: ResidenceFilters) {
  return useQuery({
    queryKey: ['residences', filters],
    queryFn: () => residenceRepository.getAllPublic(filters),
  });
}

export function usePublicResidence(id: number) {
  return useQuery({
    queryKey: ['residences', id],
    queryFn: () => residenceRepository.getByIdPublic(id),
    enabled: !!id,
  });
}

export function useBookResidence(residenceId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ResidenceBookingData) => residenceRepository.book(residenceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
