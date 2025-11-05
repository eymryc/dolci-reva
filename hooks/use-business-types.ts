import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";

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
      return response.data.data as BusinessType[];
    },
  });
}


// GET - Fetch single business type
export function useBusinessType(id: number) {
  return useQuery({
    queryKey: ["business-types", id],
    queryFn: async () => {
      const response = await api.get(`/business-types/${id}`);
      return response.data.data as BusinessType;
    },
    enabled: !!id,
  });
}

// POST - Create business type
export function useCreateBusinessType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BusinessTypeFormData) => {
      const response = await api.post("/business-types", data);
      return response.data.data as BusinessType;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-types"] });
      toast.success("Business type created successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to create business type"
      );
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
      const response = await api.put(`/business-types/${id}`, data);
      return response.data.data as BusinessType;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["business-types"] });
      queryClient.invalidateQueries({
        queryKey: ["business-types", variables.id],
      });
      toast.success("Business type updated successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update business type"
      );
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
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to delete business type"
      );
    },
  });
}

