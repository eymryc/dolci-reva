import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { restaurantRepository } from '@/data/repositories/restaurant.repository.impl';
import type { RestaurantFilters } from '@/domain/repositories/restaurant.repository';
import type { RestaurantBookingData } from '@/domain/entities/restaurant';

export function usePublicRestaurants(filters?: RestaurantFilters) {
  return useQuery({
    queryKey: ['restaurants', filters],
    queryFn: () => restaurantRepository.getAllPublic(filters),
  });
}

export function usePublicRestaurant(id: number) {
  return useQuery({
    queryKey: ['restaurants', id],
    queryFn: () => restaurantRepository.getByIdPublic(id),
    enabled: !!id,
  });
}

export function useBookRestaurant(restaurantId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RestaurantBookingData) => restaurantRepository.book(restaurantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
