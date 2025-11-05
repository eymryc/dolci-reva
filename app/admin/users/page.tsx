"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  Loader2,
  UsersIcon,
} from "lucide-react";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  type User,
  type UserFormData,
} from "@/hooks/use-users";
import { UserTable } from "@/components/admin/users/UserTable";
import { UserModal } from "@/components/admin/users/UserModal";
import { DeleteConfirmationDialog } from "@/components/admin/shared/DeleteConfirmationDialog";

export default function UsersPage() {
  // Users - TanStack Query
  const {
    data: users = [],
    isLoading: isLoadingUsers,
    refetch: refetchUsers,
    isRefetching: isRefetchingUsers,
  } = useUsers();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  // Users State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Handlers
  const handleCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = (data: UserFormData) => {
    if (editingUser) {
      updateMutation.mutate(
        { id: editingUser.id, data },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setEditingUser(null);
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          setIsModalOpen(false);
        },
      });
    }
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setUserToDelete(null);
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#f08400] rounded-xl shadow-lg">
              <UsersIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-[#101828]">
              Utilisateurs
            </h1>
          </div>
          <p className="text-gray-500 text-sm ml-14">
            Gérez les utilisateurs de votre application
          </p>
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
        {/* Users Table */}
        {isLoadingUsers ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#f08400]" />
          </div>
        ) : (
          <UserTable
            data={users}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={deleteMutation.isPending || updateMutation.isPending}
            onRefresh={() => refetchUsers()}
            isRefreshing={isRefetchingUsers}
            addButton={
              <Button
                onClick={handleCreate}
                className="bg-[#f08400] hover:bg-[#d87200] text-white shadow-lg h-12"
                disabled={isLoadingUsers}
              >
                {isLoadingUsers ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-2" />
                )}
                Ajouter un utilisateur
              </Button>
            }
          />
        )}
      </div>

      {/* Modal */}
      <UserModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleSubmit}
        user={editingUser}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Supprimer l'utilisateur"
        description={`Êtes-vous sûr de vouloir supprimer l'utilisateur "${userToDelete?.first_name} ${userToDelete?.last_name}" ? Cette action est irréversible.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

