import axios from 'axios';
import { env } from '@/core/config/env';
import { secureStorage } from '@/core/storage/secureStorage';

/**
 * Client HTTP unique vers l'API Laravel, même contrat que dolci-reva-web
 * (lib/axios.ts) : token Bearer injecté automatiquement, 401 => déconnexion.
 */
export const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: {
    Accept: 'application/json',
    // Lu côté API (BookingController) pour savoir vers quelle plateforme
    // rediriger après un paiement Paystack : deep link mobile plutôt que
    // le front-office web (cf. PaymentController::callback()).
    'X-Client-Platform': 'mobile',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await secureStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Callback branché par le store d'auth au démarrage de l'app (cf.
 * src/store/auth.store.ts) pour éviter toute dépendance circulaire entre
 * le client API et la navigation/le store.
 */
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await secureStorage.clearAccessToken();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);
