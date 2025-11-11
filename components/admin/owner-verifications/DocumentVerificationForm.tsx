"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DocumentType } from "@/hooks/use-owner-verifications";
import { ServerErrorPanel } from "@/components/ui/ServerErrorPanel";
import { createFieldLabels } from "@/lib/server-error-utils";
import { useServerErrors } from "@/hooks/use-server-errors";

export interface DocumentVerificationFormData {
  document_type: DocumentType;
  document_number?: string;
  document_issue_date?: string;
  document_expiry_date?: string;
  identity_document_type?: string;
  document_file: File | null;
}

// Schéma de validation Zod
const documentVerificationSchema = z.object({
  document_type: z.enum(["IDENTITY", "ADDRESS_PROOF", "PROPERTY_TITLE", "BANK_STATEMENT", "INSURANCE"], {
    required_error: "Le type de document est requis",
  }),
  document_number: z.string().optional(),
  document_issue_date: z.string().optional(),
  document_expiry_date: z.string().optional(),
  identity_document_type: z.string().optional(),
  document_file: z.instanceof(File, {
    message: "Le fichier du document est requis",
  }).refine((file) => file.size > 0, {
    message: "Le fichier ne peut pas être vide",
  }),
}).refine((data) => {
  if (data.document_type === "IDENTITY") {
    return data.identity_document_type !== undefined && data.identity_document_type !== "";
  }
  return true;
}, {
  message: "Le type de pièce d'identité est requis",
  path: ["identity_document_type"],
}).refine((data) => {
  if (data.document_type === "IDENTITY" && data.identity_document_type) {
    return ["CNI", "PASSEPORT", "AUTRE"].includes(data.identity_document_type);
  }
  return true;
}, {
  message: "Le type de document d'identité doit être : CNI, PASSEPORT ou AUTRE",
  path: ["identity_document_type"],
});

type DocumentVerificationFormValues = z.infer<typeof documentVerificationSchema>;

interface DocumentVerificationFormProps {
  onSubmit: (data: DocumentVerificationFormData) => Promise<void>;
  onCancel: () => void;
  defaultDocumentType?: DocumentType;
  isLoading?: boolean;
}

