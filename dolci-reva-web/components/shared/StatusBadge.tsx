/**
 * Composant générique pour afficher un badge de statut
 * Utilisable dans toute l'application pour uniformiser l'affichage des statuts
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface StatusConfig {
  label: string;
  color: string;
  bg: string;
  border?: string;
}

export interface StatusBadgeProps {
  status: string | null | undefined;
  statusMap: Record<string, StatusConfig>;
  className?: string;
}

/**
 * Composant générique de badge de statut
 * 
 * @example
 * ```tsx
 * const statusMap = {
 *   ACTIVE: { label: "Actif", color: "text-green-700", bg: "bg-green-100" },
 *   INACTIVE: { label: "Inactif", color: "text-gray-700", bg: "bg-gray-100" },
 * };
 * 
 * <StatusBadge status={user.status} statusMap={statusMap} />
 * ```
 */
export function StatusBadge({ status, statusMap, className }: StatusBadgeProps) {
  if (!status) return null;

  const statusInfo = statusMap[status] || {
    label: status,
    color: "text-gray-700",
    bg: "bg-gray-100",
    border: "border-gray-200",
  };

  return (
    <Badge
      className={cn(
        statusInfo.bg,
        statusInfo.color,
        statusInfo.border || "border-gray-200",
        "border px-3 py-1",
        className
      )}
    >
      {statusInfo.label}
    </Badge>
  );
}






