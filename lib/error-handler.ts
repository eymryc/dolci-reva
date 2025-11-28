/**
 * Gestionnaire d'erreurs centralisé
 * 
 * Fournit des fonctions utilitaires pour gérer les erreurs
 * de manière cohérente dans toute l'application.
 */

import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { logger } from './logger';
import { ValidationErrorResponse } from '@/types/api-responses';

/**
 * Types d'erreurs possibles
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Erreur personnalisée de validation
 */
export class ValidationError extends Error {
  constructor(
    public errors: Record<string, string[]>,
    message = 'Erreurs de validation'
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Erreur réseau personnalisée
 */
export class NetworkError extends Error {
  constructor(message = 'Erreur de connexion réseau') {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * Détecte le type d'erreur à partir d'une erreur Axios
 */
export function detectErrorType(error: unknown): ErrorType {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    
    if (status === 401) return ErrorType.UNAUTHORIZED;
    if (status === 403) return ErrorType.FORBIDDEN;
    if (status === 404) return ErrorType.NOT_FOUND;
    if (status === 422) return ErrorType.VALIDATION;
    if (status && status >= 500) return ErrorType.SERVER;
    if (!error.response) return ErrorType.NETWORK;
  }
  
  return ErrorType.UNKNOWN;
}

/**
 * Extrait les erreurs de validation d'une réponse Axios
 */
export function extractValidationErrors(
  error: unknown
): Record<string, string[]> | null {
  if (error instanceof AxiosError) {
    const response = error.response?.data as ValidationErrorResponse | undefined;
    if (response?.data && typeof response.data === 'object') {
      return response.data as Record<string, string[]>;
    }
  }
  return null;
}

/**
 * Extrait le message d'erreur d'une réponse
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const response = error.response?.data as { message?: string; error?: string } | undefined;
    return response?.message || response?.error || error.message || 'Une erreur est survenue';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Une erreur inattendue est survenue';
}

/**
 * Gère une erreur et affiche un message approprié
 */
export function handleError(
  error: unknown,
  options: {
    showToast?: boolean;
    logError?: boolean;
    defaultMessage?: string;
  } = {}
): {
  type: ErrorType;
  message: string;
  validationErrors?: Record<string, string[]>;
} {
  const {
    showToast = true,
    logError = true,
    defaultMessage,
  } = options;

  const type = detectErrorType(error);
  const message = defaultMessage || extractErrorMessage(error);
  const validationErrors = extractValidationErrors(error);

  // Logger l'erreur
  if (logError) {
    logger.error(message, error);
  }

  // Afficher un toast selon le type d'erreur
  if (showToast) {
    switch (type) {
      case ErrorType.VALIDATION:
        if (validationErrors) {
          const errorMessages = Object.values(validationErrors)
            .flat()
            .join(', ');
          toast.error(errorMessages || message);
        } else {
          toast.error(message);
        }
        break;
      
      case ErrorType.UNAUTHORIZED:
        toast.error('Vous devez être connecté pour effectuer cette action');
        break;
      
      case ErrorType.FORBIDDEN:
        toast.error("Vous n'avez pas les permissions nécessaires");
        break;
      
      case ErrorType.NOT_FOUND:
        toast.error('Ressource introuvable');
        break;
      
      case ErrorType.NETWORK:
        toast.error('Erreur de connexion. Vérifiez votre connexion internet');
        break;
      
      case ErrorType.SERVER:
        toast.error('Erreur serveur. Veuillez réessayer plus tard');
        break;
      
      default:
        toast.error(message);
    }
  }

  return {
    type,
    message,
    validationErrors: validationErrors || undefined,
  };
}

/**
 * Gère une erreur de validation spécifiquement
 */
export function handleValidationError(
  error: unknown,
  setError?: (field: string, message: string) => void,
  fieldMapping?: Record<string, string>
): Record<string, string[]> | null {
  const validationErrors = extractValidationErrors(error);
  
  if (validationErrors && setError && fieldMapping) {
    // Mapper les erreurs du serveur vers les champs du formulaire
    Object.entries(validationErrors).forEach(([serverField, messages]) => {
      const formField = fieldMapping[serverField];
      if (formField && messages.length > 0) {
        setError(formField, messages[0]);
      }
    });
  }
  
  return validationErrors;
}

