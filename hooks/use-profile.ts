import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

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
      const response = await api.put("/profile", data);
      return response.data;
    },
    onSuccess: async () => {
      await refreshUser();
      toast.success("Profil mis à jour avec succès !");
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(
        axiosError.response?.data?.message || "Erreur lors de la mise à jour du profil"
      );
    },
  });
}

