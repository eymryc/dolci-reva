"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VerificationForm } from "./VerificationForm";
import { ReviewDocumentData } from "@/hooks/use-owner-verifications";

interface VerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ReviewDocumentData) => void;
  isLoading?: boolean;
  defaultStatus?: "APPROVED" | "REJECTED";
  documentType?: string;
}

export function VerificationModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  defaultStatus,
  documentType,
}: VerificationModalProps) {
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-gray-200">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Réviser le document
          </DialogTitle>
          <DialogDescription>
            {documentType && (
              <span className="font-medium">Type de document: {documentType}</span>
            )}
            <br />
            Examinez le document et décidez de l&apos;approuver ou de le rejeter.
          </DialogDescription>
        </DialogHeader>
        <VerificationForm
          onSubmit={onSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          defaultStatus={defaultStatus}
        />
      </DialogContent>
    </Dialog>
  );
}

