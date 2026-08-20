import type { Amenity } from './amenity';
import type { GalleryImage } from './residence';

export interface Hotel {
  id: number;
  owner_id: number;
  name: string;
  description?: string | null;
  address: string;
  city: string;
  country: string;
  star_rating?: number | null;
  is_active: boolean;
  amenities: Amenity[];
  main_image_url?: string | null;
  gallery_images: GalleryImage[];
}

export interface HotelRoom {
  id: number;
  hotel_id: number;
  name?: string | null;
  display_name?: string | null;
  description?: string | null;
  type: string;
  max_guests: number;
  price: string;
  standing: string;
  is_available?: boolean;
  is_active: boolean;
  main_image_url?: string | null;
}

/** hotel_room_id est obligatoire depuis la correction du bug de prix côté API (2026-07-01). */
export interface HotelBookingData {
  hotel_room_id: number;
  start_date: string;
  end_date: string;
  guests: number;
  notes?: string;
}

export interface HotelBookingResponse {
  booking: {
    id: number;
    booking_reference: string;
    total_price: string;
  };
  payment_url: string | null;
}
