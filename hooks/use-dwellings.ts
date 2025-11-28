import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import api from "@/lib/axios";
import { toast } from "sonner";
import { usePermissions } from "./use-permissions";
import type { Amenity } from "@/types/common";
import type { Owner as BaseOwner } from "@/types/common";

// Réexporter le type Amenity pour la compatibilité
export type { Amenity };

// Owner étendu avec des propriétés supplémentaires pour les dwellings
export interface Owner extends BaseOwner {
  phone: string;
  email: string;
  type: string;
  verification_status: string;
  verification_level: string;
  phone_verified: boolean;
  phone_verified_at?: string | null;
  id_document_number?: string | null;
  date_of_birth?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  postal_code?: string | null;
  reputation_score: string;
  total_bookings: number;
  cancelled_bookings: number;
  cancellation_rate: string;
  is_premium: boolean;
  premium_until?: string | null;
  security_deposit?: string | null;
  has_insurance: boolean;
  admin_notes?: string | null;
  email_verified_at?: string | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
  verified_by?: number | null;
  verified_at?: string | null;
}

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

export interface Dwelling {
  id: number;
  owner_id: number;
  description?: string | null;
  address: string;
  city: string;
  country: string;
  latitude?: string | null;
  longitude?: string | null;
  phone: string;
  whatsapp: string;
  type: string; // STUDIO, APPARTEMENT, VILLA, etc.
  structure_type: string; // MAISON_BASSE, IMMEUBLE
  structure_type_label: string;
  construction_type: string; // NOUVELLE_CONSTRUCTION, ANCIENNE
  construction_type_label: string;
  rental_status: string; // PENDING, etc.
  security_deposit_month_number: number;
  security_deposit_amount: number;
  visite_price: number;
  rent_advance_amount_number: number;
  rent_advance_amount: number;
  agency_fees_month_number: number;
  agency_fees: number;
  rent: number;
  piece_number?: number | null;
  bathrooms?: number | null;
  rooms?: number | null;
  living_room?: number | null;
  is_available?: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  main_image_url?: string | null;
  main_image_thumb_url?: string | null;
  gallery_images: GalleryImage[];
  all_images: GalleryImage[];
  owner: Owner;
}

export interface DwellingFormData {
  phone: string;
  whatsapp: string;
  security_deposit_month_number: number;
  visite_price: string;
  rent_advance_amount_number: number;
  rent: string;
  description: string;
  address: string;
  city: string;
  country: string;
  latitude?: string;
  longitude?: string;
  type: string; // STUDIO, APARTMENT, VILLA, etc.
  rooms?: number | null;
  bathrooms?: number | null;
  piece_number?: number | null;
  living_room?: number | null;
  structure_type: string; // MAISON_BASSE, IMMEUBLE
  construction_type: string; // NOUVELLE_CONSTRUCTION, ANCIENNE
  agency_fees_month_number?: number;
  agency_fees?: string;
  owner_id?: number;
}

// GET - Fetch all dwellings (admin)
export function useDwellings() {
  const { canViewAll, getUserId } = usePermissions();
  const userId = getUserId();

  return useQuery({
    queryKey: ["dwellings", userId, canViewAll()],
    queryFn: async () => {
      const params: Record<string, string | number | boolean | undefined> = {};
      
      // Si l'utilisateur n'est pas admin, filtrer par owner_id
      if (!canViewAll() && userId) {
        params.owner_id = userId;
      }

      const response = await api.get("/dwellings", { params });
      // Handle Laravel paginated response
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data as Dwelling[];
      }
      return [] as Dwelling[];
    },
  });
}

// GET - Fetch public dwellings with filters
export interface PublicDwellingsFilters {
  search?: string;
  city?: string;
  type?: string;
  standing?: string;
  order_price?: 'asc' | 'desc';
}

export function usePublicDwellings(filters?: PublicDwellingsFilters) {
  return useQuery({
    queryKey: ["public", "dwellings", filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      
      if (filters?.search) params.search = filters.search.trim();
      if (filters?.city) params.city = filters.city.trim();
      if (filters?.type) params.type = filters.type.trim();
      if (filters?.standing) params.standing = filters.standing.trim();
      if (filters?.order_price) params.order_price = filters.order_price.toLowerCase();
      
      const response = await api.get("/public/dwellings", { params });
      // Handle Laravel response
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data as Dwelling[];
      }
      return [] as Dwelling[];
    },
  });
}

// GET - Fetch single public dwelling
export function usePublicDwelling(id: number) {
  return useQuery({
    queryKey: ["public", "dwellings", id],
    queryFn: async () => {
      const response = await api.get(`/public/dwellings/${id}`);
      return response.data.data as Dwelling;
    },
    enabled: !!id,
  });
}

// GET - Fetch single dwelling
export function useDwelling(id: number) {
  return useQuery({
    queryKey: ["dwellings", id],
    queryFn: async () => {
      const response = await api.get(`/dwellings/${id}`);
      return response.data.data as Dwelling;
    },
    enabled: !!id,
  });
}

// POST - Create dwelling
export function useCreateDwelling() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      images,
    }: {
      data: DwellingFormData;
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

      const response = await api.post("/dwellings", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data as Dwelling;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dwellings"] });
      toast.success("Hébergement créé avec succès !");
    },
    onError: (error: AxiosError<{ message?: string; error?: string }>) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Échec de la création de l'hébergement"
      );
    },
  });
}

// PUT - Update dwelling
export function useUpdateDwelling() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
      images,
    }: {
      id: number;
      data: DwellingFormData;
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

      const response = await api.put(`/dwellings/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data as Dwelling;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dwellings"] });
      queryClient.invalidateQueries({
        queryKey: ["dwellings", variables.id],
      });
      toast.success("Hébergement modifié avec succès !");
    },
    onError: (error: AxiosError<{ message?: string; error?: string }>) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Échec de la modification de l'hébergement"
      );
    },
  });
}

// DELETE - Delete dwelling
export function useDeleteDwelling() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/dwellings/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dwellings"] });
      toast.success("Hébergement supprimé avec succès !");
    },
    onError: (error: AxiosError<{ message?: string; error?: string }>) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Échec de la suppression de l'hébergement"
      );
    },
  });
}

// PUT - Toggle dwelling availability
export function useToggleDwellingAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.put(`/dwellings/${id}/availability`);
      return response.data.data as Dwelling;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dwellings"] });
      toast.success("Hébergement marqué comme indisponible avec succès !");
    },
    onError: (error: AxiosError<{ message?: string; error?: string }>) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Échec de la mise à jour de la disponibilité"
      );
    },
  });
}

// POST - Book dwelling
export interface DwellingBookingData {
  start_date: string; // Format: YYYY-MM-DD
  end_date: string; // Format: YYYY-MM-DD
  guests: number;
}

export interface DwellingBookingResponse {
  data?: unknown;
  payment_url?: string;
  message?: string;
}

export function useBookDwelling() {
  return useMutation({
    mutationFn: async ({
      dwellingId,
      data,
    }: {
      dwellingId: number;
      data: DwellingBookingData;
    }) => {
      const response = await api.post(`/dwellings/${dwellingId}/book`, data);
      return response.data as DwellingBookingResponse;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Réservation effectuée avec succès !");
    },
    onError: (error: AxiosError<{ message?: string; error?: string }>) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Erreur lors de la réservation"
      );
    },
  });
}

