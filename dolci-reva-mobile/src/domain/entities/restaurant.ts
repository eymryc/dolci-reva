import type { Amenity } from './amenity';
import type { GalleryImage } from './residence';

export interface OpeningHours {
  monday?: { open: string; close: string };
  tuesday?: { open: string; close: string };
  wednesday?: { open: string; close: string };
  thursday?: { open: string; close: string };
  friday?: { open: string; close: string };
  saturday?: { open: string; close: string };
  sunday?: { open: string; close: string };
}

export interface Restaurant {
  id: number;
  owner_id: number;
  name: string;
  description?: string | null;
  address: string;
  city: string;
  country: string;
  opening_hours?: OpeningHours | string | null;
  is_active: boolean;
  amenities: Amenity[];
  main_image_url?: string | null;
  gallery_images: GalleryImage[];
}

/** Même contrat que la réservation web (pas de sélection de table côté client). */
export interface RestaurantBookingData {
  start_date: string;
  end_date: string;
  guests: number;
  notes?: string;
}

export interface RestaurantBookingResponse {
  booking: { id: number; booking_reference: string; total_price: string };
  payment_url: string | null;
}
