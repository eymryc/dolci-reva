"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BusinessTypeForm } from "./BusinessTypeForm";
import { BusinessType, BusinessTypeFormData } from "@/hooks/use-business-types";

interface BusinessTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BusinessTypeFormData) => void;
  businessType?: BusinessType | null;
  isLoading?: boolean;
}

export function BusinessTypeModal({
  open,
  onOpenChange,
  onSubmit,
  businessType,
  isLoading = false,
}: BusinessTypeModalProps) {
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="border-b border-gray-200">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {businessType ? "Modifier le type de business" : "Créer un type de business"}
          </DialogTitle>
          <DialogDescription>
            {businessType
              ? "Mettez à jour les informations du type de business ci-dessous."
              : "Remplissez les informations ci-dessous pour créer un nouveau type de business."}
          </DialogDescription>
        </DialogHeader>
        <BusinessTypeForm
          onSubmit={onSubmit}
          onCancel={handleCancel}
          defaultValues={
            businessType
              ? { name: businessType.name, description: businessType.description }
              : undefined
          }
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}

