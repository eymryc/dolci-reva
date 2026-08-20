/**
 * Chip discret pour un statut (vérification, document…)
 */

import { cn } from "@/lib/utils";

interface UserStatusBadgeProps {
  status?: string | null;
}

const STATUS_MAP: Record<string, { label: string; dot: string; className: string }> = {
  PENDING: {
    label: "En attente",
    dot: "bg-amber-400",
    className: "border-slate-200 bg-white text-slate-700",
  },
  SUBMITTED: {
    label: "Soumis",
    dot: "bg-sky-400",
    className: "border-slate-200 bg-white text-slate-700",
  },
  UNDER_REVIEW: {
    label: "En révision",
    dot: "bg-slate-400",
    className: "border-slate-200 bg-white text-slate-700",
  },
  APPROVED: {
    label: "Approuvé",
    dot: "bg-emerald-500",
    className: "border-slate-200 bg-white text-slate-700",
  },
  VERIFIED: {
    label: "Vérifié",
    dot: "bg-emerald-500",
    className: "border-slate-200 bg-white text-slate-700",
  },
  REJECTED: {
    label: "Rejeté",
    dot: "bg-red-500",
    className: "border-slate-200 bg-white text-slate-700",
  },
  SUSPENDED: {
    label: "Suspendu",
    dot: "bg-slate-400",
    className: "border-slate-200 bg-white text-slate-700",
  },
};

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  if (!status) return null;

  const meta = STATUS_MAP[status] || {
    label: status,
    dot: "bg-slate-300",
    className: "border-slate-200 bg-white text-slate-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2 py-0.5 text-[11px] font-medium",
        meta.className
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0", meta.dot)} />
      {meta.label}
    </span>
  );
}
