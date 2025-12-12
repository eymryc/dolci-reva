/**
 * Types d'entités pour les utilisateurs
 */

export interface VerificationDocument {
  id: number;
  user_id: number;
  document_type: string;
  identity_document_type?: string | null;
  document_number: string;
  document_issue_date?: string | null;
  document_expiry_date?: string | null;
  issuing_authority?: string | null;
  status: string;
  rejection_reason?: string | null;
  reviewed_by?: number | null;
  reviewed_at?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  document_file?: {
    id: number;
    name: string;
    file_name: string;
    mime_type: string;
    size: number;
    collection_name: string;
    url: string;
    created_at: string;
  } | null;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  type: string;
  role: string;
  permissions: string[];
  businessTypes?: Array<{
    id: number;
    name: string;
  }>;
  id_document_number?: string | null;
  date_of_birth?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  postal_code?: string | null;
  verification_status?: string;
  verification_level?: string;
  phone_verified?: boolean;
  phone_verified_at?: string | null;
  verified_by?: number | null;
  verified_at?: string | null;
  reputation_score?: string;
  is_premium?: boolean;
  is_verified?: boolean;
  total_bookings?: number;
  cancelled_bookings?: number;
  cancellation_rate?: string;
  has_insurance?: boolean;
  security_deposit?: number | null;
  email_verified_at?: string | null;
  admin_notes?: string | null;
  verifications?: VerificationDocument[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface UserFormData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  password?: string;
  type: string;
  business_type_ids?: number[];
}






