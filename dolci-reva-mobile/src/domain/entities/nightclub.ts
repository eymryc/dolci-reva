import type { Amenity } from './amenity';
import type { GalleryImage } from './residence';

export interface NightClub {
  id: number;
  owner_id: number;
  name: string;
  description?: string | null;
  address: string;
  city: string;
  country: string;
  age_restriction?: number | null;
  parking?: boolean;
  is_active: boolean;
  amenities: Amenity[];
  main_image_url?: string | null;
  gallery_images: GalleryImage[];
}

export interface NightClubBookingData {
  start_date: string;
  end_date: string;
  guests: number;
  notes?: string;
}

export interface NightClubBookingResponse {
  booking: { id: number; booking_reference: string; total_price: string };
  payment_url: string | null;
}
