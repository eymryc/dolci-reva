import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import type { Amenity } from "@/types/common";
import { ApiResponse, extractApiData } from "@/types/api-response.types";
import { handleError } from "@/lib/error-handler";

// Réexporter le type pour la compatibilité
export type { Amenity };

export interface AmenityFormData {
  name: string;
  description?: string;
}

// GET - Fetch all amenities
export function useAmenities() {
  return useQuery({
    queryKey: ["amenities"],
    queryFn: async () => {
      const response = await api.get("/amenities");
      const data = extractApiData<Amenity[]>(response.data);
      return data || [];
    },
  });
}

// GET - Fetch single amenity
export function useAmenity(id: number) {
  return useQuery({
    queryKey: ["amenities", id],
    queryFn: async () => {
      const response = await api.get(`/amenities/${id}`);
      const data = extractApiData<Amenity>(response.data);
      if (!data) throw new Error('Amenity not found');
      return data;
    },
    enabled: !!id,
  });
}

// POST - Create amenity
export function useCreateAmenity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AmenityFormData) => {
      const response = await api.post<ApiResponse<Amenity>>("/amenities", data);
      const amenityData = extractApiData<Amenity>(response.data);
      if (!amenityData) throw new Error('Failed to create amenity');
      return amenityData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["amenities"] });
      toast.success("Commodité créée avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la création de la commodité" });
    },
  });
}

// PUT - Update amenity
export function useUpdateAmenity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: AmenityFormData;
    }) => {
      const response = await api.put<ApiResponse<Amenity>>(`/amenities/${id}`, data);
      const amenityData = extractApiData<Amenity>(response.data);
      if (!amenityData) throw new Error('Failed to update amenity');
      return amenityData;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["amenities"] });
      queryClient.invalidateQueries({
        queryKey: ["amenities", variables.id],
      });
      toast.success("Commodité mise à jour avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la mise à jour de la commodité" });
    },
  });
}

// DELETE - Delete amenity
export function useDeleteAmenity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/amenities/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["amenities"] });
      toast.success("Commodité supprimée avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la suppression de la commodité" });
    },
  });
}

