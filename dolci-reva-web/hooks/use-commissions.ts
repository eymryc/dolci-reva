import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { ApiResponse, extractApiData } from "@/types/api-response.types";
import { handleError } from "@/lib/error-handler";

// Types
export interface Commission {
  id: number;
  commission: number;
  bookable_type: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CommissionFormData {
  commission: number;
  bookable_type: string | null;
  is_active: boolean;
}

// Verticales pour lesquelles un taux de commission dédié peut être défini.
// bookable_type: null = taux global de repli, utilisé si aucun taux
// spécifique n'est actif pour la verticale (cf. Commission::BOOKABLE_TYPES
// côté API, doit rester synchronisé avec cette liste).
export const COMMISSION_VERTICALS: { value: string | null; label: string }[] = [
  { value: null, label: "Taux global (par défaut)" },
  { value: "App\\Models\\Residence", label: "Résidences" },
  { value: "App\\Models\\Hotel", label: "Hôtels" },
  { value: "App\\Models\\Restaurant", label: "Restaurants" },
  { value: "App\\Models\\Lounge", label: "Lounges / Bars" },
  { value: "App\\Models\\NightClub", label: "Night-clubs" },
  { value: "App\\Models\\Dwelling", label: "Se loger (hébergement longue durée)" },
];

export function commissionVerticalLabel(bookableType: string | null): string {
  return (
    COMMISSION_VERTICALS.find((v) => v.value === bookableType)?.label ??
    bookableType ??
    "Taux global (par défaut)"
  );
}

// GET - Fetch all commissions
export function useCommissions() {
  return useQuery({
    queryKey: ["commissions"],
    queryFn: async () => {
      const response = await api.get("/commissions");
      const data = extractApiData<Commission[]>(response.data);
      return data || [];
    },
  });
}

// GET - Fetch single commission
export function useCommission(id: number) {
  return useQuery({
    queryKey: ["commissions", id],
    queryFn: async () => {
      const response = await api.get(`/commissions/${id}`);
      const data = extractApiData<Commission>(response.data);
      if (!data) throw new Error('Commission not found');
      return data;
    },
    enabled: !!id,
  });
}

// POST - Create commission
export function useCreateCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CommissionFormData) => {
      const response = await api.post<ApiResponse<Commission>>("/commissions", data);
      const commissionData = extractApiData<Commission>(response.data);
      if (!commissionData) throw new Error('Failed to create commission');
      return commissionData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
      toast.success("Commission créée avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la création de la commission" });
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
      const response = await api.put<ApiResponse<Commission>>(`/commissions/${id}`, data);
      const commissionData = extractApiData<Commission>(response.data);
      if (!commissionData) throw new Error('Failed to update commission');
      return commissionData;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
      queryClient.invalidateQueries({
        queryKey: ["commissions", variables.id],
      });
      toast.success("Commission mise à jour avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la mise à jour de la commission" });
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
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la suppression de la commission" });
    },
  });
}

