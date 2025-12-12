/**
 * Types d'entités pour les réservations
 */

export interface BookingUser {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  type: string;
  email_verified_at?: string | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Bookable {
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
  is_available: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface Booking {
  id: number;
  customer_id: number;
  owner_id: number;
  bookable_type: string;
  bookable_id: number;
  start_date: string;
  end_date: string;
  guests: number;
  booking_reference: string;
  total_price: string;
  commission_amount: string;
  owner_amount: string;
  status: 'CONFIRME' | 'EN_ATTENTE' | 'ANNULE' | 'TERMINE';
  payment_status: 'PAYE' | 'EN_ATTENTE' | 'REFUSE' | 'REMBOURSE';
  notes?: string | null;
  cancellation_reason?: string | null;
  cancelled_at?: string | null;
  confirmed_at?: string | null;
  created_at: string;
  updated_at: string;
  customer: BookingUser;
  owner: BookingUser;
  bookable: Bookable;
}

export interface BookingFormData {
  name: string;
  venue: string;
  date: string;
  time: string;
}






