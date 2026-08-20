import { apiClient } from '@/core/api/client';
import { extractApiData } from '@/core/api/response';
import type { Hotel, HotelRoom, HotelBookingData, HotelBookingResponse } from '@/domain/entities/hotel';
import type { HotelFilters, HotelRepository } from '@/domain/repositories/hotel.repository';

export class HotelRepositoryImpl implements HotelRepository {
  async getAllPublic(filters?: HotelFilters): Promise<Hotel[]> {
    const response = await apiClient.get('/public/hotels', { params: filters });
    return extractApiData<Hotel[]>(response.data) ?? [];
  }

  async getByIdPublic(id: number): Promise<Hotel> {
    const response = await apiClient.get(`/public/hotels/${id}`);
    const hotel = extractApiData<Hotel>(response.data);
    if (!hotel) throw new Error('Hôtel introuvable');
    return hotel;
  }

  async getRooms(hotelId: number): Promise<HotelRoom[]> {
    // Nécessite une authentification (route protégée côté API) ; les tabs sont
    // déjà gardés par la connexion donc c'est toujours le cas ici.
    const response = await apiClient.get(`/hotels/${hotelId}/rooms`);
    const rooms = extractApiData<HotelRoom[]>(response.data) ?? [];
    return rooms.filter((room) => room.is_active && room.is_available !== false);
  }

  async book(hotelId: number, data: HotelBookingData): Promise<HotelBookingResponse> {
    const response = await apiClient.post(`/hotels/${hotelId}/book`, data);
    return response.data;
  }
}

export const hotelRepository = new HotelRepositoryImpl();
