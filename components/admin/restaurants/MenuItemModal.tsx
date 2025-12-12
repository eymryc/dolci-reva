"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MenuItemForm } from "./MenuItemForm";
import { MenuItem, MenuItemFormData } from "@/types/entities/restaurant.types";
import type { MenuCategory } from "@/types/entities/restaurant.types";

interface MenuItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MenuItemFormData, images?: { mainImage?: File | null; galleryImages?: File[] }) => void;
  item?: MenuItem | null;
  isLoading?: boolean;
  menuCategories: MenuCategory[];
}

export function MenuItemModal({
  open,
  onOpenChange,
  onSubmit,
  item,
  isLoading = false,
  menuCategories,
}: MenuItemModalProps) {
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-gray-200">
          <DialogTitle className="text-2xl font-bold text-[#f08400]">
            {item ? "Modifier l&apos;item" : "Créer un item"}
          </DialogTitle>
          <DialogDescription>
            {item
              ? "Mettez à jour les informations de l&apos;item ci-dessous."
              : "Remplissez les informations ci-dessous pour créer un nouvel item de menu."}
          </DialogDescription>
        </DialogHeader>
        <MenuItemForm
          onSubmit={onSubmit}
          onCancel={handleCancel}
          defaultValues={
            item
              ? { 
                  restaurant_id: item.restaurant_id,
                  category_id: item.category_id,
                  name: item.name, 
                  description: item.description || undefined,
                  price: typeof item.price === 'string' ? parseFloat(item.price) || 0 : item.price || 0,
                  main_image_url: item.main_image_url || null,
                  gallery_images: item.gallery_images || [],
                }
              : undefined
          }
          isLoading={isLoading}
          menuCategories={menuCategories}
        />
      </DialogContent>
    </Dialog>
  );
}

