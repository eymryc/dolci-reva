"use client";

import Link from "next/link";
import { ShieldAlert, ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerificationRequiredAlertProps {
  href?: string;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Alerte compacte — espace central de la navbar admin
 */
export function VerificationRequiredAlert({
  href = "/admin/profile?tab=verification",
  onDismiss,
  className,
}: VerificationRequiredAlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "group relative flex w-full min-w-0 max-w-lg items-stretch overflow-hidden",
        "border border-[#f08400]/25 bg-white shadow-[0_2px_12px_rgba(240,132,0,0.12)]",
        "transition-shadow duration-300 hover:shadow-[0_4px_16px_rgba(240,132,0,0.18)]",
        className
      )}
    >
      {/* Accent gauche */}
      <div className="w-1 shrink-0 bg-gradient-to-b from-[#f08400] via-[#ff6b35] to-[#f08400]" />

      <div className="flex min-w-0 flex-1 items-center gap-2.5 bg-gradient-to-r from-[#fff7ed] via-white to-[#fff7ed] px-2.5 py-1.5 sm:gap-3 sm:px-3 sm:py-2">
        {/* Icône */}
        <div className="relative shrink-0">
          <div className="absolute inset-0 animate-ping rounded-sm bg-[#f08400]/25" />
          <div className="relative flex h-8 w-8 items-center justify-center bg-gradient-to-br from-[#f08400] to-[#e06a00] text-white shadow-md shadow-[#f08400]/30 sm:h-9 sm:w-9">
            <ShieldAlert className="h-4 w-4" strokeWidth={2.25} />
          </div>
        </div>

        {/* Texte */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="bg-[#f08400] px-1.5 py-px text-[8px] font-bold uppercase tracking-[0.08em] text-white sm:text-[9px]">
              Action requise
            </span>
            <p className="truncate text-[11px] font-bold text-slate-900 sm:text-xs">
              Compte non vérifié
            </p>
          </div>
          <p className="mt-0.5 hidden truncate text-[10px] text-slate-500 md:block xl:text-[11px]">
            Publiez vos établissements après validation
          </p>
        </div>

        {/* CTA — ne pas appeler onDismiss ici (sinon l'alerte disparaît sans naviguer) */}
        <Link
          href={href}
          className="inline-flex h-8 shrink-0 items-center gap-1 bg-gradient-to-r from-[#f08400] to-[#ff6b35] px-2.5 text-[10px] font-bold text-white shadow-sm transition-all duration-200 hover:brightness-105 hover:shadow-md sm:h-9 sm:gap-1.5 sm:px-3.5 sm:text-[11px]"
        >
          Vérifier
          <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="hidden h-7 w-7 shrink-0 items-center justify-center text-slate-400 transition-colors hover:bg-orange-100 hover:text-slate-700 sm:inline-flex"
            aria-label="Fermer l'alerte"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
