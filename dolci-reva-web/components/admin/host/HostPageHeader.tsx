"use client";

import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HostPageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
  actionTitle?: string;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
  className?: string;
  count?: number;
  /** Libellé du compteur (défaut : lieu / lieux) */
  countLabel?: { singular: string; plural: string };
}

export function HostPageHeader({
  title,
  description,
  eyebrow,
  actionLabel,
  onAction,
  actionDisabled,
  actionTitle,
  search,
  onSearchChange,
  searchPlaceholder = "Rechercher…",
  children,
  className,
  count,
  countLabel = { singular: "lieu", plural: "lieux" },
}: HostPageHeaderProps) {
  const countText =
    count != null
      ? `${count} ${count > 1 ? countLabel.plural : countLabel.singular}`
      : null;

  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 max-w-2xl">
          {(eyebrow || countText) && (
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f08400]">
              {[eyebrow, countText].filter(Boolean).join(" · ")}
            </p>
          )}
          <h1 className="text-[1.65rem] font-semibold leading-[1.15] tracking-tight text-slate-900 sm:text-[1.85rem]">
            {title}
          </h1>
          {description ? (
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-500">
              {description}
            </p>
          ) : null}
        </div>
        {actionLabel && onAction ? (
          <Button
            onClick={onAction}
            disabled={actionDisabled}
            title={actionTitle}
            className="h-10 shrink-0 rounded-none bg-[#f08400] px-5 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-[#d87200] disabled:opacity-50"
          >
            {actionLabel}
          </Button>
        ) : null}
      </div>

      {onSearchChange ? (
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 rounded-none border-slate-200 bg-white pl-9 text-sm shadow-none placeholder:text-slate-400 focus-visible:border-slate-300 focus-visible:ring-[#f08400]/20"
          />
        </div>
      ) : null}

      {children}
    </div>
  );
}
