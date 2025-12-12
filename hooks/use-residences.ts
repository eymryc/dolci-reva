import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import api from "@/lib/axios";
import { toast } from "sonner";
import { usePermissions } from "./use-permissions";
import { logger } from "@/lib/logger";
import type { Amenity, Owner } from "@/types/common";
import { ApiResponse, extractApiData } from "@/types/api-response.types";
import { handleError } from "@/lib/error-handler";

// Réexporter les types pour la compatibilité
export type { Amenity, Owner };

export interface GalleryImage {
  id: number;
  name: string;
  file_name: string;
  mime_type: string;
  size: number;
  collection_name: string;
  url: string;
  thumb_url: string;
  medium_url?: string;
  large_url?: string;
  created_at: string;
}

export interface AvailabilityStatus {
  status: string;
  message: string;
  next_available_date: string;
}

export interface Residence {
  id: number;
  owner_id: number;
  name: string;
  description?: string | null;
  address: string;
  city: string;
  country: string;
  latitude?: string | null;
  longitude?: string | null;
  type: string; // STUDIO, etc.
  max_guests: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  piece_number?: number | null;
  price: string;
  standing: string; // STANDARD, etc.
  average_rating: string;
  total_ratings: number;
  rating_count: number;
  rating_percentage: number;
  stars: number;
  has_ratings: boolean;
  is_available: boolean;
  is_active: boolean;
  availability_status: AvailabilityStatus;
  next_available_date: string;
  unavailable_dates: string[];
  created_at: string;
  updated_at: string;
  amenities: Amenity[];
  main_image_url?: string | null;
  main_image_thumb_url?: string | null;
  gallery_images: GalleryImage[];
  all_images: GalleryImage[];
  owner: Owner;
}

export interface ResidenceFormData {
  name: string;
  description?: string;
  address: string;
  city: string;
  country: string;
  latitude?: string;
  longitude?: string;
  type: string; // STUDIO, APARTMENT, VILLA, etc.
  max_guests: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  piece_number?: number | null;
  price: string;
  standing: string; // STANDARD, PREMIUM, LUXURY, etc.
  owner_id?: number;
  amenities?: number[];
}

/**
 * Hook pour récupérer toutes les résidences (admin)
 * 
 * Les résidences sont filtrées automatiquement selon les permissions :
 * - Les admins voient toutes les résidences
 * - Les propriétaires voient uniquement leurs propres résidences
 * 
 * @returns {Object} Objet contenant les données, l'état de chargement, et les fonctions de rafraîchissement
 * 
 * @example
 * ```tsx
 * const { data: residences, isLoading, refetch } = useResidences();
 * ```
 */
export function useResidences() {
  const { canViewAll, getUserId } = usePermissions();
  const userId = getUserId();

  return useQuery({
    queryKey: ["residences", userId, canViewAll()],
    queryFn: async () => {
      const params: Record<string, string | number | boolean | undefined> = {};
      
      // Si l'utilisateur n'est pas admin, filtrer par owner_id
      if (!canViewAll() && userId) {
        params.owner_id = userId;
      }

      const response = await api.get("/residences", { params });
      // Handle Laravel paginated response
      const data = extractApiData<Residence[]>(response.data);
      return data || [];
    },
  });
}

/**
 * Filtres pour la recherche publique de résidences
 */
export interface PublicResidencesFilters {
  /** Terme de recherche textuel */
  search?: string;
  /** Ville de la résidence */
  city?: string;
  /** Type de résidence (STUDIO, APPARTEMENT, etc.) */
  type?: string;
  /** Standing de la résidence (STANDARD, PREMIUM, etc.) */
  standing?: string;
  /** Ordre de tri par prix ('asc' ou 'desc') */
  order_price?: 'asc' | 'desc';
}

