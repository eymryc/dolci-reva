"use client";

import { cn } from "@/lib/utils";
import type { User } from "@/types/entities/user.types";

interface UserStatsTabProps {
  user: User;
}

function Metric({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: string;
}) {
  return (
    <div className="min-w-0 px-5 py-5 sm:px-6">
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-slate-400">{label}</p>
      <p className={cn("mt-2 text-3xl font-semibold tracking-tight text-slate-900", tone)}>{value}</p>
      <p className="mt-1 text-[11px] text-slate-400">{hint}</p>
    </div>
  );
}

export function UserStatsTab({ user }: UserStatsTabProps) {
  const hasReputation = user.reputation_score != null && user.reputation_score !== "";
  const hasBookings = user.total_bookings != null;
  const hasCancelRate = user.cancellation_rate != null && user.cancellation_rate !== "";

  const cancelRate = hasCancelRate ? parseFloat(user.cancellation_rate!) : null;
  const cancelTone =
    cancelRate == null
      ? undefined
      : cancelRate > 10
        ? "text-red-600"
        : cancelRate > 5
          ? "text-amber-700"
          : "text-emerald-700";

  return (
    <section className="border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-3 sm:px-6">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900">Statistiques</h2>
        <p className="mt-0.5 text-[11px] text-slate-400">Indicateurs disponibles pour ce compte</p>
      </div>
      <div className="grid grid-cols-1 divide-y divide-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <Metric
          label="Réputation"
          value={hasReputation ? parseFloat(user.reputation_score!).toFixed(2) : "—"}
          hint="Avis et interactions"
        />
        <Metric
          label="Réservations"
          value={hasBookings ? String(user.total_bookings) : "—"}
          hint="Total effectuées"
        />
        <Metric
          label="Annulations"
          value={hasCancelRate ? `${cancelRate!.toFixed(2)}%` : "—"}
          hint="Taux d'annulation"
          tone={cancelTone}
        />
      </div>
    </section>
  );
}
