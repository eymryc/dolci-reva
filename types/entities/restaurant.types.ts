/**
 * Types d'entités pour les restaurants, catégories de menu et items de menu
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

export interface Restaurant {
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
  is_active: boolean;
  created_at: string;
  updated_at: string;
  amenities: Amenity[];
  main_image_url?: string | null;
  main_image_thumb_url?: string | null;
  gallery_images: GalleryImage[];
  all_images?: GalleryImage[];
  owner?: Owner;
  menu_categories_count?: number;
  menu_items_count?: number;
  tables?: unknown[]; // Tableaux de tables du restaurant
}

export interface RestaurantFormData {
  name: string;
  description?: string;
  address: string;
  city: string;
  country: string;
  latitude?: string;
  longitude?: string;
  opening_hours?: OpeningHours;
  is_active?: boolean;
  owner_id?: number;
  amenities?: number[];
}

export interface MenuCategory {
  id: number;
  restaurant_id: number;
  name: string;
  description?: string | null;
  icon?: string | null;
  order: number;
  created_at: string;
  updated_at: string;
  restaurant?: Restaurant;
  menu_items_count?: number;
}

export interface MenuCategoryFormData {
  restaurant_id: number;
  name: string;
  description?: string;
}

export interface MenuItemVariant {
  name: string;
  price_modifier: number;
}

export interface MenuItemOption {
  name: string;
  price: number;
}

export interface NutritionalInfo {
  calories?: number;
  protein?: number; // en grammes
  carbs?: number; // en grammes
  fat?: number; // en grammes
}

export interface MenuItem {
  id: number;
  restaurant_id: number;
  category_id: number;
  name: string;
  description?: string | null;
  price: number; // number from API (e.g., 3500)
  currency?: string; // e.g., "XOF"
  is_available?: number; // 1 or 0
  popularity_score?: number;
  total_orders?: number;
  preparation_time?: number | null;
  spice_level?: number | null; // 0-5
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  is_halal?: boolean;
  allergens?: string[];
  nutritional_info?: NutritionalInfo | null;
  ingredients?: string[];
  variants?: MenuItemVariant[];
  options?: MenuItemOption[];
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  category?: MenuCategory;
  restaurant?: Restaurant;
  main_image_url?: string | null;
  main_image_thumb_url?: string | null;
  main_image_medium_url?: string | null;
  gallery_images: GalleryImage[];
}

export interface MenuItemFormData {
  restaurant_id: number;
  category_id: number;
  name: string;
  description?: string;
  price: number; // number (min:0.01)
  preparation_time?: number;
  spice_level?: number; // 0-5
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  is_halal?: boolean;
  allergens?: string[];
  nutritional_info?: NutritionalInfo;
  ingredients?: string[];
  variants?: MenuItemVariant[];
  options?: MenuItemOption[];
}

