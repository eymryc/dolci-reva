/**
 * Section des détails de la propriété du formulaire d'hébergement
 */

import React from "react";
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DwellingFormValues } from "../DwellingForm";

interface PropertyDetailsSectionProps {
  register: UseFormRegister<DwellingFormValues>;
  setValue: UseFormSetValue<DwellingFormValues>;
  watch: UseFormWatch<DwellingFormValues>;
  errors: FieldErrors<DwellingFormValues>;
}

export function PropertyDetailsSection({
  register,
  setValue,
  watch,
  errors,
}: PropertyDetailsSectionProps) {
  const type = watch("type");
  const structureType = watch("structure_type");
  const constructionType = watch("construction_type");

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
        Détails de la propriété
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="type">Type *</Label>
          <Select
            value={type || ""}
            onValueChange={(value) =>
              setValue("type", value as "STUDIO" | "APPARTEMENT" | "VILLA" | "PENTHOUSE" | "DUPLEX" | "TRIPLEX")
            }
          >
            <SelectTrigger className={errors.type ? "border-red-500" : ""}>
              <SelectValue placeholder="Sélectionner un type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="STUDIO">Studio</SelectItem>
              <SelectItem value="APPARTEMENT">Appartement</SelectItem>
              <SelectItem value="VILLA">Villa</SelectItem>
              <SelectItem value="PENTHOUSE">Penthouse</SelectItem>
              <SelectItem value="DUPLEX">Duplex</SelectItem>
              <SelectItem value="TRIPLEX">Triplex</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="structure_type">Type de structure *</Label>
          <Select
            value={structureType || ""}
            onValueChange={(value) =>
              setValue("structure_type", value as "MAISON_BASSE" | "IMMEUBLE")
            }
          >
            <SelectTrigger className={errors.structure_type ? "border-red-500" : ""}>
              <SelectValue placeholder="Sélectionner un type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MAISON_BASSE">Maison basse</SelectItem>
              <SelectItem value="IMMEUBLE">Immeuble</SelectItem>
            </SelectContent>
          </Select>
          {errors.structure_type && (
            <p className="text-red-500 text-sm mt-1">{errors.structure_type.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="construction_type">Type de construction *</Label>
          <Select
            value={constructionType || ""}
            onValueChange={(value) =>
              setValue("construction_type", value as "NOUVELLE_CONSTRUCTION" | "ANCIENNE")
            }
          >
            <SelectTrigger className={errors.construction_type ? "border-red-500" : ""}>
              <SelectValue placeholder="Sélectionner un type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NOUVELLE_CONSTRUCTION">Nouvelle construction</SelectItem>
              <SelectItem value="ANCIENNE">Ancienne</SelectItem>
            </SelectContent>
          </Select>
          {errors.construction_type && (
            <p className="text-red-500 text-sm mt-1">{errors.construction_type.message}</p>
          )}
        </div>
      </div>

      {type !== "STUDIO" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <Label htmlFor="rooms">Chambres</Label>
            <Input
              id="rooms"
              type="number"
              placeholder="Exemple : 2"
              {...register("rooms", { valueAsNumber: true })}
              className={errors.rooms ? "border-red-500" : ""}
            />
            {errors.rooms && (
              <p className="text-red-500 text-sm mt-1">{errors.rooms.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="bathrooms">Salles de bain</Label>
            <Input
              id="bathrooms"
              type="number"
              placeholder="Exemple : 1"
              {...register("bathrooms", { valueAsNumber: true })}
              className={errors.bathrooms ? "border-red-500" : ""}
            />
            {errors.bathrooms && (
              <p className="text-red-500 text-sm mt-1">{errors.bathrooms.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="living_room">Salons</Label>
            <Input
              id="living_room"
              type="number"
              placeholder="Exemple : 1"
              {...register("living_room", { valueAsNumber: true })}
              className={errors.living_room ? "border-red-500" : ""}
            />
            {errors.living_room && (
              <p className="text-red-500 text-sm mt-1">{errors.living_room.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="piece_number">Nombre de pièces</Label>
            <Input
              id="piece_number"
              type="number"
              placeholder="Exemple : 3"
              {...register("piece_number", { valueAsNumber: true })}
              className={errors.piece_number ? "border-red-500" : ""}
            />
            {errors.piece_number && (
              <p className="text-red-500 text-sm mt-1">{errors.piece_number.message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

