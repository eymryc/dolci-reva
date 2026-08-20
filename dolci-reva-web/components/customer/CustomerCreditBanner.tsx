"use client";

import { Gift } from "lucide-react";
import { useCustomerCredits } from "@/hooks/use-customer-credits";
import { cn } from "@/lib/utils";

function formatMoney(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(value);
}

export function CustomerCreditBanner({ className }: { className?: string }) {
  const { data, isLoading } = useCustomerCredits();

  if (isLoading || !data?.enabled || !data.balance || data.balance <= 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 border border-[#f08400]/25 bg-gradient-to-r from-[#fff4e8] to-white px-4 py-3",
        className
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#f08400]/15 text-[#f08400]">
        <Gift className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#12100c]">
          Avoir Dolci disponible : {formatMoney(data.balance)}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
          Appliqué automatiquement sur vos prochaines réservations. Le reste se
          paie via Paystack si besoin.
        </p>
      </div>
    </div>
  );
}
