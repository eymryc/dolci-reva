"use client";

import type { ComponentType, ReactNode } from "react";
import { RefreshCw, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ListingEmptyStateProps = {
  title?: string;
  description?: string;
  onReset?: () => void;
  resetLabel?: string;
  icon?: ComponentType<{ className?: string }>;
  className?: string;
  children?: ReactNode;
};

export function ListingEmptyState({
  title = "Aucun résultat trouvé",
  description = "Aucun lieu ne correspond à vos critères. Essayez d’élargir ou de réinitialiser vos filtres.",
  onReset,
  resetLabel = "Réinitialiser les filtres",
  icon: Icon = Search,
  className,
  children,
}: ListingEmptyStateProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border border-[#12100c]/08 bg-gradient-to-br from-[#fffaf5] via-white to-[#faf8f5] px-6 py-16 text-center sm:px-10 sm:py-20",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#f08400]/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-12 h-52 w-52 rounded-full bg-[#ffb347]/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#12100c05_1px,transparent_1px),linear-gradient(to_bottom,#12100c05_1px,transparent_1px)] bg-[size:24px_24px]"
      />

      <div className="relative mx-auto flex max-w-md flex-col items-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center border border-[#f08400]/25 bg-white text-[#f08400] shadow-[0_12px_30px_-16px_rgba(240,132,0,0.55)] sm:h-20 sm:w-20">
          <Icon className="h-8 w-8 sm:h-9 sm:w-9" />
        </div>

        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#f08400]">
          Recherche
        </p>
        <h3 className="mb-3 text-2xl font-bold tracking-tight text-[#12100c] sm:text-3xl">
          {title}
        </h3>
        <p className="mb-8 text-sm leading-relaxed text-[#5c574f] sm:text-base">
          {description}
        </p>

        {children}

        {onReset && (
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="h-11 rounded-none border border-[#f08400] bg-white px-6 text-xs font-semibold uppercase tracking-[0.14em] text-[#f08400] transition-all hover:bg-[#f08400] hover:text-white sm:h-12"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {resetLabel}
          </Button>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#f08400]/70 to-transparent" />
    </div>
  );
}

type ListingErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
};

export function ListingErrorState({
  title = "Erreur de chargement",
  description = "Une erreur s’est produite. Veuillez réessayer dans un instant.",
  onRetry,
  className,
}: ListingErrorStateProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border border-red-200/70 bg-gradient-to-br from-[#fff7f5] via-white to-[#faf8f5] px-6 py-16 text-center sm:px-10 sm:py-20",
        className
      )}
    >
      <div className="relative mx-auto flex max-w-md flex-col items-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center border border-red-200 bg-white text-[#b42318] sm:h-20 sm:w-20">
          <AlertCircle className="h-8 w-8 sm:h-9 sm:w-9" />
        </div>
        <h3 className="mb-3 text-2xl font-bold tracking-tight text-[#12100c] sm:text-3xl">
          {title}
        </h3>
        <p className="mb-8 text-sm leading-relaxed text-[#5c574f] sm:text-base">
          {description}
        </p>
        {onRetry && (
          <Button
            type="button"
            onClick={onRetry}
            className="h-11 rounded-none bg-[#f08400] px-6 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#d87200] sm:h-12"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
        )}
      </div>
    </div>
  );
}
