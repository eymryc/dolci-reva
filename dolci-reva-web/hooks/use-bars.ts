import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { extractApiData } from "@/types/api-response.types";
import type { NightlifeVenue } from "@/types/entities/nightlife-venue.types";

export function usePublicBars(filters?: { search?: string; city?: string }) {
  return useQuery({
    queryKey: ["public", "bars", filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters?.search) params.search = filters.search.trim();
      if (filters?.city) params.city = filters.city.trim();
      const response = await api.get("/public/bars", { params });
      const data = extractApiData<NightlifeVenue[]>(response.data);
      return data || [];
    },
  });
}

export function usePublicBar(id: number) {
  return useQuery({
    queryKey: ["public", "bars", id],
    queryFn: async () => {
      const response = await api.get(`/public/bars/${id}`);
      const data = extractApiData<NightlifeVenue>(response.data);
      if (!data) throw new Error("Bar introuvable");
      return data;
    },
    enabled: !!id,
  });
}
