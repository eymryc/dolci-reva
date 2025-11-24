import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { StandardApiResponse, ValidationErrorResponse, PaginatedApiResponse } from '@/types/api-responses';
import { usePermissions } from './use-permissions';

// Types
export interface VisitDwellingImage {
  id: number;
  name: string;
  file_name: string;
  mime_type: string;
  size: string;
  collection_name: string;
  url: string;
  thumb_url: string;
  medium_url?: string;
  large_url?: string;
  created_at: string;
}

export interface VisitDwelling {
  id: number;
  address: string;
  city: string;
  country: string;
  main_image_url?: string | null;
  main_image_thumb_url?: string | null;
  gallery_images?: VisitDwellingImage[];
  all_images?: VisitDwellingImage[];
}

export interface VisitUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export interface Visit {
  id: number;
  dwelling_id: string;
  visitor_id: string;
  owner_id: string;
  visit_reference: string;
  scheduled_at: string;
  visited_at: string | null;
  status: string;
  status_label: string;
  notes: string | null;
  cancellation_reason: string | null;
  cancelled_by: string | null;
  cancelled_at: string | null;
  owner_confirmed: boolean;
  dwelling: VisitDwelling;
  visitor: VisitUser | null;
  owner: VisitUser;
}

export interface VisitFormData {
  dwelling_id: number;
  scheduled_at: string; // Format: YYYY-MM-DD HH:mm:ss ou ISO 8601
}

export type VisitResponse = StandardApiResponse;

export type PaginatedVisitsResponse = PaginatedApiResponse<Visit>;

// GET - Fetch all visits with pagination
export function useVisits(page: number = 1) {
  const { canViewAll, getUserId, isOwner, isCustomer } = usePermissions();
  const userId = getUserId();

  return useQuery({
    queryKey: ['visits', page, userId, canViewAll()],
    queryFn: async () => {
      const params: Record<string, string | number> = { page };
      
      // Si l'utilisateur n'est pas admin, filtrer selon son type
      if (!canViewAll() && userId) {
        if (isOwner()) {
          // Les propriétaires voient leurs visites en tant que propriétaire
          params.owner_id = userId;
        } else if (isCustomer()) {
          // Les clients voient leurs visites en tant que visiteur
          params.visitor_id = userId;
        }
      }

      const response = await api.get('/visits', { params });
      return response.data as PaginatedVisitsResponse;
    },
  });
}

// GET - Fetch single visit
export function useVisit(id: number) {
  return useQuery({
    queryKey: ['visits', id],
    queryFn: async () => {
      const response = await api.get(`/visits/${id}`);
      return response.data.data as Visit;
    },
    enabled: !!id,
  });
}

// POST - Create visit request
export function useCreateVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VisitFormData) => {
      const response = await api.post('/visits', data);
      return response.data as VisitResponse;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      toast.success(data.message || 'Demande de visite envoyée avec succès !');
    },
    onError: (error: unknown) => {
      const axiosError = error as { 
        response?: { 
          status?: number;
          data?: ValidationErrorResponse | { message?: string; error?: string } 
        } 
      };
      
      // Gérer les erreurs de validation (422)
      if (axiosError.response?.status === 422) {
        const validationError = axiosError.response.data as ValidationErrorResponse;
        if (validationError?.data) {
          // Afficher toutes les erreurs de validation
          const errorMessages = Object.values(validationError.data)
            .flat()
            .join(', ');
          toast.error(errorMessages || validationError.message || 'Erreurs de validation');
        } else {
          toast.error(validationError?.message || 'Erreurs de validation');
        }
      } else {
        // Autres erreurs
        const errorData = axiosError.response?.data as { message?: string; error?: string };
        toast.error(
          errorData?.message ||
          errorData?.error ||
          'Erreur lors de l\'envoi de la demande de visite'
        );
      }
    },
  });
}

// POST - Confirm visit
export function useConfirmVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/visits/${id}/confirm`);
      return response.data as StandardApiResponse;
    },
    onSuccess: (data, visitId) => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      queryClient.invalidateQueries({ queryKey: ['visits', visitId] });
      toast.success(data.message || 'Visite confirmée avec succès !');
    },
    onError: (error: unknown) => {
      const axiosError = error as { 
        response?: { 
          status?: number;
          data?: StandardApiResponse | ValidationErrorResponse | { message?: string; error?: string } 
        } 
      };
      
      // Gérer les erreurs de validation (422)
      if (axiosError.response?.status === 422) {
        const validationError = axiosError.response.data as ValidationErrorResponse;
        if (validationError?.data) {
          const errorMessages = Object.values(validationError.data)
            .flat()
            .join(', ');
          toast.error(errorMessages || validationError.message || 'Erreurs de validation');
        } else {
          toast.error(validationError?.message || 'Erreurs de validation');
        }
      } else {
        // Autres erreurs
        const errorData = axiosError.response?.data as StandardApiResponse | { message?: string; error?: string };
        toast.error(
          (errorData as StandardApiResponse)?.message ||
          (errorData as { message?: string; error?: string })?.message ||
          (errorData as { message?: string; error?: string })?.error ||
          'Erreur lors de la confirmation de la visite'
        );
      }
    },
  });
}

