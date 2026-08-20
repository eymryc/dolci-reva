"use client";

import { useEffect, useState } from "react";
import { Clock3, Timer } from "lucide-react";
import type { Booking } from "@/types/entities/booking.types";
import { cn } from "@/lib/utils";

function msRemaining(iso: string | null | undefined, now: number): number {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 0;
  return Math.max(0, t - now);
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "0 min";

  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  if (days > 0) {
    return `${days} j ${hours} h`;
  }
  if (hours > 0) {
    return `${hours} h ${minutes.toString().padStart(2, "0")} min`;
  }
  if (minutes > 0) {
    return `${minutes} min ${seconds.toString().padStart(2, "0")} s`;
  }
  return `${seconds} s`;
}

function formatDeadline(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Compte à rebours live : hold paiement non payé + fenêtre d'annulation gratuite.
 */
export function BookingCancelDeadline({
  booking,
  compact,
  className,
}: {
  booking: Booking;
  compact?: boolean;
  className?: string;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (booking.status === "ANNULE" || booking.status === "COMPLETE") {
    return null;
  }

  const window_ = booking.cancellation_window;
  const unpaidIso = window_?.unpaid_expires_at ?? null;
  const freeUntilIso = window_?.free_cancel_until ?? null;
  const withinGrace = !!window_?.within_grace;
  const isFreeOpen =
    window_?.is_free_cancel_open ??
    (freeUntilIso ? msRemaining(freeUntilIso, now) > 0 : false);

  const unpaidMs = msRemaining(unpaidIso, now);
  const freeMs = msRemaining(freeUntilIso, now);
  const latePct =
    window_?.late_refund_percent ??
    booking.cancellation_policy?.late_refund_percent ??
    0;

  const showUnpaid =
    !!unpaidIso &&
    (booking.payment_status === "EN_ATTENTE" ||
      booking.payment_status === "ECHEC");

  if (!showUnpaid && !freeUntilIso && window_?.is_free_cancel_open !== true) {
    return null;
  }

  const freeLabelOpen = withinGrace
    ? `Annulation gratuite (grâce) : ${formatCountdown(freeMs)}`
    : `Annulation gratuite : ${formatCountdown(freeMs)}`;

  const freeLabelClosed =
    latePct > 0
      ? `Hors délai · remboursement ${latePct}%`
      : "Annulation gratuite indisponible";

  if (compact) {
    if (showUnpaid) {
      return (
        <div
          className={cn(
            "flex items-center gap-2 border border-[#f08400]/30 bg-[#fff4e6] px-3 py-2 text-xs",
            unpaidMs <= 0
              ? "border-[#d96b6b]/40 bg-[#fdf0f0] text-[#b42318]"
              : "text-[#c45f00]",
            className
          )}
        >
          <Timer className="h-3.5 w-3.5 shrink-0" />
          <span className="font-semibold">
            {unpaidMs > 0
              ? `Annulation auto dans ${formatCountdown(unpaidMs)}`
              : "Délai de paiement expiré"}
          </span>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "flex items-center gap-2 border px-3 py-2 text-xs",
          isFreeOpen && freeMs > 0
            ? "border-[#3d8b5c]/30 bg-[#eaf6ef] text-[#1f6b3f]"
            : "border-[#12100c]/10 bg-[#faf8f5] text-[#12100c]/55",
          className
        )}
      >
        <Clock3 className="h-3.5 w-3.5 shrink-0" />
        <span className="font-semibold">
          {isFreeOpen && freeMs > 0 ? freeLabelOpen : freeLabelClosed}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border px-4 py-3",
        showUnpaid
          ? unpaidMs > 0
            ? "border-[#f08400]/35 bg-[#fff4e6]"
            : "border-[#d96b6b]/40 bg-[#fdf0f0]"
          : isFreeOpen && freeMs > 0
            ? "border-[#3d8b5c]/30 bg-[#eaf6ef]"
            : "border-[#12100c]/08 bg-[#faf8f5]",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center",
            showUnpaid
              ? "bg-[#f08400]/15 text-[#c45f00]"
              : isFreeOpen && freeMs > 0
                ? "bg-[#3d8b5c]/15 text-[#1f6b3f]"
                : "bg-[#12100c]/06 text-[#12100c]/45"
          )}
        >
          {showUnpaid ? (
            <Timer className="h-4 w-4" />
          ) : (
            <Clock3 className="h-4 w-4" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          {showUnpaid ? (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#12100c]/45">
                Délai de paiement
              </p>
              <p
                className={cn(
                  "mt-1 text-sm font-bold tabular-nums",
                  unpaidMs > 0 ? "text-[#c45f00]" : "text-[#b42318]"
                )}
              >
                {unpaidMs > 0
                  ? `Annulation automatique dans ${formatCountdown(unpaidMs)}`
                  : "Délai expiré — réservation bientôt libérée"}
              </p>
              {unpaidIso ? (
                <p className="mt-0.5 text-xs text-[#12100c]/45">
                  Expire le {formatDeadline(unpaidIso)}
                </p>
              ) : null}
            </>
          ) : (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#12100c]/45">
                Délai d&apos;annulation
              </p>
              <p
                className={cn(
                  "mt-1 text-sm font-bold tabular-nums",
                  isFreeOpen && freeMs > 0
                    ? "text-[#1f6b3f]"
                    : "text-[#12100c]/70"
                )}
              >
                {isFreeOpen && freeMs > 0
                  ? withinGrace
                    ? `Grâce post-réservation : encore ${formatCountdown(freeMs)}`
                    : `Annulation gratuite encore ${formatCountdown(freeMs)}`
                  : freeLabelClosed}
              </p>
              {freeUntilIso && isFreeOpen && freeMs > 0 ? (
                <p className="mt-0.5 text-xs text-[#12100c]/45">
                  Jusqu&apos;au {formatDeadline(freeUntilIso)}
                  {withinGrace
                    ? " (grâce après réservation)"
                    : " (avant le début du séjour)"}
                </p>
              ) : booking.cancellation_policy?.summary ? (
                <p className="mt-0.5 text-xs text-[#12100c]/45">
                  {booking.cancellation_policy.summary}
                </p>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
