import { useQuery } from '@tanstack/react-query';
import { opinionRepository } from '@/data/repositories/opinion.repository.impl';

export function usePublicOpinions(residenceId: number) {
  return useQuery({
    queryKey: ['opinions', residenceId],
    queryFn: () => opinionRepository.getForResidence(residenceId),
    enabled: !!residenceId,
  });
}
