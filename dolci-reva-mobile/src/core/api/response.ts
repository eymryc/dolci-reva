/**
 * Port fidèle de dolci-reva-web/types/api-response.types.ts : l'API Laravel
 * ne renvoie pas toujours la même enveloppe (status/success/message/data,
 * ou juste success/data, ou une Resource Collection paginée, ou la Resource
 * brute). Ce helper gère tous les cas de la même façon des deux côtés.
 */

export interface PaginatedApiResponse<T> {
  data: T[];
  links?: { first: string | null; last: string | null; prev: string | null; next: string | null };
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

function isPaginatedResponse<T>(response: unknown): response is PaginatedApiResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    Array.isArray((response as { data: unknown }).data) &&
    'meta' in response
  );
}

export function extractApiData<T>(response: unknown): T | null {
  if (typeof response !== 'object' || response === null) {
    return null;
  }

  const r = response as Record<string, unknown>;

  if (isPaginatedResponse<T>(response)) {
    return response.data as unknown as T;
  }

  if ('data' in r) {
    return r.data as T;
  }

  return response as T;
}
