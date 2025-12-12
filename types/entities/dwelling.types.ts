/**
 * Types d'entités pour les hébergements (dwellings)
 */

import type { Amenity, Owner as BaseOwner } from '@/types/common';

export interface Owner extends BaseOwner {
  phone: string;
  email: string;
  type: string;
  verification_status: string;
  verification_level: string;
  phone_verified: boolean;
  phone_verified_at?: string | null;
  id_document_number?: string | null;
  date_of_birth?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  postal_code?: string | null;
  reputation_score: string;
  total_bookings: number;
  cancelled_bookings: number;
  cancellation_rate: string;
  is_premium: boolean;
  premium_until?: string | null;
  security_deposit?: string | null;
  has_insurance: boolean;
  admin_notes?: string | null;
  email_verified_at?: string | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
  verified_by?: number | null;
  verified_at?: string | null;
}

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

export interface Dwelling {
  id: number;
  owner_id: number;
  description?: string | null;
  address: string;
  city: string;
  country: string;
  latitude?: string | null;
  longitude?: string | null;
  phone: string;
  whatsapp: string;
  type: string;
  structure_type: string;
  structure_type_label: string;
  construction_type: string;
  construction_type_label: string;
  rental_status: string;
  security_deposit_month_number: number;
  security_deposit_amount: number;
  visite_price: number;
  rent_advance_amount_number: number;
  rent_advance_amount: number;
  agency_fees_month_number: number;
  agency_fees: number;
  rent: number;
  piece_number?: number | null;
  bathrooms?: number | null;
  rooms?: number | null;
  living_room?: number | null;
  is_available?: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  main_image_url?: string | null;
  main_image_thumb_url?: string | null;
  gallery_images: GalleryImage[];
  all_images: GalleryImage[];
  owner: Owner;
}

export interface DwellingFormData {
  phone: string;
  whatsapp: string;
  security_deposit_month_number: number;
  visite_price: string;
  rent_advance_amount_number: number;
  rent: string;
  description: string;
  address: string;
  city: string;
  country: string;
  latitude?: string;
  longitude?: string;
  type: string;
  rooms?: number | null;
  bathrooms?: number | null;
  piece_number?: number | null;
  living_room?: number | null;
  structure_type: string;
  construction_type: string;
  agency_fees_month_number?: number;
  agency_fees?: string;
  owner_id?: number;
}

export interface DwellingBookingData {
  start_date: string;
  end_date: string;
  guests: number;
}

export interface DwellingBookingResponse {
  data?: unknown;
  payment_url?: string;
  message?: string;
}






