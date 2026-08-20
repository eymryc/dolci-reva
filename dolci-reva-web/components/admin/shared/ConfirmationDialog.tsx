"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Confirmer",
  description = "Êtes-vous sûr de vouloir effectuer cette action ?",
  itemName,
  isLoading = false,
  confirmText = "Confirmer",
  cancelText = "Annuler",
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-600 pt-2">
            {description}
            {itemName && (
              <span className="block mt-2 font-semibold text-gray-900">
                &quot;{itemName}&quot;
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="h-10 sm:h-12 text-xs sm:text-sm w-full sm:w-auto"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-[#f08400] hover:bg-[#d87200] text-white h-10 sm:h-12 text-xs sm:text-sm w-full sm:w-auto"
          >
            {isLoading ? "Traitement..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

