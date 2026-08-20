import type { UpdateProfileData, User, UserType } from '@/domain/entities/user';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  type: Extract<UserType, 'CUSTOMER' | 'OWNER'>;
}

export interface LoginResult {
  token: string;
  user: User;
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

/**
 * Interface pure, sans dépendance à axios/React : le domaine ne connaît
 * jamais l'implémentation technique (cf. Clean Architecture).
 */
export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<LoginResult>;
  register(payload: RegisterPayload): Promise<User>;
  getProfile(): Promise<User>;
  updateProfile(data: UpdateProfileData): Promise<User>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(payload: ResetPasswordPayload): Promise<void>;
  logout(): Promise<void>;
}
