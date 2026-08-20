"use client";

import { cn } from "@/lib/utils";

/**
 * Couleurs statut — sémantique lisible sur fond crème :
 * - succès (confirmé / payé) → vert
 * - attente → ambre / orange marque
 * - échec / annulé → rouge
 * - neutre (terminé / remboursé) → gris chaud
 */
const STATUS_STYLES: Record<string, string> = {
  CONFIRME: "border-[#3d8b5c]/35 bg-[#eaf6ef] text-[#1f6b3f]",
  EN_ATTENTE: "border-[#f08400]/45 bg-[#fff4e6] text-[#c45f00]",
  ANNULE: "border-[#d96b6b]/50 bg-[#fdf0f0] text-[#b42318]",
  COMPLETE: "border-[#12100c]/12 bg-[#f3f0eb] text-[#12100c]/55",
};

const STATUS_LABELS: Record<string, string> = {
  CONFIRME: "Confirmée",
  EN_ATTENTE: "En attente",
  ANNULE: "Annulée",
  COMPLETE: "Terminée",
};

const PAYMENT_STYLES: Record<string, string> = {
  PAYE: "border-[#3d8b5c]/35 bg-[#eaf6ef] text-[#1f6b3f]",
  EN_ATTENTE: "border-[#f08400]/45 bg-[#fff4e6] text-[#c45f00]",
  ECHEC: "border-[#d96b6b]/50 bg-[#fdf0f0] text-[#b42318]",
  REMBOURSE: "border-[#5b7c99]/35 bg-[#eef3f7] text-[#3d5a73]",
};

const PAYMENT_LABELS: Record<string, string> = {
  PAYE: "Payé",
  EN_ATTENTE: "Paiement en attente",
  ECHEC: "Échec paiement",
  REMBOURSE: "Remboursé",
};

export function BookingStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
        STATUS_STYLES[status] ||
          "border-[#12100c]/10 bg-[#faf8f5] text-[#12100c]/55",
        className
      )}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export function PaymentStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
        PAYMENT_STYLES[status] ||
          "border-[#12100c]/10 bg-[#faf8f5] text-[#12100c]/55",
        className
      )}
    >
      {PAYMENT_LABELS[status] || status}
    </span>
  );
}
