"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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

const PRESET_AMOUNTS = [2000, 5000, 10000];

export function RechargeWalletModal({
  open,
  onOpenChange,
}: RechargeWalletModalProps) {
  const rechargeWallet = useRechargeWallet();
  const [selectedAmount, setSelectedAmount] = useState<number>(5000);
  
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<RechargeFormValues>({
    resolver: zodResolver(rechargeSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      amount: 5000,
    },
  });

  const currentAmount = watch("amount");

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount);
    setValue("amount", amount, { shouldValidate: true });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value) : 0;
    setValue("amount", value, { shouldValidate: true });
    setSelectedAmount(value);
  };

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
    setSelectedAmount(5000);
    onOpenChange(false);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
            Sélectionnez le montant que vous souhaitez recharger sur votre wallet.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {/* Champ d'affichage du montant */}
          <div className="space-y-2">
            <div className="relative">
              <input
                type="number"
                step="100"
                min="1000"
                max="10000000"
                value={currentAmount || ""}
                onChange={handleAmountChange}
                className={`w-full h-16 px-4 text-2xl font-bold italic text-gray-900 bg-gray-100 rounded-lg border-2 ${
                  errors.amount ? "border-red-500" : "border-transparent"
                } focus:outline-none focus:ring-2 focus:ring-[#f08400] focus:border-transparent text-center`}
                placeholder="0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-bold italic text-gray-900 pointer-events-none">
                F
              </span>
            </div>
            {errors.amount && (
              <p className="text-sm text-red-500 text-center">{errors.amount.message}</p>
            )}
          </div>

          {/* Boutons de montants prédéfinis */}
          <div className="flex gap-3 justify-center">
            {PRESET_AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => handlePresetClick(amount)}
                className={`flex-1 h-14 rounded-lg border-2 font-bold italic text-lg transition-all duration-200 ${
                  selectedAmount === amount
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-900 border-gray-300 hover:border-gray-400"
                }`}
              >
                {formatAmount(amount)} F
              </button>
            ))}
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
              disabled={isSubmitting || rechargeWallet.isPending || !currentAmount || currentAmount < 1000}
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

