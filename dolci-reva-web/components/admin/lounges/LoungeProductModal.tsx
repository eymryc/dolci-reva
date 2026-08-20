"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { LoungeProductForm } from "./LoungeProductForm";
import { NightlifeVenueProduct, NightlifeVenueProductFormData } from "@/types/entities/nightlife-venue.types";
import type { NightlifeVenueProductCategory } from "@/types/entities/nightlife-venue.types";

interface LoungeProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: NightlifeVenueProductFormData, images?: { mainImage?: File | null; galleryImages?: File[] }) => void;
  item?: NightlifeVenueProduct | null;
  isLoading?: boolean;
  loungeProductCategories: NightlifeVenueProductCategory[];
}

export function LoungeProductModal({
  open,
  onOpenChange,
  onSubmit,
  item,
  isLoading = false,
  loungeProductCategories,
}: LoungeProductModalProps) {
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
        <LoungeProductForm
          onSubmit={onSubmit}
          onCancel={handleCancel}
          defaultValues={
            item
              ? { 
                  lounge_id: item.lounge_id,
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
          loungeProductCategories={loungeProductCategories}
        />
      </DialogContent>
    </Dialog>
  );
}

