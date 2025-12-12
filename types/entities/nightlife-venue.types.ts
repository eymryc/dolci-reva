/**
 * Types d'entités pour les nightlife venues, catégories de produits et produits
 */

import type { Amenity, Owner } from '@/types/common';
import type { GalleryImage } from './hotel.types';

export interface OpeningHours {
  monday?: { open: string; close: string };
  tuesday?: { open: string; close: string };
  wednesday?: { open: string; close: string };
  thursday?: { open: string; close: string };
  friday?: { open: string; close: string };
  saturday?: { open: string; close: string };
  sunday?: { open: string; close: string };
}

export interface NightlifeVenue {
  id: number;
  owner_id: number;
  name: string;
  description?: string | null;
  address: string;
  city: string;
  country: string;
  latitude?: string | null;
  longitude?: string | null;
  opening_hours?: OpeningHours | string | null; // Peut être un objet ou une string JSON
  age_restriction?: number | null; // 18 ou 21
  smoking_area?: boolean;
  outdoor_seating?: boolean;
  parking?: boolean;
  venue_type?: ("LOUNGE" | "NIGHT_CLUB" | "BAR")[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  amenities: Amenity[];
  main_image_url?: string | null;
  main_image_thumb_url?: string | null;
  gallery_images: GalleryImage[];
  all_images?: GalleryImage[];
  owner?: Owner;
  lounge_product_categories_count?: number;
  products_count?: number;
  tables?: unknown[]; // Tableaux de tables du venue
}

export interface NightlifeVenueFormData {
  name: string;
  description?: string;
  address: string;
  city: string;
  country: string;
  latitude?: string;
  longitude?: string;
  opening_hours?: OpeningHours;
  age_restriction?: number | null;
  smoking_area?: boolean;
  outdoor_seating?: boolean;
  parking?: boolean;
  venue_type?: ("LOUNGE" | "NIGHT_CLUB" | "BAR")[] | null;
  is_active?: boolean;
  owner_id?: number;
  amenities?: number[];
}

export interface NightlifeVenueProductCategory {
  id: number;
  lounge_id?: number; // Pour compatibilité
  venue_id?: number; // Champ retourné par l'API
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  lounge?: NightlifeVenue;
  products_count?: number;
}

export interface NightlifeVenueProductCategoryFormData {
  name: string;
  description?: string;
}

export interface NightlifeVenueProductVariant {
  name: string;
  price_modifier: number;
}

export interface NightlifeVenueProductOption {
  name: string;
  price: number;
}

export interface NightlifeVenueProduct {
  id: number;
  lounge_id: number;
  category_id: number;
  name: string;
  description?: string | null;
  price: number; // number from API (e.g., 3500)
  currency?: string; // e.g., "XOF"
  is_available?: number; // 1 or 0
  popularity_score?: number;
  total_orders?: number;
  variants?: NightlifeVenueProductVariant[];
  options?: NightlifeVenueProductOption[];
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  category?: NightlifeVenueProductCategory;
  lounge?: NightlifeVenue;
  main_image_url?: string | null;
  main_image_thumb_url?: string | null;
  main_image_medium_url?: string | null;
  gallery_images: GalleryImage[];
}

export interface NightlifeVenueProductFormData {
  lounge_id: number;
  category_id: number;
  name: string;
  description?: string;
  price: number; // number (min:0.01)
  variants?: NightlifeVenueProductVariant[];
  options?: NightlifeVenueProductOption[];
}

// Export legacy types for backward compatibility (will be removed later)
// Legacy aliases removed; please use NightlifeVenue* types directly.

