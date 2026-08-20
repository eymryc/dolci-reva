"use client";

import type { ReactNode } from "react";
import { Check, Loader2, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomerCreditBanner } from "@/components/customer/CustomerCreditBanner";
import { DetailBookingCard } from "@/components/front-office/detail/DetailLayout";
import { cn } from "@/lib/utils";

function formatPrice(value: string | number): string {
  const n = typeof value === "number" ? value : Number(String(value).replace(/\s/g, ""));
  if (!Number.isFinite(n)) return String(value);
  return Math.round(n).toLocaleString("fr-FR");
}

export function BookingSidebarShell({
  price,
  priceUnit,
  priceCaption,
  children,
  total,
  totalPlaceholder = "Sélectionnez les options pour voir le prix total",
  onSubmit,
  submitLabel = "Réserver maintenant",
  submitDisabled,
  isSubmitting,
  showNotChargedYet = true,
  cancellationSummary,
  className,
}: {
  /** Main headline price — omit to hide the price block */
  price?: string | number | null;
  /** e.g. "/ nuit", "/ couvert" */
  priceUnit?: string | null;
  /** Small line under unit, optional */
  priceCaption?: string | null;
  children: ReactNode;
  /** Price breakdown when ready; otherwise placeholder */
  total?: ReactNode | null;
  totalPlaceholder?: string;
  onSubmit: () => void;
  submitLabel?: string;
  submitDisabled?: boolean;
  isSubmitting?: boolean;
  showNotChargedYet?: boolean;
  /** Politique d'annulation (sous le footer confiance) */
  cancellationSummary?: string | null;
  className?: string;
}) {
  const hasPrice =
    price !== null &&
    price !== undefined &&
    price !== "" &&
    !(typeof price === "number" && !Number.isFinite(price));

  return (
    <DetailBookingCard className={cn(className)}>
      <CustomerCreditBanner className="mb-5" />

      {hasPrice ? (
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-end justify-center gap-1">
            <span className="bg-gradient-to-r from-theme-primary to-theme-accent bg-clip-text text-5xl font-extrabold text-transparent">
              {formatPrice(price)}
            </span>
            <span className="mb-1 text-xl text-gray-600">FCFA</span>
          </div>
          {priceUnit ? (
            <p className="mb-4 text-sm text-gray-500">{priceUnit}</p>
          ) : null}
          {priceCaption ? (
            <p className="mb-4 text-xs text-gray-500">{priceCaption}</p>
          ) : null}
          <Badge
            variant="secondary"
            className="border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 text-green-700 shadow-sm"
          >
            <Check className="mr-1.5 h-4 w-4" />
            Meilleur prix garanti
          </Badge>
        </div>
      ) : (
        <div className="mb-6 text-center">
          <Badge
            variant="secondary"
            className="border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 text-green-700 shadow-sm"
          >
            <Check className="mr-1.5 h-4 w-4" />
            Meilleur prix garanti
          </Badge>
        </div>
      )}

      <div className="mb-8 space-y-5">{children}</div>

      {total ? (
        <div className="mb-8 space-y-3 rounded-none border border-gray-100 bg-[#faf8f5] p-5">
          {total}
        </div>
      ) : (
        <div className="mb-8 rounded-none border border-gray-100 bg-[#faf8f5] p-5 text-center">
          <p className="text-sm text-gray-500">{totalPlaceholder}</p>
        </div>
      )}

      <Button
        type="button"
        onClick={onSubmit}
        disabled={submitDisabled || isSubmitting}
        className="w-full transform rounded-none bg-[#f08400] py-5 text-lg font-bold text-white shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#d97400] hover:shadow-2xl disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 inline-block h-5 w-5 animate-spin" />
            Réservation en cours...
          </>
        ) : (
          submitLabel
        )}
      </Button>

      <div className="mt-6 space-y-3 text-center">
        {showNotChargedYet ? (
          <p className="text-sm font-medium text-gray-500">
            Le paiement sécurise votre réservation
          </p>
        ) : null}
        <div className="flex items-center justify-center gap-2 rounded-none bg-gray-50 px-4 py-2 text-xs text-gray-500">
          <Shield className="h-4 w-4 text-theme-primary" />
          <span className="font-medium">Paiement sécurisé</span>
        </div>
        {cancellationSummary ? (
          <p className="text-xs leading-relaxed text-gray-400">
            {cancellationSummary}
          </p>
        ) : null}
      </div>
    </DetailBookingCard>
  );
}

export function BookingTotalRow({
  label,
  value,
  emphasize,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  emphasize?: boolean;
  valueClassName?: string;
}) {
  if (emphasize) {
    return (
      <div className="mt-2 border-t-2 border-gray-300 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">{label}</span>
          <span className="text-2xl font-extrabold text-theme-primary">
            {value}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between border-b border-gray-200 py-2 text-sm last:border-0">
      <span className="text-gray-600">{label}</span>
      <span className={cn("font-semibold text-gray-900", valueClassName)}>
        {value}
      </span>
    </div>
  );
}
