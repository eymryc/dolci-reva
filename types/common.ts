/**
 * Types communs partagés dans toute l'application
 * 
 * Ce fichier centralise les interfaces et types utilisés
 * dans plusieurs modules pour éviter la duplication.
 */

/**
 * Équipement/Amenity
 */
export interface Amenity {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Propriétaire/Owner
 */
export interface Owner {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Image avec métadonnées
 */
export interface Image {
  id: number;
  name: string;
  file_name: string;
  mime_type: string;
  size: number;
  collection_name: string;
  url: string;
  thumb_url?: string;
  medium_url?: string;
  large_url?: string;
  created_at: string;
}

/**
 * Image de galerie
 */
export interface GalleryImage extends Image {
  collection_name: 'gallery';
}

/**
 * Adresse
 */
export interface Address {
  address?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Statut de disponibilité
 */
export interface AvailabilityStatus {
  is_available: boolean;
  available_from?: string;
  next_available_date?: string;
}

/**
 * Utilisateur de base
 */
export interface BaseUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at?: string;
  updated_at?: string;
}

