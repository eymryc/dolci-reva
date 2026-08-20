"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ResidenceForm } from "./ResidenceForm";
import { Residence, ResidenceFormData } from "@/hooks/use-residences";

interface ResidenceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ResidenceFormData) => void;
  residence?: Residence | null;
  isLoading?: boolean;
}

export function ResidenceModal({
  open,
  onOpenChange,
  onSubmit,
  residence,
  isLoading = false,
}: ResidenceModalProps) {
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-gray-200">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {residence ? "Modifier la résidence" : "Créer une résidence"}
          </DialogTitle>
          <DialogDescription>
            {residence
              ? "Mettez à jour les informations de la résidence ci-dessous."
              : "Remplissez les informations ci-dessous pour créer une nouvelle résidence."}
          </DialogDescription>
        </DialogHeader>
        <ResidenceForm
          onSubmit={onSubmit}
          onCancel={handleCancel}
          defaultValues={
            residence
              ? {
                  name: residence.name,
                  description: residence.description || "",
                  address: residence.address,
                  city: residence.city,
                  country: residence.country,
                  latitude: residence.latitude || "",
                  longitude: residence.longitude || "",
                  type: residence.type,
                  max_guests: residence.max_guests,
                  bedrooms: residence.bedrooms,
                  bathrooms: residence.bathrooms,
                  piece_number: residence.piece_number,
                  price: residence.price,
                  standing: residence.standing,
                  owner_id: residence.owner_id,
                }
              : undefined
          }
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}

