import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";

// Types
export interface Opinion {
  id: number;
  user_id: number;
  residence_id?: number;
  note: number;
  comment: string;
  display?: number;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

export interface OpinionFormData {
  residence_id: number;
  note: number;
  comment: string;
}

// GET - Get public opinions for a residence
export function usePublicOpinions(residenceId: number) {
  return useQuery({
    queryKey: ["public", "opinions", residenceId],
    queryFn: async () => {
      const response = await api.get(`/public/opinions/${residenceId}`);
      return response.data.data as Opinion[];
    },
  });
}

// POST - Create opinion
export function useCreateOpinion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OpinionFormData) => {
      const response = await api.post("/opinions", data);
      return response.data.data as Opinion;
    },
    onSuccess: (data) => {
      // Invalider les avis publics pour cette résidence
      queryClient.invalidateQueries({ 
        queryKey: ["public", "opinions", data.residence_id] 
      });
      // Invalider aussi les données de la résidence pour mettre à jour la note moyenne
      queryClient.invalidateQueries({ 
        queryKey: ["public", "residences", data.residence_id] 
      });
      toast.success("Votre avis a été publié avec succès !");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Échec de la publication de l'avis"
      );
    },
  });
}

