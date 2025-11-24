"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Wallet, Loader2 } from "lucide-react";
import { useRechargeWallet } from "@/hooks/use-wallet";

const rechargeSchema = z.object({
  amount: z
    .number({
      required_error: "Le montant est requis",
      invalid_type_error: "Le montant doit être un nombre",
    })
    .min(1000, "Le montant minimum est de 1000 FCFA")
    .max(10000000, "Le montant maximum est de 10 000 000 FCFA"),
});

type RechargeFormValues = z.infer<typeof rechargeSchema>;

interface RechargeWalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RechargeWalletModal({
  open,
  onOpenChange,
}: RechargeWalletModalProps) {
  const rechargeWallet = useRechargeWallet();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RechargeFormValues>({
    resolver: zodResolver(rechargeSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const onSubmit = async (data: RechargeFormValues) => {
    try {
      await rechargeWallet.mutateAsync({ amount: data.amount });
      reset();
      onOpenChange(false);
    } catch {
      // Error handled by hook
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#f08400]/10 rounded-xl">
              <Wallet className="w-6 h-6 text-[#f08400]" />
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Recharger le wallet
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-600">
            Entrez le montant que vous souhaitez recharger sur votre wallet.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-semibold text-gray-700">
              Montant (FCFA) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              step="100"
              min="1000"
              max="10000000"
              placeholder="Exemple : 10000"
              {...register("amount", { valueAsNumber: true })}
              className={`h-12 text-base ${
                errors.amount ? "border-red-500" : ""
              }`}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Montant minimum : 1 000 FCFA | Montant maximum : 10 000 000 FCFA
            </p>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting || rechargeWallet.isPending}
              className="h-10 sm:h-12 text-xs sm:text-sm w-full sm:w-auto"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || rechargeWallet.isPending}
              className="bg-[#f08400] hover:bg-[#d87200] text-white h-10 sm:h-12 text-xs sm:text-sm w-full sm:w-auto"
            >
              {isSubmitting || rechargeWallet.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                "Continuer vers le paiement"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

