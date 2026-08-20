"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Conteneur atmosphère espace hôte — calme, éditorial, premium */
export function HostShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative min-h-[calc(100vh-8rem)] animate-in fade-in-50 duration-700",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-10 h-72 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,_rgba(240,132,0,0.07),_transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200/80 to-transparent"
      />
      <div className="relative space-y-9 pb-12">{children}</div>
    </div>
  );
}
