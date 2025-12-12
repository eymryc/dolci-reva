/**
 * Hooks React pour utiliser les types de réponses API
 * 
 * Ces hooks facilitent l'utilisation des types dans les composants React
 * et gèrent automatiquement les différents formats de réponses.
 */

import { useCallback } from 'react';
import type {
  ApiResponse,
  PaginatedApiResponse,
  SimpleApiResponse,
  ApiResponseWithMessage,
  AnyApiResponse,
  ApiErrorResponse,
  ValidationErrorResponse,
  StandardApiResponse,
  SingleDataApiResponse,
} from './api-response.types';
import {
  isApiError,
  isPaginatedResponse,
  isApiResponseWithData,
  extractApiData,
  extractApiMessage,
  extractValidationErrors,
} from './api-response.types';

/**
 * Hook pour gérer les réponses API de manière type-safe
 * 
 * @example
 * ```tsx
 * const { handleResponse, extractData } = useApiResponse();
 * 
 * const response = await fetch('/api/users');
 * const data = await response.json();
 * 
 * if (handleResponse(data)) {
 *   const users = extractData<User[]>(data);
 *   // users est typé correctement
 * }
 * ```
 */
export function useApiResponse() {
  const handleResponse = useCallback((response: unknown): boolean => {
    if (isApiError(response)) {
      console.error('API Error:', response);
      return false;
    }
    return true;
  }, []);

  const extractData = useCallback(<T,>(response: unknown): T | null => {
    return extractApiData<T>(response);
  }, []);

  const getMessage = useCallback((response: unknown): string | null => {
    return extractApiMessage(response);
  }, []);

  const getValidationErrors = useCallback(
    (response: unknown): Record<string, string[]> | null => {
      return extractValidationErrors(response);
    },
    []
  );

  return {
    handleResponse,
    extractData,
    getMessage,
    getValidationErrors,
    isError: isApiError,
    isPaginated: isPaginatedResponse,
    hasData: isApiResponseWithData,
  };
}

/**
 * Type helper pour typer les réponses de fetch
 * 
 * @example
 * ```tsx
 * const fetchUsers = async (): Promise<PaginatedApiResponse<User>> => {
 *   const response = await fetch('/api/users');
 *   return response.json();
 * };
 * ```
 */
export type FetchResponse<T> = Promise<AnyApiResponse<T>>;

/**
 * Type helper pour typer les fonctions API
 * 
 * @example
 * ```tsx
 * const getUser: ApiFunction<{ id: number }, User> = async (params) => {
 *   const response = await fetch(`/api/users/${params.id}`);
 *   return response.json();
 * };
 * ```
 */
export type ApiFunction<Params = unknown, Response = unknown> = (
  params: Params
) => Promise<AnyApiResponse<Response>>;

/**
 * Type helper pour les réponses de création (POST)
 */
export type CreateResponse<T> = ApiResponse<T> | ApiResponseWithMessage<T>;

/**
 * Type helper pour les réponses de mise à jour (PUT/PATCH)
 */
export type UpdateResponse<T> = ApiResponse<T> | ApiResponseWithMessage<T>;

/**
 * Type helper pour les réponses de suppression (DELETE)
 */
export type DeleteResponse = StandardApiResponse | ApiResponseWithMessage<never>;

/**
 * Type helper pour les réponses de liste (GET avec pagination)
 */
export type ListResponse<T> = PaginatedApiResponse<T> | SimpleApiResponse<T[]>;

/**
 * Type helper pour les réponses de détail (GET by ID)
 */
export type DetailResponse<T> = SingleDataApiResponse<T> | SimpleApiResponse<T>;

