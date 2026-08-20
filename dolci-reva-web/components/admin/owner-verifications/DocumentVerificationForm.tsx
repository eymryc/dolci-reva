"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileUp, Loader2, Upload, X } from "lucide-react";
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
import { cn } from "@/lib/utils";

export interface DocumentVerificationFormData {
  document_type: DocumentType;
  document_number?: string;
  document_issue_date?: string;
  document_expiry_date?: string;
  identity_document_type?: string;
  document_file: File | null;
}

const documentVerificationSchema = z
  .object({
    document_type: z.enum(["IDENTITY", "ADDRESS_PROOF", "PROPERTY_TITLE", "BANK_STATEMENT", "INSURANCE"], {
      required_error: "Le type de document est requis",
    }),
    document_number: z.string().optional(),
    document_issue_date: z.string().optional(),
    document_expiry_date: z.string().optional(),
    identity_document_type: z.string().optional(),
    document_file: z.union([
      z.instanceof(File).refine((file) => file.size > 0, {
        message: "Le fichier ne peut pas être vide",
      }),
      z.null(),
    ]),
  })
  .refine(
    (data) => {
      if (data.document_type === "IDENTITY") {
        return Boolean(data.identity_document_type);
      }
      return true;
    },
    {
      message: "Le type de pièce d'identité est requis",
      path: ["identity_document_type"],
    }
  )
  .refine(
    (data) => {
      if (data.document_type === "IDENTITY" && data.identity_document_type) {
        return ["CNI", "PASSPORT", "SEJOUR", "OTHER"].includes(data.identity_document_type);
      }
      return true;
    },
    {
      message: "Choisissez CNI, passeport, séjour ou autre",
      path: ["identity_document_type"],
    }
  );

type DocumentVerificationFormValues = z.infer<typeof documentVerificationSchema>;

interface DocumentVerificationFormProps {
  onSubmit: (data: DocumentVerificationFormData) => Promise<void>;
  onCancel: () => void;
  defaultDocumentType?: DocumentType;
  isLoading?: boolean;
}

const inputCls =
  "h-11 rounded-none border-slate-200 bg-white transition-all focus-visible:border-[#f08400] focus-visible:ring-[#f08400]/20";

