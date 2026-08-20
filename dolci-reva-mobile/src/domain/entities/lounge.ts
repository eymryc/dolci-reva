import type { Amenity } from './amenity';
import type { GalleryImage } from './residence';

/** Un "Bar" est un Lounge avec venue_type=BAR côté API — même modèle, même flux de réservation. */
export interface Lounge {
  id: number;
  owner_id: number;
  name: string;
  description?: string | null;
  address: string;
  city: string;
  country: string;
  venue_type: 'LOUNGE' | 'BAR';
  age_restriction?: number | null;
  smoking_area?: boolean;
  outdoor_seating?: boolean;
  is_active: boolean;
  amenities: Amenity[];
  main_image_url?: string | null;
  gallery_images: GalleryImage[];
}

export interface LoungeBookingData {
  start_date: string;
  end_date: string;
  guests: number;
  notes?: string;
}

export interface LoungeBookingResponse {
  booking: { id: number; booking_reference: string; total_price: string };
  payment_url: string | null;
}
