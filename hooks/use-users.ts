import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PaginatedApiResponse } from "@/types/api-response.types";
import { usePermissions } from "./use-permissions";
import { handleError } from "@/lib/error-handler";
import { userService } from "@/services/user.service";
import type { User, UserFormData } from "@/types/entities/user.types";

// Réexporter les types pour la compatibilité
export type { User, UserFormData };

// GET - Fetch all users with pagination
export function useUsers(page: number = 1) {
  const { canManageUsers, canViewAll } = usePermissions();

  return useQuery({
    queryKey: ["users", page],
    queryFn: () => userService.getAll(page),
    enabled: canManageUsers() && canViewAll(),
    placeholderData: (previousData) => {
      // Retourner des données vides si pas de permissions
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
        } as PaginatedApiResponse<User>;
      }
      return previousData;
    },
  });
}

// GET - Fetch single user
export function useUser(id: number) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => userService.getById(id),
    enabled: !!id,
  });
}

// POST - Create user
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserFormData) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Utilisateur créé avec succès!");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la création de l'utilisateur" });
    },
  });
}

// PUT - Update user
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UserFormData> }) =>
      userService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({
        queryKey: ["users", variables.id],
      });
      toast.success("Utilisateur modifié avec succès!");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la modification de l'utilisateur" });
    },
  });
}

// DELETE - Delete user
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => {
      return userService.delete(id).then(() => id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Utilisateur supprimé avec succès!");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la suppression de l'utilisateur" });
    },
  });
}

