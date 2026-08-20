"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function CustomerPageHeader({
  eyebrow = "Compte",
  title,
  description,
  actions,
  className,
  dark,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  dark?: boolean;
}) {
  if (dark) {
    return (
      <header
        className={cn(
          "relative overflow-hidden bg-[#12100c] px-5 py-8 text-white sm:px-8 sm:py-10",
          className
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#f08400]/25 to-transparent"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#f08400]/80 to-transparent" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f08400]">
              {eyebrow}
            </p>
            <div className="mt-2 h-px w-14 bg-gradient-to-r from-[#f08400] to-transparent" />
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/65">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      </header>
    );
  }

  return (
    <header className={cn("mb-6", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#f08400]">
            {eyebrow}
          </p>
          <div className="mt-2 h-px w-14 bg-gradient-to-r from-[#f08400] to-transparent" />
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#12100c] sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#12100c]/60">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
