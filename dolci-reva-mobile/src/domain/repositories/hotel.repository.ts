import type { Hotel, HotelRoom, HotelBookingData, HotelBookingResponse } from '@/domain/entities/hotel';

export interface HotelFilters {
  city?: string;
  search?: string;
}

export interface HotelRepository {
  getAllPublic(filters?: HotelFilters): Promise<Hotel[]>;
  getByIdPublic(id: number): Promise<Hotel>;
  getRooms(hotelId: number): Promise<HotelRoom[]>;
  book(hotelId: number, data: HotelBookingData): Promise<HotelBookingResponse>;
}
