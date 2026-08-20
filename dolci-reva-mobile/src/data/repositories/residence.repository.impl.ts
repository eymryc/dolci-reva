import { apiClient } from '@/core/api/client';
import { extractApiData } from '@/core/api/response';
import type {
  Residence,
  ResidenceBookingData,
  ResidenceBookingResponse,
} from '@/domain/entities/residence';
import type {
  ResidenceFilters,
  ResidenceRepository,
} from '@/domain/repositories/residence.repository';

export class ResidenceRepositoryImpl implements ResidenceRepository {
  async getAllPublic(filters?: ResidenceFilters): Promise<Residence[]> {
    const response = await apiClient.get('/public/residences', { params: filters });
    return extractApiData<Residence[]>(response.data) ?? [];
  }

  async getByIdPublic(id: number): Promise<Residence> {
    const response = await apiClient.get(`/public/residences/${id}`);
    const residence = extractApiData<Residence>(response.data);
    if (!residence) {
      throw new Error('Résidence introuvable');
    }
    return residence;
  }

  async book(residenceId: number, data: ResidenceBookingData): Promise<ResidenceBookingResponse> {
    const response = await apiClient.post(`/residences/${residenceId}/book`, data);
    return response.data;
  }
}

export const residenceRepository = new ResidenceRepositoryImpl();
