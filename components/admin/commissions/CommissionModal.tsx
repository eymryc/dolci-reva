"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CommissionForm } from "./CommissionForm";
import { Commission, CommissionFormData } from "@/hooks/use-commissions";

interface CommissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CommissionFormData) => void;
  commission?: Commission | null;
  isLoading?: boolean;
}

export function CommissionModal({
  open,
  onOpenChange,
  onSubmit,
  commission,
  isLoading = false,
}: CommissionModalProps) {
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="border-b border-gray-200">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {commission ? "Modifier la commission" : "Créer une commission"}
          </DialogTitle>
          <DialogDescription>
            {commission
              ? "Mettez à jour les informations de la commission ci-dessous."
              : "Remplissez les informations ci-dessous pour créer une nouvelle commission."}
          </DialogDescription>
        </DialogHeader>
        <CommissionForm
          onSubmit={onSubmit}
          onCancel={handleCancel}
          defaultValues={
            commission
              ? { 
                  commission: commission.commission, 
                  is_active: Boolean(commission.is_active)
                }
              : undefined
          }
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}