export function DocumentVerificationForm({
  onSubmit,
  onCancel,
  defaultDocumentType,
  isLoading = false,
}: DocumentVerificationFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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
      document_file: null,
    },
  });

  const documentFile = watch("document_file");

  const fieldMapping: Record<string, keyof DocumentVerificationFormValues> = {
    document_type: "document_type",
    document_file: "document_file",
    document_number: "document_number",
    document_issue_date: "document_issue_date",
    document_expiry_date: "document_expiry_date",
    identity_document_type: "identity_document_type",
  };

  const {
    serverErrors,
    showErrorPanel,
    handleServerError,
    clearErrors: clearServerErrors,
    setShowErrorPanel,
  } = useServerErrors<DocumentVerificationFormValues>({
    setError,
    fieldMapping,
  });

  useEffect(() => {
    if (defaultDocumentType) {
      setValue("document_type", defaultDocumentType);
    }
  }, [defaultDocumentType, setValue]);

  const assignFile = (file: File | null | undefined) => {
    if (!file) {
      setValue("document_file", null, { shouldValidate: true });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("document_file", { type: "manual", message: "Fichier trop volumineux (max 10 Mo)" });
      return;
    }
    clearErrors("document_file");
    setValue("document_file", file, { shouldValidate: true });
  };

  const onFormSubmit = async (data: DocumentVerificationFormValues) => {
    clearServerErrors();
    clearErrors();

    if (!data.document_file) {
      setError("document_file", {
        type: "manual",
        message: "Le fichier du document est requis",
      });
      return;
    }

    try {
      await onSubmit({
        document_type: data.document_type,
        document_file: data.document_file,
        document_number: data.document_number,
        document_issue_date: data.document_issue_date,
        document_expiry_date: data.document_expiry_date,
        identity_document_type: data.identity_document_type,
      });
    } catch (error) {
      handleServerError(error);
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
    setValue("document_file", null);
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-600">Type de document</Label>
          <div className="flex h-11 items-center border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800">
            Pièce d&apos;identité
          </div>
          <input type="hidden" {...register("document_type")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="identity_document_type" className="text-xs font-semibold text-slate-600">
            Nature de la pièce <span className="text-red-500">*</span>
          </Label>
          <Select
            value={watch("identity_document_type") || ""}
            onValueChange={(value) => setValue("identity_document_type", value, { shouldValidate: true })}
          >
            <SelectTrigger
              className={cn(inputCls, "w-full", errors.identity_document_type && "border-red-500")}
            >
              <SelectValue placeholder="CNI, passeport…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CNI">Carte nationale d&apos;identité</SelectItem>
              <SelectItem value="PASSPORT">Passeport</SelectItem>
              <SelectItem value="SEJOUR">Titre de séjour</SelectItem>
              <SelectItem value="OTHER">Autre</SelectItem>
            </SelectContent>
          </Select>
          {errors.identity_document_type && (
            <span className="text-xs font-medium text-red-500">
              {errors.identity_document_type.message}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="document_number" className="text-xs font-semibold text-slate-600">
          Numéro du document
        </Label>
        <Input
          id="document_number"
          {...register("document_number")}
          placeholder="Ex. CI123456789"
          className={cn(inputCls, errors.document_number && "border-red-500")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="document_issue_date" className="text-xs font-semibold text-slate-600">
            Date d&apos;émission
          </Label>
          <Input
            id="document_issue_date"
            type="date"
            {...register("document_issue_date")}
            className={cn(inputCls, errors.document_issue_date && "border-red-500")}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="document_expiry_date" className="text-xs font-semibold text-slate-600">
            Date d&apos;expiration
          </Label>
          <Input
            id="document_expiry_date"
            type="date"
            {...register("document_expiry_date")}
            className={cn(inputCls, errors.document_expiry_date && "border-red-500")}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-slate-600">
          Fichier <span className="text-red-500">*</span>
        </Label>
        <Controller
          name="document_file"
          control={control}
          render={({ field: { name, ref } }) => (
            <div>
              <input
                ref={(node) => {
                  ref(node);
                  fileInputRef.current = node;
                }}
                id="document_file"
                name={name}
                type="file"
                accept="image/*,.pdf"
                className="sr-only"
                onChange={(e) => assignFile(e.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  assignFile(e.dataTransfer.files?.[0]);
                }}
                className={cn(
                  "flex w-full flex-col items-center justify-center gap-2 border border-dashed px-4 py-7 text-center transition-colors",
                  isDragging
                    ? "border-[#f08400] bg-orange-50"
                    : errors.document_file
                      ? "border-red-300 bg-red-50/40"
                      : "border-slate-200 bg-slate-50/80 hover:border-[#f08400]/50 hover:bg-orange-50/40"
                )}
              >
                <span className="flex h-10 w-10 items-center justify-center bg-gradient-to-br from-[#f08400] to-[#ff6b35] text-white shadow-md shadow-[#f08400]/25">
                  <Upload className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  Glissez votre fichier ici ou cliquez pour parcourir
                </span>
                <span className="text-[11px] text-slate-500">JPG, PNG ou PDF · 10 Mo maximum</span>
              </button>

              {documentFile && (
                <div className="mt-2 flex items-center justify-between gap-2 border border-orange-100 bg-orange-50/50 px-3 py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <FileUp className="h-4 w-4 shrink-0 text-[#f08400]" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-800">{documentFile.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {(documentFile.size / 1024 / 1024).toFixed(2)} Mo
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      assignFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="flex h-7 w-7 items-center justify-center text-slate-400 hover:bg-white hover:text-slate-700"
                    aria-label="Retirer le fichier"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        />
        {errors.document_file && (
          <span className="text-xs font-medium text-red-500">{errors.document_file.message}</span>
        )}
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
          className="h-11 rounded-none border-slate-200"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="h-11 rounded-none bg-gradient-to-r from-[#f08400] to-[#ff6b35] px-5 font-bold text-white shadow-md shadow-[#f08400]/25 hover:opacity-95"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Envoi en cours…
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Soumettre le document
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
