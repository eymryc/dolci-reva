"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MenuCategoryForm } from "./MenuCategoryForm";
import { MenuCategory, MenuCategoryFormData } from "@/types/entities/restaurant.types";
import type { Restaurant } from "@/hooks/use-restaurants";

interface MenuCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MenuCategoryFormData) => void;
  category?: MenuCategory | null;
  isLoading?: boolean;
  restaurants: Restaurant[];
}

export function MenuCategoryModal({
  open,
  onOpenChange,
  onSubmit,
  category,
  isLoading = false,
  restaurants,
}: MenuCategoryModalProps) {
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
        <MenuCategoryForm
          onSubmit={onSubmit}
          onCancel={handleCancel}
          defaultValues={
            category
              ? { 
                  restaurant_id: category.restaurant_id,
                  name: category.name, 
                  description: category.description || undefined
                }
              : undefined
          }
          isLoading={isLoading}
          restaurants={restaurants}
        />
      </DialogContent>
    </Dialog>
  );
}

