import { CheckCircle2, CircleOff } from "lucide-react";
import { cn } from "@/lib/utils";

type ActiveStatusBadgeProps = {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
  className?: string;
  size?: "sm" | "md";
};

/**
 * Statut Actif / Inactif — contraste fort pour lecture rapide en admin.
 */
export function ActiveStatusBadge({
  active,
  activeLabel = "Actif",
  inactiveLabel = "Inactif",
  className,
  size = "sm",
}: ActiveStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border font-semibold uppercase tracking-[0.08em]",
        size === "sm" ? "px-2 py-1 text-[10px]" : "px-2.5 py-1.5 text-xs",
        active
          ? "border-emerald-600 bg-emerald-600 text-white shadow-[0_6px_16px_-8px_rgba(5,150,105,0.85)]"
          : "border-slate-400 bg-slate-200 text-slate-700",
        className
      )}
    >
      {active ? (
        <CheckCircle2 className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      ) : (
        <CircleOff className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      )}
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
