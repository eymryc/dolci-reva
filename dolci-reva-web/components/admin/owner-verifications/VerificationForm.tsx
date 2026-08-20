"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ReviewDocumentData } from "@/hooks/use-owner-verifications";
import { ServerErrorPanel } from "@/components/ui/ServerErrorPanel";
import { useServerErrors } from "@/hooks/use-server-errors";
import { createFieldLabels } from "@/lib/server-error-utils";

// Schema de validation
const reviewDocumentSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"], {
    required_error: "Le statut est requis",
  }),
  reason: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  // Si le statut est REJECTED, la raison est obligatoire
  if (data.status === "REJECTED" && (!data.reason || data.reason.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "La raison du rejet est obligatoire",
  path: ["reason"],
});

interface VerificationFormProps {
  onSubmit: (data: ReviewDocumentData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  defaultStatus?: "APPROVED" | "REJECTED";
}

export function VerificationForm({
  onSubmit,
  onCancel,
  isLoading = false,
  defaultStatus,
}: VerificationFormProps) {
  type FormValues = z.infer<typeof reviewDocumentSchema>;
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<FormValues>({
    resolver: zodResolver(reviewDocumentSchema),
    defaultValues: {
      status: defaultStatus || "APPROVED",
      reason: "",
      notes: "",
    },
  });

  const status = watch("status");

  // Mapping des champs
  const fieldMapping: Record<string, keyof FormValues> = {
    status: "status",
    reason: "reason",
    notes: "notes",
  };

  // Labels personnalisés
  const fieldLabels = createFieldLabels({
    status: "Statut",
    reason: "Raison du rejet",
    notes: "Notes",
  });

  // Hook pour gérer les erreurs du serveur
  const { serverErrors, showErrorPanel, clearErrors: clearServerErrors, setShowErrorPanel } = useServerErrors<FormValues>({
    setError,
    fieldMapping,
  });

  const handleFormSubmit = (data: FormValues) => {
    const formData: ReviewDocumentData = {
      status: data.status,
      reason: data.reason || undefined,
      notes: data.notes || undefined,
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
        <Label htmlFor="status">
          Statut <span className="text-red-500">*</span>
        </Label>
        <select
          id="status"
          {...register("status")}
          className={`flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            errors.status ? "border-red-500" : ""
          }`}
        >
          <option value="APPROVED">Approuver</option>
          <option value="REJECTED">Rejeter</option>
        </select>
        {errors.status && (
          <p className="text-sm text-red-500">{errors.status.message}</p>
        )}
      </div>

      {status === "REJECTED" && (
        <div className="space-y-2">
          <Label htmlFor="reason">
            Raison du rejet <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="reason"
            placeholder="Expliquez pourquoi ce document est rejeté..."
            {...register("reason")}
            className={errors.reason ? "border-red-500 min-h-[100px]" : "min-h-[100px]"}
          />
          {errors.reason && (
            <p className="text-sm text-red-500">{errors.reason.message}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optionnel)</Label>
        <Textarea
          id="notes"
          placeholder="Ajoutez des notes supplémentaires..."
          {...register("notes")}
          className="min-h-[100px]"
        />
        {errors.notes && (
          <p className="text-sm text-red-500">{errors.notes.message}</p>
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
          className={`h-12 ${
            status === "APPROVED"
              ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
              : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
          }`}
        >
          {isLoading ? "Enregistrement..." : status === "APPROVED" ? "Approuver" : "Rejeter"}
        </Button>
      </div>
    </form>
  );
}

