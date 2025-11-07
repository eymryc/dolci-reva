import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { usePermissions } from "./use-permissions";

// Types
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  type: string;
  role: string;
  permissions: string[];
  businessTypes?: Array<{
    id: number;
    name: string;
  }>;
  created_at?: string;
  updated_at?: string;
}

export interface UserFormData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  password?: string;
  type: string;
  business_type_ids?: number[];
}

// GET - Fetch all users
export function useUsers() {
  const { canManageUsers, canViewAll } = usePermissions();

  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      // Seuls les admins peuvent voir tous les utilisateurs
      if (!canManageUsers() || !canViewAll()) {
        return [] as User[];
      }
      const response = await api.get("/users");
      return response.data.data as User[];
    },
    enabled: canManageUsers() && canViewAll(),
  });
}

// GET - Fetch single user
export function useUser(id: number) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: async () => {
      const response = await api.get(`/users/${id}`);
      return response.data.data as User;
    },
    enabled: !!id,
  });
}

// POST - Create user
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UserFormData) => {
      const response = await api.post("/users", data);
      return response.data.data as User;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Utilisateur créé avec succès!");
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { message?: string; error?: string } } };
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          "Échec de la création de l'utilisateur"
      );
    },
  });
}

// PUT - Update user
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<UserFormData>;
    }) => {
      const response = await api.put(`/users/${id}`, data);
      return response.data.data as User;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({
        queryKey: ["users", variables.id],
      });
      toast.success("Utilisateur modifié avec succès!");
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { message?: string; error?: string } } };
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          "Échec de la modification de l'utilisateur"
      );
    },
  });
}

// DELETE - Delete user
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/users/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Utilisateur supprimé avec succès!");
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { message?: string; error?: string } } };
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          "Échec de la suppression de l'utilisateur"
      );
    },
  });
}

