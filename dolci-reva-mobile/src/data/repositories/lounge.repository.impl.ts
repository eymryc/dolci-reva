import { apiClient } from '@/core/api/client';
import { extractApiData } from '@/core/api/response';
import type { Lounge, LoungeBookingData, LoungeBookingResponse } from '@/domain/entities/lounge';
import type { LoungeFilters, LoungeRepository } from '@/domain/repositories/lounge.repository';

export class LoungeRepositoryImpl implements LoungeRepository {
  async getAllLounges(filters?: LoungeFilters): Promise<Lounge[]> {
    const response = await apiClient.get('/public/lounges', { params: filters });
    return extractApiData<Lounge[]>(response.data) ?? [];
  }

  async getAllBars(filters?: LoungeFilters): Promise<Lounge[]> {
    const response = await apiClient.get('/public/bars', { params: filters });
    return extractApiData<Lounge[]>(response.data) ?? [];
  }

  async getByIdPublic(id: number): Promise<Lounge> {
    const response = await apiClient.get(`/public/lounges/${id}`);
    const lounge = extractApiData<Lounge>(response.data);
    if (!lounge) throw new Error('Établissement introuvable');
    return lounge;
  }

  async book(loungeId: number, data: LoungeBookingData): Promise<LoungeBookingResponse> {
    const response = await apiClient.post(`/lounges/${loungeId}/book`, data);
    return response.data;
  }
}

export const loungeRepository = new LoungeRepositoryImpl();
