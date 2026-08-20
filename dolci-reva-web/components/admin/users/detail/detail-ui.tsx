import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DetailSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border border-slate-200 bg-white", className)}>
      <div className="border-b border-slate-100 px-4 py-3 sm:px-5">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900">{title}</h2>
        {description ? <p className="mt-0.5 text-[11px] text-slate-400">{description}</p> : null}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function DetailField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.06em] text-slate-400">
        {label}
      </p>
      <div className="text-sm text-slate-800">{children ?? "—"}</div>
    </div>
  );
}

export function DetailBool({ value, yes = "Oui", no = "Non" }: { value?: boolean; yes?: string; no?: string }) {
  return (
    <span className={cn("text-sm font-medium", value ? "text-emerald-700" : "text-slate-400")}>
      {value ? yes : no}
    </span>
  );
}

export function formatDetailDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDetailMoney(value?: number | null) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}
