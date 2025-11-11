"use client";

import React from "react";
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
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Soumettre un document de vérification
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Téléchargez votre document de vérification. Assurez-vous que le fichier est clair et lisible.
          </DialogDescription>
        </DialogHeader>
        <DocumentVerificationForm
          onSubmit={onSubmit}
          onCancel={handleCancel}
          defaultDocumentType={defaultDocumentType}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}

