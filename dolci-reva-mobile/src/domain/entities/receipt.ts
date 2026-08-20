/** Reflet fidèle de BookingController::getReceipt() côté API. */

export type EscrowStatus = 'EN_ATTENTE_PAIEMENT' | 'SECURISE' | 'LIBERE' | 'REMBOURSE';

export interface ReceiptInfo {
  booking_reference: string;
  payment_reference: string;
  payment_date: string;
  payment_status: string;
  escrow_status: EscrowStatus;
  funds_released_at?: string | null;
  generated_at: string;
}

export interface ReceiptCustomer {
  id: number;
  full_name: string;
  email: string;
  phone: string;
}

export interface ReceiptBooking {
  id: number;
  booking_reference: string;
  booking_type: string;
  start_date: string;
  end_date: string;
  guests: string;
  status: string;
  payment_status: string;
  notes: string | null;
}

export interface ReceiptProperty {
  id: number;
  name: string;
  type: string;
}

export interface ReceiptOwner {
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

export interface ReceiptPayment {
  total_price: number;
  commission_amount: number | null;
  owner_amount: number | null;
  payment_method: string;
  payment_currency: string;
  payment_reference: string;
}

export interface ReceiptQrCode {
  token: string;
  booking_id: number;
  booking_reference: string;
}

export interface Receipt {
  receipt_info: ReceiptInfo;
  customer: ReceiptCustomer;
  booking: ReceiptBooking;
  property: ReceiptProperty;
  owner: ReceiptOwner | null;
  payment: ReceiptPayment;
  qr_code: ReceiptQrCode;
}
