import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { SingleDataApiResponse, extractApiData } from "@/types/api-response.types";

export interface Stats {
  residences: number;
  hebergements: number;
  visites: number;
  reservations: number;
}

/**
 * Hook pour récupérer les statistiques du dashboard
 * 
 * @returns {Object} Objet contenant les données de statistiques, l'état de chargement, et l'erreur éventuelle
 * 
 * @example
 * ```tsx
 * const { data: statsResponse, isLoading } = useStats();
 * const stats = statsResponse?.data;
 * ```
 */
export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const response = await api.get<SingleDataApiResponse<Stats>>("/stats");
      const stats = extractApiData<Stats>(response.data);
      if (!stats) throw new Error('Stats not found');
      return stats;
    },
  });
}

