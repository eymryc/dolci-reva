import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import api from "@/lib/axios";
import { toast } from "sonner";
import { usePermissions } from "./use-permissions";

// Types
export interface Amenity {
  id: number;
  name: string;
}

export interface Owner {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  type: string;
  email_verified_at?: string | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
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

// GET - Fetch all residences (admin)
export function useResidences() {
  const { canViewAll, getUserId } = usePermissions();
  const userId = getUserId();

  return useQuery({
    queryKey: ["residences", userId, canViewAll()],
    queryFn: async () => {
      const params: Record<string, any> = {};
      
      // Si l'utilisateur n'est pas admin, filtrer par owner_id
      if (!canViewAll() && userId) {
        params.owner_id = userId;
      }

      const response = await api.get("/residences", { params });
      // Handle Laravel paginated response
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data as Residence[];
      }
      return [] as Residence[];
    },
  });
}

// GET - Fetch public residences with filters
export interface PublicResidencesFilters {
  search?: string;
  city?: string;
  type?: string;
  standing?: string;
  order_price?: 'asc' | 'desc';
}

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
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data as Residence[];
      }
      return [] as Residence[];
    },
  });
}

// GET - Fetch single public residence
export function usePublicResidence(id: number) {
  return useQuery({
    queryKey: ["public", "residences", id],
    queryFn: async () => {
      const response = await api.get(`/public/residences/${id}`);
      return response.data.data as Residence;
    },
  });
}


// GET - Fetch single residence
export function useResidence(id: number) {
  return useQuery({
    queryKey: ["residences", id],
    queryFn: async () => {
      const response = await api.get(`/residences/${id}`);
      return response.data.data as Residence;
    },
    enabled: !!id,
  });
}

// POST - Create residence
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

      const response = await api.post("/residences", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data as Residence;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["residences"] });
      toast.success("Residence created successfully!");
    },
    onError: (error: AxiosError<{ message?: string; error?: string }>) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to create residence"
      );
    },
  });
}

// PUT - Update residence
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
      
      console.log(data);
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

      const response = await api.put(`/residences/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data as Residence;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["residences"] });
      queryClient.invalidateQueries({
        queryKey: ["residences", variables.id],
      });
      toast.success("Residence updated successfully!");
    },
    onError: (error: AxiosError<{ message?: string; error?: string }>) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update residence"
      );
    },
  });
}

// DELETE - Delete residence
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
    onError: (error: AxiosError<{ message?: string; error?: string }>) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to delete residence"
      );
    },
  });
}

// POST - Book residence
export interface ResidenceBookingData {
  start_date: string; // Format: YYYY-MM-DD
  end_date: string; // Format: YYYY-MM-DD
  guests: number;
}

export interface ResidenceBookingResponse {
  data?: unknown;
  payment_url?: string;
  message?: string;
}

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
    onError: (error: AxiosError<{ message?: string; error?: string }>) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Erreur lors de la réservation"
      );
    },
  });
}

