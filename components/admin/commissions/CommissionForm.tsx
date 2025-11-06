"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CommissionFormData } from "@/hooks/use-commissions";
import { ServerErrorPanel } from "@/components/ui/ServerErrorPanel";
import { useServerErrors } from "@/hooks/use-server-errors";
import { createFieldLabels } from "@/lib/server-error-utils";

// Schema de validation
const commissionSchema = z.object({
  commission: z.number()
    .min(0, "La commission doit être positive")
    .max(100, "La commission ne peut pas dépasser 100%"),
  is_active: z.boolean(),
});

type CommissionFormValues = z.infer<typeof commissionSchema>;

interface CommissionFormProps {
  onSubmit: (data: CommissionFormData) => void;
  onCancel: () => void;
  defaultValues?: CommissionFormData;
  isLoading?: boolean;
}

export function CommissionForm({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading = false,
}: CommissionFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<CommissionFormValues>({
    resolver: zodResolver(commissionSchema),
    defaultValues: defaultValues 
      ? { 
          commission: defaultValues.commission, 
          is_active: Boolean(defaultValues.is_active) 
        }
      : { commission: 0, is_active: true },
  });

  const isActive = watch("is_active");

  // Mapping des champs
  const fieldMapping: Record<string, keyof CommissionFormValues> = {
    commission: "commission",
    is_active: "is_active",
  };

  // Labels personnalisés
  const fieldLabels = createFieldLabels({
    commission: "Commission (%)",
    is_active: "Statut",
  });

  // Hook pour gérer les erreurs du serveur
  const { serverErrors, showErrorPanel, handleServerError, clearErrors: clearServerErrors, setShowErrorPanel } = useServerErrors<CommissionFormValues>({
    setError,
    fieldMapping,
  });

  const handleFormSubmit = (data: CommissionFormValues) => {
    clearServerErrors();
    clearErrors();
    // Ensure is_active is always a boolean
    const formData = {
      ...data,
      is_active: Boolean(data.is_active),
    };
    onSubmit(formData);
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
        <Label htmlFor="commission">
          Commission (%) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="commission"
          type="number"
          step="0.01"
          min="0"
          max="100"
          placeholder="Exemple : 10.5"
          {...register("commission", { valueAsNumber: true })}
          className={errors.commission ? "border-red-500 h-12" : "h-12"}
        />
        {errors.commission && (
          <p className="text-sm text-red-500">{errors.commission.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-colors">
          <Checkbox
            id="is_active"
            checked={isActive}
            onCheckedChange={(checked) => setValue("is_active", checked as boolean)}
            className="size-5 border-2 border-gray-400 rounded-md data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-purple-600 data-[state=checked]:border-transparent data-[state=checked]:shadow-lg data-[state=checked]:shadow-blue-500/50 transition-all duration-200 hover:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:ring-offset-2"
          />
          <Label
            htmlFor="is_active"
            className="text-sm font-medium text-gray-700 cursor-pointer select-none flex items-center gap-2"
          >
            <span>Actif</span>
            {isActive && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                Activé
              </span>
            )}
          </Label>
        </div>
        {errors.is_active && (
          <p className="text-sm text-red-500">{errors.is_active.message}</p>
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

