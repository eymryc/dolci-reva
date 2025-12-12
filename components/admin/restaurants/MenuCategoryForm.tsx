"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MenuCategoryFormData } from "@/types/entities/restaurant.types";
import { ServerErrorPanel } from "@/components/ui/ServerErrorPanel";
import { useServerErrors } from "@/hooks/use-server-errors";
import { createFieldLabels } from "@/lib/server-error-utils";
import type { Restaurant } from "@/hooks/use-restaurants";

// Schema de validation
const menuCategorySchema = z.object({
  restaurant_id: z.number().min(1, "Le restaurant est requis"),
  name: z.string().min(1, "Le nom est requis").min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z.string().optional(),
});

type MenuCategoryFormValues = z.infer<typeof menuCategorySchema>;

interface MenuCategoryFormProps {
  onSubmit: (data: MenuCategoryFormData) => void;
  onCancel: () => void;
  defaultValues?: MenuCategoryFormData;
  isLoading?: boolean;
  restaurants: Restaurant[];
}

export function MenuCategoryForm({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading = false,
  restaurants,
}: MenuCategoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    setValue,
    watch,
  } = useForm<MenuCategoryFormValues>({
    resolver: zodResolver(menuCategorySchema),
    defaultValues: defaultValues || { restaurant_id: undefined as unknown as number, name: "", description: "" },
  });

  const restaurantId = watch("restaurant_id");

  // Mapping des champs
  const fieldMapping: Record<string, keyof MenuCategoryFormValues> = {
    restaurant_id: "restaurant_id",
    name: "name",
    description: "description",
  };

  // Labels personnalisés
  const fieldLabels = createFieldLabels({
    restaurant_id: "Restaurant",
    name: "Nom",
    description: "Description",
  });

  // Hook pour gérer les erreurs du serveur
  const { serverErrors, showErrorPanel, clearErrors: clearServerErrors, setShowErrorPanel } = useServerErrors<MenuCategoryFormValues>({
    setError,
    fieldMapping,
  });

  const handleFormSubmit = (data: MenuCategoryFormValues) => {
    clearServerErrors();
    clearErrors();
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Panneau d'erreurs du serveur */}
      <ServerErrorPanel
        errors={serverErrors}
        fieldLabels={fieldLabels}
        show={showErrorPanel}
        onClose={() => {
          setShowErrorPanel(false);
          clearServerErrors();
          clearErrors();
        }}
      />
      
      <div className="space-y-2">
        <Label htmlFor="restaurant_id">
          Restaurant <span className="text-red-500">*</span>
        </Label>
        <Select
          value={restaurantId?.toString() || ""}
          onValueChange={(value) => setValue("restaurant_id", parseInt(value, 10), { shouldValidate: true })}
          disabled={!!defaultValues?.restaurant_id || isLoading}
        >
          <SelectTrigger
            id="restaurant_id"
            className={errors.restaurant_id ? "border-red-500 !h-10 sm:!h-12 w-full" : "!h-10 sm:!h-12 w-full"}
          >
            <SelectValue placeholder="Sélectionner un restaurant" />
          </SelectTrigger>
          <SelectContent>
            {restaurants.map((restaurant) => (
              <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                {restaurant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.restaurant_id && (
          <p className="text-sm text-red-500">{errors.restaurant_id.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">
          Nom <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Exemple : Entrées, Plats principaux, Desserts"
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
          className="bg-[#f08400] hover:bg-[#d87200] text-white h-10 sm:h-12 text-xs sm:text-sm w-full sm:w-auto"
        >
          {isLoading ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}

