"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BusinessTypeFormData } from "@/hooks/use-business-types";

// Schema de validation
const businessTypeSchema = z.object({
  name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
});

type BusinessTypeFormValues = z.infer<typeof businessTypeSchema>;

interface BusinessTypeFormProps {
  onSubmit: (data: BusinessTypeFormData) => void;
  onCancel: () => void;
  defaultValues?: BusinessTypeFormData;
  isLoading?: boolean;
}

export function BusinessTypeForm({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading = false,
}: BusinessTypeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessTypeFormValues>({
    resolver: zodResolver(businessTypeSchema),
    defaultValues: defaultValues || { name: "", description: "" },
  });

  const handleFormSubmit = (data: BusinessTypeFormValues) => {
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
          placeholder="Exemple : Hôtel, Restaurant"
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
          className={errors.description ? "border-red-500 min-h-[100px]" : "min-h-[100px]"}
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

