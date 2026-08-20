import type { Opinion } from '@/domain/entities/opinion';

export interface OpinionRepository {
  getForResidence(residenceId: number): Promise<Opinion[]>;
}
