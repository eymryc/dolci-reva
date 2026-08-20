import { apiClient } from '@/core/api/client';
import { extractApiData } from '@/core/api/response';
import type {
  AuthRepository,
  LoginCredentials,
  LoginResult,
  RegisterPayload,
  ResetPasswordPayload,
} from '@/domain/repositories/auth.repository';
import type { UpdateProfileData, User } from '@/domain/entities/user';

interface LoginApiResponse {
  success: boolean;
  token: string;
  user: User;
}

export class AuthRepositoryImpl implements AuthRepository {
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    const response = await apiClient.post<LoginApiResponse>('/auth/login', credentials);
    return { token: response.data.token, user: response.data.user };
  }

  async register(payload: RegisterPayload): Promise<User> {
    const response = await apiClient.post('/auth/register', payload);
    const user = extractApiData<User>(response.data);
    if (!user) {
      throw new Error("Échec de l'inscription");
    }
    return user;
  }

  async getProfile(): Promise<User> {
    const response = await apiClient.get('/profile');
    const user = extractApiData<User>(response.data);
    if (!user) {
      throw new Error('Profil introuvable');
    }
    return user;
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await apiClient.put('/profile', data);
    const user = extractApiData<User>(response.data);
    if (!user) {
      throw new Error('Échec de la mise à jour du profil');
    }
    return user;
  }

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  }

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await apiClient.post('/auth/reset-password', payload);
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }
}

export const authRepository = new AuthRepositoryImpl();
