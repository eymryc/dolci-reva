"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";

export type UnitAvailabilityStatus =
  | "available"
  | "reserved"
  | "occupied"
  | "blocked"
  | "inactive";

export interface UnitAvailability {
  status: UnitAvailabilityStatus | string;
  label?: string | null;
  occupied_until?: string | null;
  free_from?: string | null;
  /** Legacy residence field */
  next_available_date?: string | null;
  next_booking_start?: string | null;
  booking_status?: string | null;
  message?: string | null;
}

function normalizeAvailability(
  availability?: UnitAvailability | null
): UnitAvailability | null {
  if (!availability) return null;

  let status = availability.status;
  if (status === "occupied") status = "reserved";

  const freeFrom =
    availability.free_from ||
    availability.next_available_date ||
    null;

  const label =
    availability.label ||
    (status === "available"
      ? "Disponible"
      : status === "reserved"
        ? "Réservé"
        : status === "blocked"
          ? "Indisponible"
          : status === "inactive"
            ? "Inactive"
            : availability.message || status);

  return { ...availability, status, free_from: freeFrom, label };
}

function formatCountdownToDate(isoDate: string, now: number): string {
  const target = new Date(isoDate.includes("T") ? isoDate : isoDate + "T00:00:00").getTime();
  if (Number.isNaN(target)) return "";
  const ms = Math.max(0, target - now);
  if (ms <= 0) return "bientôt";

  const totalH = Math.floor(ms / 3_600_000);
  const days = Math.floor(totalH / 24);
  const hours = totalH % 24;
  const minutes = Math.floor((ms % 3_600_000) / 60_000);

  if (days > 0) return `${days} j ${hours} h`;
  if (hours > 0) return `${hours} h ${minutes.toString().padStart(2, "0")} min`;
  return `${Math.max(1, minutes)} min`;
}

function formatDateLabel(iso: string): string {
  const d = new Date(iso.includes("T") ? iso : iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Badge d'état + délai de libération (hôtel, résidence, table, zone…).
 */
export function UnitAvailabilityBadge({
  availability,
  className,
  compact,
}: {
  availability?: UnitAvailability | null;
  className?: string;
  compact?: boolean;
}) {
  const resolved = useMemo(
    () => normalizeAvailability(availability),
    [availability]
  );
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (resolved?.status !== "reserved" || !resolved.free_from) return;
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, [resolved?.status, resolved?.free_from]);

  if (!resolved) return null;

  const styles: Record<string, string> = {
    available: "border-[#3d8b5c]/35 bg-[#eaf6ef] text-[#1f6b3f]",
    reserved: "border-[#f08400]/45 bg-[#fff4e6] text-[#c45f00]",
    blocked: "border-[#d96b6b]/50 bg-[#fdf0f0] text-[#b42318]",
    inactive: "border-[#12100c]/10 bg-[#f3f0eb] text-[#12100c]/50",
  };

  const freeLabel =
    resolved.status === "reserved" && resolved.free_from
      ? formatCountdownToDate(resolved.free_from, now)
      : null;

  if (compact) {
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        <span
          className={cn(
            "inline-flex border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
            styles[resolved.status] || styles.available
          )}
        >
          {resolved.label}
        </span>
        {resolved.status === "reserved" && freeLabel ? (
          <span className="text-[11px] font-medium text-[#c45f00]">
            Libre dans {freeLabel}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <span
        className={cn(
          "inline-flex border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
          styles[resolved.status] || styles.available
        )}
      >
        {resolved.label}
      </span>
      {resolved.status === "reserved" && resolved.free_from ? (
        <p className="flex items-center gap-1.5 text-xs font-medium text-[#c45f00]">
          <Clock3 className="h-3.5 w-3.5 shrink-0" />
          Libre dans {freeLabel}
          <span className="font-normal text-[#12100c]/45">
            · {formatDateLabel(resolved.free_from)}
          </span>
        </p>
      ) : resolved.status === "available" && resolved.next_booking_start ? (
        <p className="text-xs text-[#12100c]/50">
          Prochaine réservation le{" "}
          {formatDateLabel(resolved.next_booking_start)}
        </p>
      ) : resolved.message && resolved.status !== "available" ? (
        <p className="text-xs text-[#12100c]/50">{resolved.message}</p>
      ) : null}
    </div>
  );
}
