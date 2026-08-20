"use client";

import { Check, type LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";

function toPascalCase(kebab: string): string {
  return kebab
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/**
 * Résout un nom lucide kebab-case (ex: "shield-check") vers le composant.
 * Fallback Check si l'icône n'existe pas.
 */
export function LucideIconByName({
  name,
  className,
}: {
  name?: string | null;
  className?: string;
}) {
  let Icon: LucideIcon = Check;

  if (name) {
    const resolved = (LucideIcons as Record<string, unknown>)[toPascalCase(name)];
    if (typeof resolved === "function" || (resolved && typeof resolved === "object")) {
      Icon = resolved as LucideIcon;
    }
  }

  return <Icon className={className} aria-hidden />;
}
