"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FeatureCategoryForm } from "./FeatureCategoryForm";
import type { FeatureCategoryFormData } from "@/hooks/use-feature-categories";
import type { FeatureCategory } from "@/types/common";

interface FeatureCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FeatureCategoryFormData) => void;
  category?: FeatureCategory | null;
  isLoading?: boolean;
}

export function FeatureCategoryModal({ open, onOpenChange, onSubmit, category, isLoading = false }: FeatureCategoryModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="border-b border-gray-200">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {category ? "Modifier la catégorie" : "Créer une catégorie"}
          </DialogTitle>
          <DialogDescription>
            {category
              ? "Mettez à jour les informations de la catégorie ci-dessous."
              : "Une catégorie regroupe des équipements (ex : \"Vues\" contient \"Vue sur mer\", \"Vue sur jardin\"...)."}
          </DialogDescription>
        </DialogHeader>
        <FeatureCategoryForm
          category={category}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
