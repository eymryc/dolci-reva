import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { ApiResponse, extractApiData } from "@/types/api-response.types";
import { handleError } from "@/lib/error-handler";

// Types
export interface BusinessType {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BusinessTypeFormData {
  name: string;
  description?: string;
}

// GET - Fetch all business types
export function useBusinessTypes() {
  return useQuery({
    queryKey: ["business-types"],
    queryFn: async () => {
      const response = await api.get("/business-types");
      const data = extractApiData<BusinessType[]>(response.data);
      return data || [];
    },
  });
}


// GET - Fetch single business type
export function useBusinessType(id: number) {
  return useQuery({
    queryKey: ["business-types", id],
    queryFn: async () => {
      const response = await api.get(`/business-types/${id}`);
      const data = extractApiData<BusinessType>(response.data);
      if (!data) throw new Error('Business type not found');
      return data;
    },
    enabled: !!id,
  });
}

// POST - Create business type
export function useCreateBusinessType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BusinessTypeFormData) => {
      const response = await api.post<ApiResponse<BusinessType>>("/business-types", data);
      const businessTypeData = extractApiData<BusinessType>(response.data);
      if (!businessTypeData) throw new Error('Failed to create business type');
      return businessTypeData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-types"] });
      toast.success("Business type created successfully!");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Failed to create business type" });
    },
  });
}

// PUT - Update business type
export function useUpdateBusinessType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: BusinessTypeFormData;
    }) => {
      const response = await api.put<ApiResponse<BusinessType>>(`/business-types/${id}`, data);
      const businessTypeData = extractApiData<BusinessType>(response.data);
      if (!businessTypeData) throw new Error('Failed to update business type');
      return businessTypeData;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["business-types"] });
      queryClient.invalidateQueries({
        queryKey: ["business-types", variables.id],
      });
      toast.success("Business type updated successfully!");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Failed to update business type" });
    },
  });
}

// DELETE - Delete business type
export function useDeleteBusinessType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/business-types/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-types"] });
      toast.success("Business type deleted successfully!");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Failed to delete business type" });
    },
  });
}

