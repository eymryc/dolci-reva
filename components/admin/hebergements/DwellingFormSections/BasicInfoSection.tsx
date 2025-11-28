/**
 * Section d'informations de base du formulaire d'hébergement
 */

import React from "react";
import { UseFormRegister, UseFormSetValue, FieldErrors } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import PhoneInput from "@/components/ui/PhoneInput";
import type { DwellingFormValues } from "../DwellingForm";

interface BasicInfoSectionProps {
  register: UseFormRegister<DwellingFormValues>;
  setValue: UseFormSetValue<DwellingFormValues>;
  errors: FieldErrors<DwellingFormValues>;
}

export function BasicInfoSection({ register, setValue, errors }: BasicInfoSectionProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
        Informations de base
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="phone">Téléphone *</Label>
          <PhoneInput
            onChange={(value) => {
              if (value) {
                setValue("phone", value, { shouldValidate: false });
                setTimeout(() => {
                  setValue("phone", value, { shouldValidate: true });
                }, 500);
              }
            }}
            register={register("phone")}
            placeholder="Entrez votre numéro"
            defaultCountry="ci"
            error={!!errors.phone}
            className={`h-10 sm:h-12 border-2 text-xs sm:text-sm ${
              errors.phone
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200"
            }`}
          />
          {errors.phone && (
            <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="whatsapp">WhatsApp *</Label>
          <PhoneInput
            onChange={(value) => {
              if (value) {
                setValue("whatsapp", value, { shouldValidate: false });
                setTimeout(() => {
                  setValue("whatsapp", value, { shouldValidate: true });
                }, 500);
              }
            }}
            register={register("whatsapp")}
            placeholder="Entrez votre numéro WhatsApp"
            defaultCountry="ci"
            error={!!errors.whatsapp}
            className={`h-10 sm:h-12 border-2 text-xs sm:text-sm ${
              errors.whatsapp
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200"
            }`}
          />
          {errors.whatsapp && (
            <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.whatsapp.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          {...register("description")}
          rows={4}
          className={errors.description ? "border-red-500" : ""}
          placeholder="Décrivez l'hébergement..."
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>
    </div>
  );
}

