"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { UserForm } from "./UserForm";
import { User, UserFormData } from "@/hooks/use-users";

interface UserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormData) => void;
  user?: User | null;
  isLoading?: boolean;
}

export function UserModal({
  open,
  onOpenChange,
  onSubmit,
  user,
  isLoading = false,
}: UserModalProps) {
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-gray-200">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {user ? "Modifier l'utilisateur" : "Créer un utilisateur"}
          </DialogTitle>
          <DialogDescription>
            {user
              ? "Modifiez les informations de l'utilisateur ci-dessous."
              : "Remplissez les informations ci-dessous pour créer un nouvel utilisateur."}
          </DialogDescription>
        </DialogHeader>
        <UserForm
          onSubmit={onSubmit}
          onCancel={handleCancel}
          defaultValues={
            user
              ? {
                  first_name: user.first_name,
                  last_name: user.last_name,
                  phone: user.phone,
                  email: user.email,
                  type: user.type,
                }
              : undefined
          }
          isLoading={isLoading}
          isEdit={!!user}
        />
      </DialogContent>
    </Dialog>
  );
}

