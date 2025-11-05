"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AmenityForm } from "./AmenityForm";
import { Amenity, AmenityFormData } from "@/hooks/use-amenities";

interface AmenityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AmenityFormData) => void;
  amenity?: Amenity | null;
  isLoading?: boolean;
}

export function AmenityModal({
  open,
  onOpenChange,
  onSubmit,
  amenity,
  isLoading = false,
}: AmenityModalProps) {
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="border-b border-gray-200">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {amenity ? "Modifier la commodité" : "Créer une commodité"}
          </DialogTitle>
          <DialogDescription>
            {amenity
              ? "Mettez à jour les informations de la commodité ci-dessous."
              : "Remplissez les informations ci-dessous pour créer une nouvelle commodité."}
          </DialogDescription>
        </DialogHeader>
        <AmenityForm
          onSubmit={onSubmit}
          onCancel={handleCancel}
          defaultValues={
            amenity
              ? { 
                  name: amenity.name, 
                  description: amenity.description
                }
              : undefined
          }
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}

