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
  type?: string;
  venue_type?: string | null;
  max_guests?: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  piece_number?: number | null;
  price?: string;
  standing?: string;
  average_rating?: string;
  total_ratings?: number;
  rating_count?: number;
  is_available?: boolean;
  is_active?: boolean;
  main_image_url?: string | null;
  main_image_thumb_url?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface BookingHotelRoom {
  id: number;
  name?: string | null;
  room_number?: string | null;
  type?: string | null;
  standing?: string | null;
  max_guests?: number | null;
  price?: string | number | null;
  main_image_url?: string | null;
  main_image_thumb_url?: string | null;
}

export interface BookingRestaurantTable {
  id: number;
  table_number: string;
  capacity: number;
  location?: string | null;
  table_type?: string | null;
}

export interface BookingLoungeTable {
  id: number;
  table_number: string;
  capacity: number;
  location?: string | null;
  table_type?: string | null;
  minimum_spend?: string | number | null;
}

export interface BookingNightClubArea {
  id: number;
  area_name: string;
  location?: string | null;
  area_type?: string | null;
  capacity?: number | null;
  minimum_spend?: string | number | null;
  table_fee?: string | number | null;
}

export interface Booking {
  id: number;
  customer_id: number;
  owner_id: number;
  bookable_type: string;
  bookable_id: number;
  hotel_room_id?: number | null;
  start_date: string;
  end_date: string;
  guests: number;
  booking_reference: string;
  total_price: string;
  commission_amount: string;
  owner_amount: string;
  credit_applied?: number | string;
  amount_due?: number | string;
  refund_estimate?: {
    refund_amount: number;
    credit_amount: number;
    bonus_percent: number;
    percent: number;
    is_free: boolean;
    credit_enabled: boolean;
  } | null;
  status: 'CONFIRME' | 'EN_ATTENTE' | 'ANNULE' | 'COMPLETE';
  payment_status: 'PAYE' | 'EN_ATTENTE' | 'ECHEC' | 'REMBOURSE';
  escrow_status: 'EN_ATTENTE_PAIEMENT' | 'SECURISE' | 'LIBERE' | 'REMBOURSE';
  funds_released_at?: string | null;
  notes?: string | null;
  cancellation_reason?: string | null;
  cancelled_at?: string | null;
  confirmed_at?: string | null;
  cancellation_policy?: {
    vertical?: string;
    free_cancel_hours?: number;
    late_refund_percent?: number;
    summary?: string;
  } | null;
  cancellation_window?: {
    free_cancel_hours: number;
    late_refund_percent: number;
    post_booking_grace_minutes?: number;
    policy_free_cancel_until?: string | null;
    grace_free_cancel_until?: string | null;
    free_cancel_until: string | null;
    is_free_cancel_open: boolean;
    within_grace?: boolean;
    unpaid_expires_at: string | null;
    unpaid_hold_minutes: number | null;
  } | null;
  created_at: string;
  updated_at: string;
  customer: BookingUser;
  owner: BookingUser;
  bookable: Bookable;
  hotel_room?: BookingHotelRoom | null;
  restaurant_tables?: BookingRestaurantTable[];
  lounge_tables?: BookingLoungeTable[];
  night_club_areas?: BookingNightClubArea[];
}






