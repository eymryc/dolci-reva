"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { backofficePath, hostPath, adminPath } from "@/lib/host-paths";

/** Vue espace hôte (propriétaire pur) vs console admin */
export function useIsHostView() {
  const { isOwner, isAnyAdmin } = usePermissions();
  return isOwner() && !isAnyAdmin();
}

/** Chemin back-office adapté au rôle (hôte → /proprietaire, sinon /admin) */
export function useBackofficePath() {
  const isHostView = useIsHostView();
  return (path: string) => backofficePath(path, { isHostView });
}

export { hostPath, adminPath, backofficePath };

export function formatHostPrice(price: string | number | null | undefined) {
  if (price == null || price === "") return null;
  const n = Number(price);
  if (Number.isNaN(n)) return String(price);
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(n);
}
