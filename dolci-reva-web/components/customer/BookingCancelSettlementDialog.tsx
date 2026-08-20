"use client";

import { useState } from "react";
import { Gift, Loader2, WalletCards } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Booking } from "@/types/entities/booking.types";

function formatMoney(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(value);
}

export type SettlementChoice = "paystack" | "credit";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking;
  isLoading?: boolean;
  onConfirm: (settlement: SettlementChoice) => void;
};

export function BookingCancelSettlementDialog({
  open,
  onOpenChange,
  booking,
  isLoading,
  onConfirm,
}: Props) {
  const estimate = booking.refund_estimate;
  const canChooseCredit =
    !!estimate?.credit_enabled && (estimate?.refund_amount ?? 0) > 0;
  const [settlement, setSettlement] = useState<SettlementChoice>("paystack");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Annuler la réservation</DialogTitle>
          <DialogDescription>
            {canChooseCredit
              ? "Choisissez comment récupérer votre argent."
              : "Confirmez l'annulation de cette réservation."}
          </DialogDescription>
        </DialogHeader>

        {canChooseCredit ? (
          <div className="space-y-3 py-2">
            <button
              type="button"
              onClick={() => setSettlement("paystack")}
              className={cn(
                "w-full border px-4 py-3 text-left transition-colors",
                settlement === "paystack"
                  ? "border-[#f08400] bg-[#fff4e8]"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <div className="flex items-start gap-3">
                <WalletCards className="mt-0.5 h-4 w-4 text-slate-600" />
                <div>
                  <p className="text-sm font-semibold text-[#12100c]">
                    Remboursement sur mon moyen de paiement
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatMoney(estimate!.refund_amount)} renvoyé via Paystack
                    (Wave / OM / carte)
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSettlement("credit")}
              className={cn(
                "w-full border px-4 py-3 text-left transition-colors",
                settlement === "credit"
                  ? "border-[#f08400] bg-[#fff4e8]"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <div className="flex items-start gap-3">
                <Gift className="mt-0.5 h-4 w-4 text-[#f08400]" />
                <div>
                  <p className="text-sm font-semibold text-[#12100c]">
                    Avoir Dolci (+{estimate!.bonus_percent} %)
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatMoney(estimate!.credit_amount)} crédités pour une
                    prochaine réservation (valable 12 mois)
                  </p>
                </div>
              </div>
            </button>
          </div>
        ) : estimate && estimate.refund_amount <= 0 ? (
          <p className="py-2 text-sm text-amber-800">
            Hors délai d&apos;annulation gratuite : aucun remboursement
            automatique.
          </p>
        ) : null}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            className="rounded-none"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
          >
            Garder
          </Button>
          <Button
            type="button"
            className="rounded-none bg-[#b42318] hover:bg-[#8f1b12]"
            disabled={isLoading}
            onClick={() => onConfirm(canChooseCredit ? settlement : "paystack")}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Confirmer l'annulation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
