import type { User } from './user';

export type BookingStatus = 'EN_ATTENTE' | 'CONFIRME' | 'ANNULE' | 'COMPLETE' | 'NO_SHOW';
export type PaymentStatus = 'EN_ATTENTE' | 'PAYE' | 'PARTIELLEMENT_PAYE' | 'REMBOURSE' | 'ECHEC';

export interface BookingBookable {
  id: number;
  name: string;
  city?: string;
  main_image_url?: string | null;
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
  status: BookingStatus;
  payment_status: PaymentStatus;
  notes?: string | null;
  created_at: string;
  customer: User;
  bookable: BookingBookable;
}
