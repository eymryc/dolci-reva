/**
 * Types communs partagés dans l'application
 */

/**
 * Type pour une commodité/aménité
 */
export interface Amenity {
  id: number;
  name: string;
  description?: string;
  category?: string;
  icon?: string;
}

/**
 * Type pour un propriétaire
 */
export interface Owner {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  type?: string;
  verification_status?: string;
  created_at?: string;
  updated_at?: string;
}
