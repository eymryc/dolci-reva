/**
 * Types d'entités pour les hôtels et chambres
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

export interface Hotel {
  id: number;
  owner_id: number;
  name: string;
  description?: string | null;
  address: string;
  city: string;
  country: string;
  latitude?: string | null;
  longitude?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  star_rating?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  amenities: Amenity[];
  main_image_url?: string | null;
  main_image_thumb_url?: string | null;
  gallery_images: GalleryImage[];
  all_images: GalleryImage[];
  owner: Owner;
  rooms_count?: number;
}

export interface HotelFormData {
  name: string;
  description?: string;
  address: string;
  city: string;
  country: string;
  latitude?: string;
  longitude?: string;
  phone?: string;
  email?: string;
  website?: string;
  star_rating?: number | null;
  owner_id?: number;
  amenities?: number[];
}

export interface HotelRoom {
  id: number;
  hotel_id: number;
  name?: string | null;
  display_name?: string | null;
  description?: string | null;
  room_number?: string | null;
  type: string; // SINGLE, DOUBLE, TWIN, TRIPLE, QUAD, FAMILY
  max_guests: number;
  price: string; // string from API (e.g., "50000.00")
  standing: string; // STANDARD, SUPERIEUR, DELUXE, EXECUTIVE, SUITE, SUITE_JUNIOR, SUITE_EXECUTIVE, SUITE_PRESIDENTIELLE
  is_available?: boolean;
  is_active: boolean;
  amenities?: Amenity[];
  main_image_url?: string | null;
  main_image_thumb_url?: string | null;
  gallery_images: GalleryImage[];
  all_images?: GalleryImage[];
  created_at: string;
  updated_at: string;
  hotel?: Hotel;
}

export interface HotelRoomFormData {
  hotel_id: number;
  name?: string;
  description?: string;
  room_number?: string;
  type: string; // SINGLE, DOUBLE, TWIN, TRIPLE, QUAD, FAMILY
  max_guests: number;
  price: number; // number (min:0.01, max:99999.99)
  standing: string; // STANDARD, SUPERIEUR, DELUXE, EXECUTIVE, SUITE, SUITE_JUNIOR, SUITE_EXECUTIVE, SUITE_PRESIDENTIELLE
  amenities?: number[];
}

