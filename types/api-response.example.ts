/**
 * Exemples d'utilisation des types de réponses API
 * 
 * Ces exemples montrent comment utiliser les types selon les différents
 * retours de l'API Dolci Reva.
 */

import type {
  ApiResponse,
  PaginatedApiResponse,
  SimpleApiResponse,
  ApiResponseWithMessage,
  LoginResponse,
  ValidationErrorResponse,
  ApiErrorResponse,
} from './api-response.types';

// ============================================
// Exemple 1: Réponse avec status, success, message, data
// Utilisée pour: POST /users, POST /wallets, etc.
// ============================================
const createUserResponse: ApiResponse<{ id: number; email: string }> = {
  status: 201,
  success: true,
  message: 'Account created successfully. Please check your email to verify your account.',
  data: {
    id: 1,
    email: 'user@example.com',
  },
};

// ============================================
// Exemple 2: Réponse avec seulement success et data
// Utilisée pour: GET /messages/conversations, GET /favorites, etc.
// ============================================
const conversationsResponse: SimpleApiResponse<Array<{ user_id: number; latest_message: unknown }>> = {
  success: true,
  data: [
    {
      user_id: 2,
      latest_message: {},
    },
  ],
};

// ============================================
// Exemple 3: Réponse paginée (Laravel Resource Collection)
// Utilisée pour: GET /users, GET /bookings, GET /wallets, etc.
// ============================================
const paginatedUsersResponse: PaginatedApiResponse<{ id: number; email: string }> = {
  data: [
    { id: 1, email: 'user1@example.com' },
    { id: 2, email: 'user2@example.com' },
  ],
  links: {
    first: 'http://localhost:8000/api/users?page=1',
    last: 'http://localhost:8000/api/users?page=5',
    prev: null,
    next: 'http://localhost:8000/api/users?page=2',
  },
  meta: {
    current_page: 1,
    from: 1,
    last_page: 5,
    links: [
      { url: null, label: '&laquo; Previous', active: false },
      { url: 'http://localhost:8000/api/users?page=1', label: '1', active: true },
      { url: 'http://localhost:8000/api/users?page=2', label: '2', active: false },
    ],
    path: 'http://localhost:8000/api/users',
    per_page: 15,
    to: 15,
    total: 75,
  },
};

// ============================================
// Exemple 4: Réponse avec success, message et data (sans status)
// Utilisée pour: POST /menu-categories, POST /lounge-product-categories, etc.
// ============================================
const createCategoryResponse: ApiResponseWithMessage<{ id: number; name: string }> = {
  success: true,
  message: 'Catégorie créée avec succès',
  data: {
    id: 1,
    name: 'Entrées',
  },
};

// ============================================
// Exemple 5: Réponse de login
// Utilisée pour: POST /auth/login
// ============================================
const loginResponse: LoginResponse = {
  success: true,
  status: 200,
  message: 'Login successful',
  token: '1|abcdef1234567890',
  type: 'Bearer',
  expires_at: '2024-12-06T11:51:00.000000Z',
  remember_me: true,
  user: {
    id: 1,
    email: 'user@example.com',
    first_name: 'John',
    last_name: 'Doe',
  },
};

// ============================================
// Exemple 6: Réponse d'erreur de validation (422)
// Utilisée pour: Erreurs de validation Laravel
// ============================================
const validationErrorResponse: ValidationErrorResponse = {
  message: 'The given data was invalid.',
  errors: {
    email: ['The email has already been taken.'],
    password: ['The password must be at least 8 characters.'],
  },
};

// ============================================
// Exemple 7: Réponse d'erreur standard
// Utilisée pour: Erreurs 400, 401, 403, 500, etc.
// ============================================
const errorResponse: ApiErrorResponse = {
  status: 401,
  success: false,
  message: 'These credentials do not match our records.',
};

// ============================================
// Exemple 8: Réponse avec count
// Utilisée pour: GET /search/residences, etc.
// ============================================
const searchResponse: SimpleApiResponse<Array<unknown>> & { count: number } = {
  success: true,
  data: [],
  count: 25,
};

// ============================================
// Exemple 9: Réponse QR Code
// Utilisée pour: GET /bookings/{id}/qr-code
// ============================================
const qrCodeResponse: SimpleApiResponse<{
  token: string;
  qr_code_url: string;
  booking_reference: string;
  expires_at: string;
}> = {
  success: true,
  data: {
    token: 'QR_691C33CDAD136',
    qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?data=...',
    booking_reference: 'BOOK_12345',
    expires_at: '2024-12-06T11:51:00.000000Z',
  },
};

// ============================================
// Exemple 10: Réponse avec unread count
// Utilisée pour: GET /messages/unread-count
// ============================================
const unreadCountResponse: SimpleApiResponse<{ count: number }> = {
  success: true,
  data: {
    count: 5,
  },
};

