import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hotelRepository } from '@/data/repositories/hotel.repository.impl';
import type { HotelFilters } from '@/domain/repositories/hotel.repository';
import type { HotelBookingData } from '@/domain/entities/hotel';

export function usePublicHotels(filters?: HotelFilters) {
  return useQuery({
    queryKey: ['hotels', filters],
    queryFn: () => hotelRepository.getAllPublic(filters),
  });
}

export function usePublicHotel(id: number) {
  return useQuery({
    queryKey: ['hotels', id],
    queryFn: () => hotelRepository.getByIdPublic(id),
    enabled: !!id,
  });
}

export function useHotelRooms(hotelId: number) {
  return useQuery({
    queryKey: ['hotels', hotelId, 'rooms'],
    queryFn: () => hotelRepository.getRooms(hotelId),
    enabled: !!hotelId,
  });
}

export function useBookHotel(hotelId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: HotelBookingData) => hotelRepository.book(hotelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
