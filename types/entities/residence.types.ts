/**
 * Types d'entités pour les résidences
 */

import type { Amenity, Owner } from '@/types/common';

export interface GalleryImage {
  id: number;
  name: string;
  file_name: string;
  mime_type: string;
  size: number;
  collection_name: string;
  url: string;
  thumb_url: string;
  medium_url?: string;
  large_url?: string;
  created_at: string;
}

export interface AvailabilityStatus {
  status: string;
  message: string;
  next_available_date: string;
}

export interface Residence {
  id: number;
  owner_id: number;
  name: string;
  description?: string | null;
  address: string;
  city: string;
  country: string;
  latitude?: string | null;
  longitude?: string | null;
  type: string;
  max_guests: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  piece_number?: number | null;
  price: string;
  standing: string;
  average_rating: string;
  total_ratings: number;
  rating_count: number;
  rating_percentage: number;
  stars: number;
  has_ratings: boolean;
  is_available: boolean;
  is_active: boolean;
  availability_status: AvailabilityStatus;
  next_available_date: string;
  unavailable_dates: string[];
  created_at: string;
  updated_at: string;
  amenities: Amenity[];
  main_image_url?: string | null;
  main_image_thumb_url?: string | null;
  gallery_images: GalleryImage[];
  all_images: GalleryImage[];
  owner: Owner;
}

export interface ResidenceFormData {
  name: string;
  description?: string;
  address: string;
  city: string;
  country: string;
  latitude?: string;
  longitude?: string;
  type: string;
  max_guests: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  piece_number?: number | null;
  price: string;
  standing: string;
  owner_id?: number;
  amenities?: number[];
}

export interface ResidenceBookingData {
  start_date: string;
  end_date: string;
  guests: number;
}

export interface ResidenceBookingResponse {
  data?: unknown;
  payment_url?: string;
  message?: string;
}






