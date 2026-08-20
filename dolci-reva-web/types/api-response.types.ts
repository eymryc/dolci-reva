/**
 * Types communs pour les réponses de l'API Dolci Reva
 * 
 * Ces types sont adaptés selon les retours réels de l'API Laravel.
 * L'API utilise différentes structures selon le contexte :
 * - Réponses avec status, success, message, data
 * - Réponses avec seulement success et data
 * - Réponses Laravel Resource Collections (pagination)
 * - Réponses directes de Resource (sans wrapper)
 */

/**
 * Structure de base pour les réponses API avec status, success et message
 * Utilisée pour les opérations CRUD (create, update, delete)
 */
export interface ApiResponse<T = unknown> {
  status: number;
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Réponse API standard (sans data)
 * Utilisée pour les opérations simples (delete, update simple)
 */
export interface StandardApiResponse {
  status?: number;
  success: boolean;
  message: string;
}

/**
 * Réponse API avec seulement success et data (sans status/message)
 * Utilisée pour certaines réponses simples
 */
export interface SimpleApiResponse<T = unknown> {
  success: boolean;
  data: T;
}

/**
 * Réponse API avec success, message et data (sans status dans JSON)
 * Le status est dans le code HTTP
 */
export interface ApiResponseWithMessage<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Réponse API avec données paginées (Laravel Resource Collections)
 * Structure standard de Laravel pour la pagination
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
 * Réponse API avec une seule donnée (Resource direct)
 * Quand Laravel retourne directement un Resource sans wrapper
 */
export interface SingleDataApiResponse<T> {
  status?: number;
  success?: boolean;
  message?: string;
  data: T;
}

/**
 * Réponse d'erreur API standard
 * Utilisée pour les erreurs générales (400, 500, etc.)
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
 * Structure standard Laravel pour les erreurs de validation
 */
export interface ValidationErrorResponse {
  message: string;
  errors: Record<string, string[]>;
}

/**
 * Réponse d'erreur simple (juste error)
 * Utilisée pour certaines erreurs internes
 */
export interface SimpleErrorResponse {
  error: string;
}

/**
 * Réponse de login
 * Structure spéciale pour l'authentification
 * 
 * @template TUser - Type de l'utilisateur retourné (par défaut: unknown)
 * 
 * @example
 * ```ts
 * interface User {
 *   id: number;
 *   email: string;
 *   name: string;
 * }
 * 
 * const loginResponse: LoginResponse<User> = await login();
 * // loginResponse.user est maintenant typé comme User
 * ```
 */
export interface LoginResponse<TUser = unknown> {
  success: boolean;
  status: number;
  message: string;
  token: string;
  type: string;
  expires_at: string;
  remember_me: boolean;
  user: TUser; // UserResource - peut être typé lors de l'utilisation
}

/**
 * Réponse de register
 * Structure pour l'inscription
 * 
 * @template TUser - Type de l'utilisateur retourné (par défaut: unknown)
 * 
 * @example
 * ```ts
 * interface User {
 *   id: number;
 *   email: string;
 *   name: string;
 * }
 * 
 * const registerResponse: RegisterResponse<User> = await register();
 * // registerResponse.data est maintenant typé comme User
 * ```
 */
export interface RegisterResponse<TUser = unknown> {
  status: number;
  success: boolean;
  message: string;
  data: TUser; // UserResource - peut être typé lors de l'utilisation
  email_verified: boolean;
}

/**
 * Réponse avec count
 * Utilisée pour certaines réponses avec un compteur
 */
export interface ApiResponseWithCount<T = unknown> {
  success: boolean;
  data: T;
  count?: number;
}

/**
 * Réponse avec données supplémentaires
 * Utilisée pour les réponses complexes avec plusieurs propriétés
 */
export interface ExtendedApiResponse<T = unknown> {
  success: boolean;
  status?: number;
  message?: string;
  data?: T;
  [key: string]: unknown; // Permet d'ajouter d'autres propriétés (token, expires_at, etc.)
}

/**
 * Type union pour toutes les réponses possibles
 * Utile pour le typage flexible
 */
export type AnyApiResponse<T = unknown> =
  | ApiResponse<T>
  | StandardApiResponse
  | SimpleApiResponse<T>
  | ApiResponseWithMessage<T>
  | PaginatedApiResponse<T>
  | SingleDataApiResponse<T>
  | ApiErrorResponse
  | ValidationErrorResponse
  | SimpleErrorResponse
  | LoginResponse
  | RegisterResponse
  | ApiResponseWithCount<T>
  | ExtendedApiResponse<T>;

/**
 * Type guard pour vérifier si une réponse est une erreur
 */
export function isApiError(
  response: unknown
): response is ApiErrorResponse | ValidationErrorResponse | SimpleErrorResponse {
  if (typeof response !== 'object' || response === null) {
    return false;
  }

  const r = response as Record<string, unknown>;

  // Vérifie si c'est une erreur de validation
  if ('errors' in r && typeof r.errors === 'object') {
    return true;
  }

  // Vérifie si c'est une erreur simple
  if ('error' in r && typeof r.error === 'string') {
    return true;
  }

  // Vérifie si c'est une erreur avec success: false
  if ('success' in r && r.success === false) {
    return true;
  }

  return false;
}

/**
 * Type guard pour vérifier si une réponse est paginée
 */
export function isPaginatedResponse<T>(
  response: unknown
): response is PaginatedApiResponse<T> {
  if (typeof response !== 'object' || response === null) {
    return false;
  }

  const r = response as Record<string, unknown>;
  return 'data' in r && 'links' in r && 'meta' in r && Array.isArray(r.data);
}

/**
 * Type guard pour vérifier si une réponse est une réponse standard avec data
 */
export function isApiResponseWithData<T>(
  response: unknown
): response is ApiResponse<T> | ApiResponseWithMessage<T> | SimpleApiResponse<T> {
  if (typeof response !== 'object' || response === null) {
    return false;
  }

  const r = response as Record<string, unknown>;
  return 'success' in r && 'data' in r && r.success === true;
}

/**
 * Helper pour extraire les données d'une réponse API
 * Gère tous les types de réponses possibles
 */
export function extractApiData<T>(response: unknown): T | null {
  if (typeof response !== 'object' || response === null) {
    return null;
  }

  const r = response as Record<string, unknown>;

  // Si c'est une réponse avec data
  if ('data' in r) {
    return r.data as T;
  }

  // Si c'est une réponse paginée, retourner le tableau data
  if (isPaginatedResponse<T>(response)) {
    return response.data as unknown as T;
  }

  // Si c'est directement les données (Resource direct)
  return response as T;
}

/**
 * Helper pour extraire le message d'une réponse API
 */
export function extractApiMessage(response: unknown): string | null {
  if (typeof response !== 'object' || response === null) {
    return null;
  }

  const r = response as Record<string, unknown>;

  if ('message' in r && typeof r.message === 'string') {
    return r.message;
  }

  if ('error' in r && typeof r.error === 'string') {
    return r.error;
  }

  return null;
}

/**
 * Helper pour extraire les erreurs de validation
 */
export function extractValidationErrors(
  response: unknown
): Record<string, string[]> | null {
  if (typeof response !== 'object' || response === null) {
    return null;
  }

  const r = response as Record<string, unknown>;

  if ('errors' in r && typeof r.errors === 'object' && r.errors !== null) {
    return r.errors as Record<string, string[]>;
  }

  return null;
}

