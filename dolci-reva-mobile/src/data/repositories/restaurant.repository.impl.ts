import { apiClient } from '@/core/api/client';
import { extractApiData } from '@/core/api/response';
import type {
  Restaurant,
  RestaurantBookingData,
  RestaurantBookingResponse,
} from '@/domain/entities/restaurant';
import type { RestaurantFilters, RestaurantRepository } from '@/domain/repositories/restaurant.repository';

export class RestaurantRepositoryImpl implements RestaurantRepository {
  async getAllPublic(filters?: RestaurantFilters): Promise<Restaurant[]> {
    const response = await apiClient.get('/public/restaurants', { params: filters });
    return extractApiData<Restaurant[]>(response.data) ?? [];
  }

  async getByIdPublic(id: number): Promise<Restaurant> {
    const response = await apiClient.get(`/public/restaurants/${id}`);
    const restaurant = extractApiData<Restaurant>(response.data);
    if (!restaurant) throw new Error('Restaurant introuvable');
    return restaurant;
  }

  async book(restaurantId: number, data: RestaurantBookingData): Promise<RestaurantBookingResponse> {
    const response = await apiClient.post(`/restaurants/${restaurantId}/book`, data);
    return response.data;
  }
}

export const restaurantRepository = new RestaurantRepositoryImpl();
