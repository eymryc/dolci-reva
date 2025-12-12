import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useAuth, type User } from "@/context/AuthContext";
import { ApiResponse, extractApiData, extractApiMessage } from "@/types/api-response.types";
import { handleError } from "@/lib/error-handler";

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  id_document_number?: string;
  date_of_birth?: string;
  address_line1?: string;
  address_line2?: string;
  postal_code?: string;
  services?: number[];
}

export function useUpdateProfile() {
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      const response = await api.put<ApiResponse<User>>("/profile", data);
      const userData = extractApiData<User>(response.data);
      if (!userData) throw new Error('Failed to update profile');
      return userData;
    },
    onSuccess: async (data) => {
      await refreshUser();
      toast.success("Profil mis à jour avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Erreur lors de la mise à jour du profil" });
    },
  });
}

