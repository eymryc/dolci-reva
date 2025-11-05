import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";

// Types
export interface Commission {
  id: number;
  commission: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CommissionFormData {
  commission: number;
  is_active: boolean;
}

// GET - Fetch all commissions
export function useCommissions() {
  return useQuery({
    queryKey: ["commissions"],
    queryFn: async () => {
      const response = await api.get("/commissions");
      return response.data.data as Commission[];
    },
  });
}

// GET - Fetch single commission
export function useCommission(id: number) {
  return useQuery({
    queryKey: ["commissions", id],
    queryFn: async () => {
      const response = await api.get(`/commissions/${id}`);
      return response.data.data as Commission;
    },
    enabled: !!id,
  });
}

// POST - Create commission
export function useCreateCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CommissionFormData) => {
      const response = await api.post("/commissions", data);
      return response.data.data as Commission;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
      toast.success("Commission créée avec succès !");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Échec de la création de la commission"
      );
    },
  });
}

// PUT - Update commission
export function useUpdateCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: CommissionFormData;
    }) => {
      const response = await api.put(`/commissions/${id}`, data);
      return response.data.data as Commission;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
      queryClient.invalidateQueries({
        queryKey: ["commissions", variables.id],
      });
      toast.success("Commission mise à jour avec succès !");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Échec de la mise à jour de la commission"
      );
    },
  });
}

// DELETE - Delete commission
export function useDeleteCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/commissions/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
      toast.success("Commission supprimée avec succès !");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Échec de la suppression de la commission"
      );
    },
  });
}

