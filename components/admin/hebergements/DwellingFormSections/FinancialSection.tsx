/**
 * Section des informations financières du formulaire d'hébergement
 */

import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DwellingFormValues } from "../DwellingForm";

interface FinancialSectionProps {
  register: UseFormRegister<DwellingFormValues>;
  errors: FieldErrors<DwellingFormValues>;
}

export function FinancialSection({ register, errors }: FinancialSectionProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
        Informations financières
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="visite_price">
            Prix de visite (FCFA) *
          </Label>
          <Input
            id="visite_price"
            type="number"
            step="0.01"
            placeholder="Exemple : 5000"
            {...register("visite_price")}
            className={errors.visite_price ? "border-red-500" : ""}
          />
          {errors.visite_price && (
            <p className="text-red-500 text-sm mt-1">{errors.visite_price.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="rent">
            Loyer (FCFA) *
          </Label>
          <Input
            id="rent"
            type="number"
            step="0.01"
            placeholder="Exemple : 150000"
            {...register("rent")}
            className={errors.rent ? "border-red-500" : ""}
          />
          {errors.rent && (
            <p className="text-red-500 text-sm mt-1">{errors.rent.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="security_deposit_month_number">
            Nombre de mois de caution *
          </Label>
          <Input
            id="security_deposit_month_number"
            type="number"
            min="0"
            max="12"
            placeholder="Exemple : 2 mois"
            {...register("security_deposit_month_number", { valueAsNumber: true })}
            className={errors.security_deposit_month_number ? "border-red-500" : ""}
          />
          {errors.security_deposit_month_number && (
            <p className="text-red-500 text-sm mt-1">{errors.security_deposit_month_number.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="rent_advance_amount_number">
            Nombre de mois d&apos;avance *
          </Label>
          <Input
            id="rent_advance_amount_number"
            type="number"
            min="0"
            max="12"
            placeholder="Exemple : 1 mois"
            {...register("rent_advance_amount_number", { valueAsNumber: true })}
            className={errors.rent_advance_amount_number ? "border-red-500" : ""}
          />
          {errors.rent_advance_amount_number && (
            <p className="text-red-500 text-sm mt-1">{errors.rent_advance_amount_number.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="agency_fees_month_number">
            Mois de frais d&apos;agence
          </Label>
          <Input
            id="agency_fees_month_number"
            type="number"
            min="0"
            max="12"
            placeholder="Exemple : 1"
            {...register("agency_fees_month_number", { valueAsNumber: true })}
            className={errors.agency_fees_month_number ? "border-red-500" : ""}
          />
          {errors.agency_fees_month_number && (
            <p className="text-red-500 text-sm mt-1">{errors.agency_fees_month_number.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}

