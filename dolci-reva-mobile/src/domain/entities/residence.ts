import type { Amenity } from './amenity';

export interface AvailabilityStatus {
  status: string;
  message: string;
  next_available_date: string;
}

export interface GalleryImage {
  id: number;
  url: string;
  thumb_url: string;
  medium_url?: string;
  large_url?: string;
}

export interface Residence {
  id: number;
  owner_id: number;
  name: string;
  description?: string | null;
  address: string;
  city: string;
  country: string;
  type: string;
  max_guests: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  price: string;
  standing: string;
  average_rating: string;
  rating_count: number;
  is_available: boolean;
  is_active: boolean;
  availability_status?: AvailabilityStatus;
  unavailable_dates?: string[];
  amenities: Amenity[];
  main_image_url?: string | null;
  main_image_thumb_url?: string | null;
  gallery_images: GalleryImage[];
}

export interface ResidenceBookingData {
  start_date: string;
  end_date: string;
  guests: number;
  notes?: string;
}

export interface ResidenceBookingResponse {
  booking: {
    id: number;
    booking_reference: string;
    total_price: string;
  };
  payment_url: string | null;
}
