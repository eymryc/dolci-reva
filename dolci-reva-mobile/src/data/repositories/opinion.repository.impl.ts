import { apiClient } from '@/core/api/client';
import { extractApiData } from '@/core/api/response';
import type { Opinion } from '@/domain/entities/opinion';
import type { OpinionRepository } from '@/domain/repositories/opinion.repository';

export class OpinionRepositoryImpl implements OpinionRepository {
  async getForResidence(residenceId: number): Promise<Opinion[]> {
    const response = await apiClient.get(`/public/opinions/${residenceId}`);
    return extractApiData<Opinion[]>(response.data) ?? [];
  }
}

export const opinionRepository = new OpinionRepositoryImpl();
