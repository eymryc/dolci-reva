import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { PaginatedApiResponse } from "@/types/api-responses";
import { usePermissions } from "./use-permissions";

// Types
export interface VerificationDocument {
  id: number;
  user_id: number;
  document_type: string;
  identity_document_type?: string | null;
  document_number: string;
  document_issue_date?: string | null;
  document_expiry_date?: string | null;
  issuing_authority?: string | null;
  status: string;
  rejection_reason?: string | null;
  reviewed_by?: number | null;
  reviewed_at?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  document_file?: {
    id: number;
    name: string;
    file_name: string;
    mime_type: string;
    size: number;
    collection_name: string;
    url: string;
    created_at: string;
  } | null;
}

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
  id_document_number?: string | null;
  date_of_birth?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  postal_code?: string | null;
  verification_status?: string;
  verification_level?: string;
  phone_verified?: boolean;
  phone_verified_at?: string | null;
  verified_by?: number | null;
  verified_at?: string | null;
  reputation_score?: string;
  is_premium?: boolean;
  is_verified?: boolean;
  total_bookings?: number;
  cancelled_bookings?: number;
  cancellation_rate?: string;
  has_insurance?: boolean;
  security_deposit?: number | null;
  email_verified_at?: string | null;
  admin_notes?: string | null;
  verifications?: VerificationDocument[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export type PaginatedUsersResponse = PaginatedApiResponse<User>;

export interface UserFormData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  password?: string;
  type: string;
  business_type_ids?: number[];
}

// GET - Fetch all users with pagination
export function useUsers(page: number = 1) {
  const { canManageUsers, canViewAll } = usePermissions();

  return useQuery({
    queryKey: ["users", page],
    queryFn: async () => {
      // Seuls les admins peuvent voir tous les utilisateurs
      if (!canManageUsers() || !canViewAll()) {
        return {
          data: [],
          links: {
            first: null,
            last: null,
            prev: null,
            next: null,
          },
          meta: {
            current_page: 1,
            from: 0,
            last_page: 1,
            links: [],
            path: "",
            per_page: 15,
            to: 0,
            total: 0,
          },
        } as PaginatedUsersResponse;
      }
      const response = await api.get("/users", { params: { page } });
      return response.data as PaginatedUsersResponse;
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

