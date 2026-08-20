/**
 * Hooks CRUD tables restaurant / lounge et zones night-club
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { extractApiData } from "@/types/api-response.types";
import { handleError } from "@/lib/error-handler";
import { toast } from "sonner";

export type RestaurantTable = {
  id: number;
  restaurant_id: number;
  table_number: string;
  capacity: number;
  location?: string | null;
  table_type: string;
  is_active: boolean;
  display_name?: string;
};

export type RestaurantTableFormData = {
  restaurant_id: number;
  table_number: string;
  capacity: number;
  location?: string;
  table_type: string;
  is_active?: boolean;
};

export type LoungeTable = {
  id: number;
  lounge_id: number;
  table_number: string;
  capacity: number;
  location?: string | null;
  table_type: string;
  is_active: boolean;
  minimum_spend?: string | number | null;
  display_name?: string;
};

export type LoungeTableFormData = {
  lounge_id: number;
  table_number: string;
  capacity: number;
  location?: string;
  table_type: string;
  is_active?: boolean;
  minimum_spend?: number | null;
};

export type NightClubArea = {
  id: number;
  night_club_id: number;
  area_name: string;
  location?: string | null;
  area_type: string;
  capacity?: number | null;
  is_active: boolean;
  reservation_required?: boolean;
  minimum_spend?: string | number | null;
  table_fee?: string | number | null;
  display_name?: string;
};

export type NightClubAreaFormData = {
  night_club_id: number;
  area_name: string;
  location?: string;
  area_type: string;
  capacity?: number | null;
  is_active?: boolean;
  reservation_required?: boolean;
  minimum_spend?: number | null;
  table_fee?: number | null;
};

export function useRestaurantTables(restaurantId: number) {
  return useQuery({
    queryKey: ["restaurants", restaurantId, "tables"],
    queryFn: async () => {
      const res = await api.get(`/restaurants/${restaurantId}/tables`);
      return extractApiData<RestaurantTable[]>(res.data) || [];
    },
    enabled: !!restaurantId,
  });
}

export function useCreateRestaurantTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RestaurantTableFormData) =>
      api.post("/restaurant-tables", data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["restaurants", vars.restaurant_id, "tables"] });
      toast.success("Table créée");
    },
    onError: (e) => handleError(e, { defaultMessage: "Erreur création table" }),
  });
}

export function useUpdateRestaurantTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RestaurantTableFormData }) =>
      api.put(`/restaurant-tables/${id}`, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: ["restaurants", vars.data.restaurant_id, "tables"],
      });
      toast.success("Table mise à jour");
    },
    onError: (e) => handleError(e, { defaultMessage: "Erreur mise à jour table" }),
  });
}

export function useDeleteRestaurantTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, restaurantId }: { id: number; restaurantId: number }) =>
      api.delete(`/restaurant-tables/${id}`).then(() => restaurantId),
    onSuccess: (restaurantId) => {
      qc.invalidateQueries({ queryKey: ["restaurants", restaurantId, "tables"] });
      toast.success("Table supprimée");
    },
    onError: (e) => handleError(e, { defaultMessage: "Erreur suppression table" }),
  });
}

export function useLoungeTables(loungeId: number) {
  return useQuery({
    queryKey: ["lounges", loungeId, "tables"],
    queryFn: async () => {
      const res = await api.get(`/lounges/${loungeId}/tables`);
      return extractApiData<LoungeTable[]>(res.data) || [];
    },
    enabled: !!loungeId,
  });
}

export function useCreateLoungeTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: LoungeTableFormData) => api.post("/lounge-tables", data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["lounges", vars.lounge_id, "tables"] });
      toast.success("Table créée");
    },
    onError: (e) => handleError(e, { defaultMessage: "Erreur création table" }),
  });
}

export function useUpdateLoungeTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: LoungeTableFormData }) =>
      api.put(`/lounge-tables/${id}`, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["lounges", vars.data.lounge_id, "tables"] });
      toast.success("Table mise à jour");
    },
    onError: (e) => handleError(e, { defaultMessage: "Erreur mise à jour table" }),
  });
}

export function useDeleteLoungeTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, loungeId }: { id: number; loungeId: number }) =>
      api.delete(`/lounge-tables/${id}`).then(() => loungeId),
    onSuccess: (loungeId) => {
      qc.invalidateQueries({ queryKey: ["lounges", loungeId, "tables"] });
      toast.success("Table supprimée");
    },
    onError: (e) => handleError(e, { defaultMessage: "Erreur suppression table" }),
  });
}

export function useNightClubAreas(nightClubId: number) {
  return useQuery({
    queryKey: ["night-clubs", nightClubId, "areas"],
    queryFn: async () => {
      const res = await api.get(`/night-clubs/${nightClubId}/areas`);
      return extractApiData<NightClubArea[]>(res.data) || [];
    },
    enabled: !!nightClubId,
  });
}

export function useCreateNightClubArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: NightClubAreaFormData) =>
      api.post("/night-club-areas", data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["night-clubs", vars.night_club_id, "areas"] });
      toast.success("Zone créée");
    },
    onError: (e) => handleError(e, { defaultMessage: "Erreur création zone" }),
  });
}

export function useUpdateNightClubArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: NightClubAreaFormData }) =>
      api.put(`/night-club-areas/${id}`, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: ["night-clubs", vars.data.night_club_id, "areas"],
      });
      toast.success("Zone mise à jour");
    },
    onError: (e) => handleError(e, { defaultMessage: "Erreur mise à jour zone" }),
  });
}

export function useDeleteNightClubArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, nightClubId }: { id: number; nightClubId: number }) =>
      api.delete(`/night-club-areas/${id}`).then(() => nightClubId),
    onSuccess: (nightClubId) => {
      qc.invalidateQueries({ queryKey: ["night-clubs", nightClubId, "areas"] });
      toast.success("Zone supprimée");
    },
    onError: (e) => handleError(e, { defaultMessage: "Erreur suppression zone" }),
  });
}
