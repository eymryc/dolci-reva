"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AmenityFormData } from "@/hooks/use-amenities";

// Schema de validation
const amenitySchema = z.object({
  name: z.string().min(1, "Le nom est requis").min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z.string().optional(),
});

type AmenityFormValues = z.infer<typeof amenitySchema>;

interface AmenityFormProps {
  onSubmit: (data: AmenityFormData) => void;
  onCancel: () => void;
  defaultValues?: AmenityFormData;
  isLoading?: boolean;
}

export function AmenityForm({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading = false,
}: AmenityFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AmenityFormValues>({
    resolver: zodResolver(amenitySchema),
    defaultValues: defaultValues || { name: "", description: "" },
  });

  const handleFormSubmit = (data: AmenityFormValues) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          Nom <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Exemple : Wi-Fi, Parking, Piscine"
          {...register("name")}
          className={errors.name ? "border-red-500 h-12" : "h-12"}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Description optionnelle"
          {...register("description")}
          className="min-h-[100px]"
          rows={4}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="flex gap-2 justify-center pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="h-12"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12"
        >
          {isLoading ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}

