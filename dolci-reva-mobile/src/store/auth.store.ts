import { create } from 'zustand';
import { authRepository } from '@/data/repositories/auth.repository.impl';
import { secureStorage } from '@/core/storage/secureStorage';
import { setUnauthorizedHandler } from '@/core/api/client';
import type { UpdateProfileData, User } from '@/domain/entities/user';
import type { LoginCredentials, RegisterPayload } from '@/domain/repositories/auth.repository';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  logout: () => Promise<void>;
  /** À appeler une seule fois au démarrage de l'app (cf. app/_layout.tsx). */
  init: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isInitialized: false,

  init: async () => {
    setUnauthorizedHandler(() => set({ user: null }));

    const token = await secureStorage.getAccessToken();
    if (!token) {
      set({ isInitialized: true });
      return;
    }

    try {
      const user = await authRepository.getProfile();
      set({ user, isInitialized: true });
    } catch {
      await secureStorage.clearAccessToken();
      set({ user: null, isInitialized: true });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const { token, user } = await authRepository.login(credentials);
      await secureStorage.setAccessToken(token);
      set({ user, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (payload) => {
    set({ isLoading: true });
    try {
      await authRepository.register(payload);
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true });
    try {
      const user = await authRepository.updateProfile(data);
      set({ user, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authRepository.logout();
    } catch {
      // Le token est peut-être déjà expiré côté serveur : on nettoie quand même localement.
    }
    await secureStorage.clearAccessToken();
    set({ user: null });
  },
}));
