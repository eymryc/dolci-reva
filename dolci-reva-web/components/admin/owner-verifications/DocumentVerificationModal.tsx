"use client";

import React from "react";
import { IdCard, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DocumentVerificationForm, DocumentVerificationFormData } from "./DocumentVerificationForm";
import { DocumentType } from "@/hooks/use-owner-verifications";

interface DocumentVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DocumentVerificationFormData) => Promise<void>;
  defaultDocumentType?: DocumentType;
  isLoading?: boolean;
}

export function DocumentVerificationModal({
  open,
  onOpenChange,
  onSubmit,
  defaultDocumentType,
  isLoading = false,
}: DocumentVerificationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden rounded-none border-slate-200 p-0 sm:max-w-[560px] max-h-[90vh]">
        <div className="relative overflow-hidden bg-gradient-to-r from-[#f08400] via-[#f08400] to-[#ff6b35] px-5 py-5 text-white sm:px-6">
          <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
          <DialogHeader className="relative space-y-2 text-left">
            <div className="mb-1 flex h-11 w-11 items-center justify-center bg-white/15 ring-1 ring-white/25">
              <IdCard className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-white">
              Soumettre une pièce d&apos;identité
            </DialogTitle>
            <DialogDescription className="text-sm text-white/85">
              Document clair et lisible (CNI, passeport ou titre de séjour). Formats JPG, PNG ou PDF — 10 Mo max.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="max-h-[min(70vh,560px)] overflow-y-auto px-5 py-5 sm:px-6">
          <div className="mb-4 flex items-start gap-2.5 border border-orange-100 bg-orange-50/70 px-3 py-2.5">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#f08400]" />
            <p className="text-xs leading-relaxed text-slate-600">
              Votre document est traité de façon confidentielle. La validation permet de publier vos établissements.
            </p>
          </div>

          <DocumentVerificationForm
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            defaultDocumentType={defaultDocumentType}
            isLoading={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
