import { apiClient } from '@/core/api/client';
import { extractApiData } from '@/core/api/response';
import type {
  NightClub,
  NightClubBookingData,
  NightClubBookingResponse,
} from '@/domain/entities/nightclub';
import type { NightClubFilters, NightClubRepository } from '@/domain/repositories/nightclub.repository';

export class NightClubRepositoryImpl implements NightClubRepository {
  async getAllPublic(filters?: NightClubFilters): Promise<NightClub[]> {
    const response = await apiClient.get('/public/night-clubs', { params: filters });
    return extractApiData<NightClub[]>(response.data) ?? [];
  }

  async getByIdPublic(id: number): Promise<NightClub> {
    const response = await apiClient.get(`/public/night-clubs/${id}`);
    const nightClub = extractApiData<NightClub>(response.data);
    if (!nightClub) throw new Error('Établissement introuvable');
    return nightClub;
  }

  async book(nightClubId: number, data: NightClubBookingData): Promise<NightClubBookingResponse> {
    const response = await apiClient.post(`/night-clubs/${nightClubId}/book`, data);
    return response.data;
  }
}

export const nightClubRepository = new NightClubRepositoryImpl();