/**
 * Hook pour récupérer les résidences publiques avec filtres
 * 
 * Utilisé pour la recherche publique (front-office) sans authentification requise.
 * 
 * @param filters - Filtres optionnels pour la recherche
 * @returns {Object} Objet contenant les données, l'état de chargement, et l'erreur éventuelle
 * 
 * @example
 * ```tsx
 * const { data: residences, isLoading } = usePublicResidences({
 *   city: 'Abidjan',
 *   type: 'APPARTEMENT',
 *   order_price: 'asc'
 * });
 * ```
 */
export function usePublicResidences(filters?: PublicResidencesFilters) {
  return useQuery({
    queryKey: ["public", "residences", filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      
      if (filters?.search) params.search = filters.search.trim();
      if (filters?.city) params.city = filters.city.trim();
      if (filters?.type) params.type = filters.type.trim();
      if (filters?.standing) params.standing = filters.standing.trim();
      if (filters?.order_price) params.order_price = filters.order_price.toLowerCase();
      
      const response = await api.get("/public/residences", { params });
      // Handle Laravel response
      const data = extractApiData<Residence[]>(response.data);
      return data || [];
    },
  });
}

/**
 * Hook pour récupérer une résidence publique par son ID
 * 
 * @param id - Identifiant de la résidence
 * @returns {Object} Objet contenant les données de la résidence, l'état de chargement, et l'erreur éventuelle
 * 
 * @example
 * ```tsx
 * const { data: residence, isLoading } = usePublicResidence(123);
 * ```
 */
export function usePublicResidence(id: number) {
  return useQuery({
    queryKey: ["public", "residences", id],
    queryFn: async () => {
      const response = await api.get(`/public/residences/${id}`);
      const data = extractApiData<Residence>(response.data);
      if (!data) throw new Error('Residence not found');
      return data;
    },
  });
}


/**
 * Hook pour récupérer une résidence par son ID
 * 
 * @param id - Identifiant de la résidence
 * @returns {Object} Objet contenant les données de la résidence, l'état de chargement, et l'erreur éventuelle
 * 
 * @example
 * ```tsx
 * const { data: residence, isLoading } = useResidence(123);
 * ```
 */
export function useResidence(id: number) {
  return useQuery({
    queryKey: ["residences", id],
    queryFn: async () => {
      const response = await api.get(`/residences/${id}`);
      const data = extractApiData<Residence>(response.data);
      if (!data) throw new Error('Residence not found');
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Hook pour créer une nouvelle résidence
 * 
 * Invalide automatiquement le cache des résidences après succès.
 * 
 * @returns {Object} Mutation object avec les fonctions mutate, isPending, etc.
 * 
 * @example
 * ```tsx
 * const createMutation = useCreateResidence();
 * 
 * const handleCreate = () => {
 *   createMutation.mutate({
 *     data: { name: 'Ma résidence', ... },
 *     images: { mainImage: file, galleryImages: [file1, file2] }
 *   });
 * };
 * ```
 */
export function useCreateResidence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      images,
    }: {
      data: ResidenceFormData;
      images?: { mainImage?: File | null; galleryImages?: File[] };
    }) => {
      const formData = new FormData();
      
      // Add form data fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === "amenities") {
          // Handle amenities array separately
          if (Array.isArray(value) && value.length > 0) {
            value.forEach((id) => {
              formData.append("amenities[]", id.toString());
            });
          }
        } else if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value.toString());
        }
      });

      // Add all images as images[] array (main image first, then gallery images)
      const allImages: File[] = [];
      if (images?.mainImage) {
        allImages.push(images.mainImage);
      }
      if (images?.galleryImages && images.galleryImages.length > 0) {
        allImages.push(...images.galleryImages);
      }
      
      if (allImages.length > 0) {
        allImages.forEach((image) => {
          formData.append("images[]", image);
        });
      }

      const response = await api.post<ApiResponse<Residence>>("/residences", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const residenceData = extractApiData<Residence>(response.data);
      if (!residenceData) throw new Error('Failed to create residence');
      return residenceData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["residences"] });
      toast.success("Residence created successfully!");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Failed to create residence" });
    },
  });
}

