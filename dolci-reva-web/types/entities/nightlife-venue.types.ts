/**
 * Types d'entités pour les nightlife venues, catégories de produits et produits
 */

import type { FeatureCategory, Owner } from '@/types/common';
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
  phone?: string | null;
  smoking_area?: boolean;
  outdoor_seating?: boolean;
  parking?: boolean;
  venue_type?: ("LOUNGE" | "NIGHT_CLUB" | "BAR")[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  feature_categories: FeatureCategory[];
  main_image_url?: string | null;
  main_image_thumb_url?: string | null;
  gallery_images: GalleryImage[];
  all_images?: GalleryImage[];
  owner?: Owner;
  lounge_product_categories_count?: number;
  products_count?: number;
  tables?: unknown[]; // Tableaux de tables du venue
  areas?: NightClubArea[]; // Zones night-club
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
  feature_option_ids?: number[];
  area_feature_options?: { area_id: number; feature_option_ids: number[] }[];
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

export type NightClubAreaType =
  | 'dance_floor'
  | 'vip_booth'
  | 'bar_area'
  | 'terrace'
  | 'private_room'
  | 'bottle_service';

export const NIGHT_CLUB_AREA_LABELS: Record<NightClubAreaType, string> = {
  dance_floor: 'Piste de danse',
  vip_booth: 'Box VIP',
  bar_area: 'Zone bar',
  terrace: 'Terrasse',
  private_room: 'Salle privée',
  bottle_service: 'Service bouteilles',
};

export interface NightClubArea {
  id: number;
  night_club_id: number;
  area_name: string;
  location: string | null;
  area_type: NightClubAreaType;
  capacity: number | null;
  is_active: boolean;
  reservation_required: boolean;
  minimum_spend: number | null;
  table_fee: number | null;
  display_name: string;
  location_description: string;
  type_description: string;
  minimum_spend_formatted: string;
  table_fee_formatted: string;
  total_cost_formatted: string;
  feature_categories?: FeatureCategory[];
  feature_options_string?: string;
  availability?: {
    status: string;
    label?: string;
    free_from?: string | null;
    occupied_until?: string | null;
    next_booking_start?: string | null;
    message?: string | null;
  } | null;
}

// Export legacy types for backward compatibility (will be removed later)
// Legacy aliases removed; please use NightlifeVenue* types directly.

