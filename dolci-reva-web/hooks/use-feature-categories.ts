import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import type { FeatureCategory, FeatureOption } from "@/types/common";
import { ApiResponse, extractApiData } from "@/types/api-response.types";
import { handleError } from "@/lib/error-handler";

export interface EstablishmentTypeOption {
  name: string;
  value: string;
  label: string;
}

export interface FeatureCategoryFormData {
  name: string;
  icon?: string;
  display_order?: number;
  establishment_types: string[];
}

export interface FeatureOptionFormData {
  feature_category_id: number;
  name: string;
  has_surcharge?: boolean;
  display_order?: number;
}

// GET - Liste des types d'établissement disponibles (pour peupler les sélecteurs admin)
export function useEstablishmentTypes() {
  return useQuery({
    queryKey: ["establishment-types"],
    queryFn: async () => {
      const response = await api.get("/establishment-types");
      const data = extractApiData<EstablishmentTypeOption[]>(response.data);
      return data || [];
    },
    staleTime: Infinity,
  });
}

// GET - Fetch all feature categories, optionnellement filtrées par type d'établissement
export function useFeatureCategories(establishmentType?: string) {
  return useQuery({
    queryKey: ["feature-categories", establishmentType ?? null],
    queryFn: async () => {
      const response = await api.get("/feature-categories", {
        params: establishmentType ? { establishment_type: establishmentType } : undefined,
      });
      const data = extractApiData<FeatureCategory[]>(response.data);
      return data || [];
    },
  });
}

// GET - Fetch single feature category
export function useFeatureCategory(id: number) {
  return useQuery({
    queryKey: ["feature-categories", id],
    queryFn: async () => {
      const response = await api.get(`/feature-categories/${id}`);
      const data = extractApiData<FeatureCategory>(response.data);
      if (!data) throw new Error("Feature category not found");
      return data;
    },
    enabled: !!id,
  });
}

// POST - Create feature category
export function useCreateFeatureCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FeatureCategoryFormData) => {
      const response = await api.post<ApiResponse<FeatureCategory>>("/feature-categories", data);
      const result = extractApiData<FeatureCategory>(response.data);
      if (!result) throw new Error("Failed to create feature category");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-categories"] });
      toast.success("Catégorie créée avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la création de la catégorie" });
    },
  });
}

// PUT - Update feature category
export function useUpdateFeatureCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<FeatureCategoryFormData> }) => {
      const response = await api.put<ApiResponse<FeatureCategory>>(`/feature-categories/${id}`, data);
      const result = extractApiData<FeatureCategory>(response.data);
      if (!result) throw new Error("Failed to update feature category");
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["feature-categories"] });
      queryClient.invalidateQueries({ queryKey: ["feature-categories", variables.id] });
      toast.success("Catégorie mise à jour avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la mise à jour de la catégorie" });
    },
  });
}

// DELETE - Delete feature category
export function useDeleteFeatureCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/feature-categories/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-categories"] });
      toast.success("Catégorie supprimée avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la suppression de la catégorie" });
    },
  });
}

// POST - Create feature option
export function useCreateFeatureOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FeatureOptionFormData) => {
      const response = await api.post<ApiResponse<FeatureOption>>("/feature-options", data);
      const result = extractApiData<FeatureOption>(response.data);
      if (!result) throw new Error("Failed to create feature option");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-categories"] });
      toast.success("Option créée avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la création de l'option" });
    },
  });
}

// PUT - Update feature option
export function useUpdateFeatureOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<FeatureOptionFormData> }) => {
      const response = await api.put<ApiResponse<FeatureOption>>(`/feature-options/${id}`, data);
      const result = extractApiData<FeatureOption>(response.data);
      if (!result) throw new Error("Failed to update feature option");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-categories"] });
      toast.success("Option mise à jour avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la mise à jour de l'option" });
    },
  });
}

// DELETE - Delete feature option
export function useDeleteFeatureOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/feature-options/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-categories"] });
      toast.success("Option supprimée avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la suppression de l'option" });
    },
  });
}