/**
 * Hook pour mettre à jour une résidence existante
 * 
 * Invalide automatiquement le cache des résidences après succès.
 * 
 * @returns {Object} Mutation object avec les fonctions mutate, isPending, etc.
 * 
 * @example
 * ```tsx
 * const updateMutation = useUpdateResidence();
 * 
 * const handleUpdate = () => {
 *   updateMutation.mutate({
 *     id: 123,
 *     data: { name: 'Nouveau nom', ... },
 *     images: { mainImage: file }
 *   });
 * };
 * ```
 */
export function useUpdateResidence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
      images,
    }: {
      id: number;
      data: ResidenceFormData;
      images?: { mainImage?: File | null; galleryImages?: File[] };
    }) => {
      const formData = new FormData();
      
      logger.debug('Residence form data:', data);
      // Add form data fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === "amenities") {
          // Handle amenities array separately
          if (Array.isArray(value) && value.length > 0) {
            value.forEach((id) => {
              formData.append("amenities[]", id.toString());
            });
          }
        } else if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value.toString());
        }
      });

      // Add all images as images[] array (main image first, then gallery images)
      const allImages: File[] = [];
      if (images?.mainImage) {
        allImages.push(images.mainImage);
      }
      if (images?.galleryImages && images.galleryImages.length > 0) {
        allImages.push(...images.galleryImages);
      }
      
      if (allImages.length > 0) {
        allImages.forEach((image) => {
          formData.append("images[]", image);
        });
      }

      const response = await api.put<ApiResponse<Residence>>(`/residences/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const residenceData = extractApiData<Residence>(response.data);
      if (!residenceData) throw new Error('Failed to update residence');
      return residenceData;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["residences"] });
      queryClient.invalidateQueries({
        queryKey: ["residences", variables.id],
      });
      toast.success("Residence updated successfully!");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Failed to update residence" });
    },
  });
}

/**
 * Hook pour supprimer une résidence
 * 
 * Invalide automatiquement le cache des résidences après succès.
 * 
 * @returns {Object} Mutation object avec les fonctions mutate, isPending, etc.
 * 
 * @example
 * ```tsx
 * const deleteMutation = useDeleteResidence();
 * 
 * const handleDelete = () => {
 *   deleteMutation.mutate(123);
 * };
 * ```
 */
export function useDeleteResidence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/residences/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["residences"] });
      toast.success("Residence deleted successfully!");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Failed to delete residence" });
    },
  });
}

/**
 * Données pour réserver une résidence
 */
export interface ResidenceBookingData {
  start_date: string; // Format: YYYY-MM-DD
  end_date: string; // Format: YYYY-MM-DD
  guests: number;
}

/**
 * Réponse de réservation d'une résidence
 */
export interface ResidenceBookingResponse {
  data?: unknown;
  payment_url?: string;
  message?: string;
}

/**
 * Hook pour réserver une résidence
 * 
 * @returns {Object} Mutation object avec les fonctions mutate, isPending, etc.
 * 
 * @example
 * ```tsx
 * const bookMutation = useBookResidence();
 * 
 * const handleBook = () => {
 *   bookMutation.mutate({
 *     residenceId: 123,
 *     data: {
 *       start_date: '2025-12-01',
 *       end_date: '2025-12-05',
 *       guests: 2
 *     }
 *   });
 * };
 * ```
 */
export function useBookResidence() {
  return useMutation({
    mutationFn: async ({
      residenceId,
      data,
    }: {
      residenceId: number;
      data: ResidenceBookingData;
    }) => {
      const response = await api.post(`/residences/${residenceId}/book`, data);
      return response.data as ResidenceBookingResponse;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Réservation effectuée avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Erreur lors de la réservation" });
    },
  });
}

