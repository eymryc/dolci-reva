"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { LoungeProductCategoryForm } from "./LoungeProductCategoryForm";
import { NightlifeVenueProductCategory, NightlifeVenueProductCategoryFormData } from "@/types/entities/nightlife-venue.types";

interface LoungeProductCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: NightlifeVenueProductCategoryFormData) => void;
  category?: NightlifeVenueProductCategory | null;
  isLoading?: boolean;
}

export function LoungeProductCategoryModal({
  open,
  onOpenChange,
  onSubmit,
  category,
  isLoading = false,
}: LoungeProductCategoryModalProps) {
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="border-b border-gray-200">
          <DialogTitle className="text-2xl font-bold text-[#f08400]">
            {category ? "Modifier la catégorie" : "Créer une catégorie"}
          </DialogTitle>
          <DialogDescription>
            {category
              ? "Mettez à jour les informations de la catégorie ci-dessous."
              : "Remplissez les informations ci-dessous pour créer une nouvelle catégorie de menu."}
          </DialogDescription>
        </DialogHeader>
        <LoungeProductCategoryForm
          onSubmit={onSubmit}
          onCancel={handleCancel}
          defaultValues={
            category
              ? { 
                  name: category.name, 
                  description: category.description || undefined
                }
              : undefined
          }
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}