export function DocumentVerificationForm({
  onSubmit,
  onCancel,
  defaultDocumentType,
  isLoading = false,
}: DocumentVerificationFormProps) {
  const fieldLabels = createFieldLabels({
    document_type: "Type de document",
    document_file: "Fichier du document",
    document_number: "Numéro de document",
    document_issue_date: "Date d'émission",
    document_expiry_date: "Date d'expiration",
    identity_document_type: "Type de pièce d'identité",
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
    clearErrors,
    setError,
  } = useForm<DocumentVerificationFormValues>({
    resolver: zodResolver(documentVerificationSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      document_type: defaultDocumentType || "IDENTITY",
      document_number: "",
      document_issue_date: "",
      document_expiry_date: "",
      identity_document_type: "",
      document_file: undefined as File | undefined,
    },
  });

  const documentType = watch("document_type");
  const documentFile = watch("document_file");

  // Mapping des noms de champs du serveur (snake_case) vers le formulaire (camelCase)
  const fieldMapping: Record<string, keyof DocumentVerificationFormValues> = {
    document_type: "document_type",
    document_file: "document_file",
    document_number: "document_number",
    document_issue_date: "document_issue_date",
    document_expiry_date: "document_expiry_date",
    identity_document_type: "identity_document_type",
  };

  const { serverErrors, showErrorPanel, handleServerError, clearErrors: clearServerErrors, setShowErrorPanel } = useServerErrors<DocumentVerificationFormValues>({
    setError,
    fieldMapping,
  });

  useEffect(() => {
    if (defaultDocumentType) {
      setValue("document_type", defaultDocumentType);
    }
  }, [defaultDocumentType, setValue]);

  const onFormSubmit = async (data: DocumentVerificationFormValues) => {
    clearServerErrors();
    clearErrors();

    const formData: DocumentVerificationFormData = {
      document_type: data.document_type,
      document_file: data.document_file,
      document_number: data.document_number,
      document_issue_date: data.document_issue_date,
      document_expiry_date: data.document_expiry_date,
      identity_document_type: data.identity_document_type,
    };

    try {
      await onSubmit(formData);
    } catch (error) {
      const { hasDetailedErrors } = handleServerError(error);
      if (!hasDetailedErrors) {
        // Si pas d'erreurs détaillées, le toast sera affiché par le hook
      }
    }
  };

  const handleCancel = () => {
    clearServerErrors();
    clearErrors();
    setValue("document_type", defaultDocumentType || "IDENTITY");
    setValue("document_number", "");
    setValue("document_issue_date", "");
    setValue("document_expiry_date", "");
    setValue("identity_document_type", "");
    setValue("document_file", undefined as File | undefined);
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="container mx-auto">
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
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="document_type" className="text-sm">
              Type de document <span className="text-red-500">*</span>
            </Label>
            <Select
              value={documentType}
              onValueChange={(value) => setValue("document_type", value as DocumentType)}
            >
              <SelectTrigger className={`h-12 w-full ${errors.document_type ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Sélectionner un type de document" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IDENTITY">Pièce d&apos;identité</SelectItem>
                <SelectItem value="ADDRESS_PROOF">Justificatif de domicile</SelectItem>
                <SelectItem value="PROPERTY_TITLE">Titre de propriété</SelectItem>
                <SelectItem value="BANK_STATEMENT">Relevé bancaire</SelectItem>
                <SelectItem value="INSURANCE">Assurance</SelectItem>
              </SelectContent>
            </Select>
            {errors.document_type && (
              <span className="text-xs text-red-500 font-medium">{errors.document_type.message}</span>
            )}
          </div>

          {documentType === "IDENTITY" ? (
            <div className="space-y-1.5">
              <Label htmlFor="identity_document_type" className="text-sm">
                Type de pièce d&apos;identité <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watch("identity_document_type") || ""}
                onValueChange={(value) => setValue("identity_document_type", value)}
              >
                <SelectTrigger className={`h-12 w-full ${errors.identity_document_type ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CNI">CNI</SelectItem>
                  <SelectItem value="PASSEPORT">Passeport</SelectItem>
                  <SelectItem value="AUTRE">Autre</SelectItem>
                </SelectContent>
              </Select>
              {errors.identity_document_type && (
                <span className="text-xs text-red-500 font-medium">{errors.identity_document_type.message}</span>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="identity_document_type" className="text-sm">
                &nbsp;
              </Label>
              <div className="h-12"></div>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="document_number" className="text-sm">
            Numéro de document
          </Label>
          <Input
            id="document_number"
            {...register("document_number")}
            placeholder="Exemple : CI123456789"
            className={`h-12 ${errors.document_number ? "border-red-500" : ""}`}
            aria-invalid={!!errors.document_number}
          />
          {errors.document_number && (
            <span className="text-xs text-red-500 font-medium">{errors.document_number.message}</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="document_issue_date" className="text-sm">
              Date d&apos;émission
            </Label>
            <Input
              id="document_issue_date"
              type="date"
              {...register("document_issue_date")}
              className={`h-12 ${errors.document_issue_date ? "border-red-500" : ""}`}
              aria-invalid={!!errors.document_issue_date}
            />
            {errors.document_issue_date && (
              <span className="text-xs text-red-500 font-medium">{errors.document_issue_date.message}</span>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="document_expiry_date" className="text-sm">
              Date d&apos;expiration
            </Label>
            <Input
              id="document_expiry_date"
              type="date"
              {...register("document_expiry_date")}
              className={`h-12 ${errors.document_expiry_date ? "border-red-500" : ""}`}
              aria-invalid={!!errors.document_expiry_date}
            />
            {errors.document_expiry_date && (
              <span className="text-xs text-red-500 font-medium">{errors.document_expiry_date.message}</span>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="document_file" className="text-sm">
            Fichier du document <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="document_file"
            control={control}
            render={({ field: { onChange, ...field } }) => (
              <>
                <Input
                  id="document_file"
                  type="file"
                  accept="image/*,.pdf"
                  {...field}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onChange(file);
                    }
                  }}
                  className={`cursor-pointer h-12 ${errors.document_file ? "border-red-500" : ""}`}
                  aria-invalid={!!errors.document_file}
                />
                {documentFile && (
                  <p className="text-xs text-gray-500">
                    Fichier sélectionné: {documentFile.name}
                  </p>
                )}
              </>
            )}
          />
          {errors.document_file && (
            <span className="text-xs text-red-500 font-medium">{errors.document_file.message}</span>
          )}
        </div>
      </div>

      <div className="flex gap-2 justify-center pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
          className="h-12"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-[#f08400] hover:bg-[#d87200] text-white h-12"
        >
          {isLoading ? "Envoi en cours..." : "Soumettre"}
        </Button>
      </div>
    </form>
  );
}

