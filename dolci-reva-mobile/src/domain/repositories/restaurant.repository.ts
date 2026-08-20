import type { Restaurant, RestaurantBookingData, RestaurantBookingResponse } from '@/domain/entities/restaurant';

export interface RestaurantFilters {
  city?: string;
  search?: string;
}

export interface RestaurantRepository {
  getAllPublic(filters?: RestaurantFilters): Promise<Restaurant[]>;
  getByIdPublic(id: number): Promise<Restaurant>;
  book(restaurantId: number, data: RestaurantBookingData): Promise<RestaurantBookingResponse>;
}
