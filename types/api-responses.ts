/**
 * Types communs pour les réponses de l'API
 */

/**
 * Structure de base pour les réponses API avec status, success et message
 */
export interface ApiResponse<T = unknown> {
  status: number;
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Réponse API standard (sans data)
 */
export interface StandardApiResponse {
  status: number;
  success: boolean;
  message: string;
}

/**
 * Réponse API avec données paginées
 */
export interface PaginatedApiResponse<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

/**
 * Réponse API avec une seule donnée
 */
export interface SingleDataApiResponse<T> {
  status: number;
  success: boolean;
  message?: string;
  data: T;
}

/**
 * Réponse d'erreur API
 */
export interface ApiErrorResponse {
  status?: number;
  success?: boolean;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

/**
 * Réponse d'erreur de validation (HTTP 422)
 */
export interface ValidationErrorResponse {
  success: false;
  message: string;
  data: Record<string, string[]>;
}

