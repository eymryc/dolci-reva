export type UserType = 'CUSTOMER' | 'OWNER' | 'ADMIN' | 'SUPER_ADMIN';

export interface UserWallet {
  balance: string;
  frozen_balance?: string;
  recharge_balance?: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  type: UserType;
  email_verified_at?: string | null;
  verification_status?: string | null;
  wallet?: UserWallet | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}
