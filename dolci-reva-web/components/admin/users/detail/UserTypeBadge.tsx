/**
 * Chip discret pour le type d'utilisateur
 */

import { cn } from "@/lib/utils";

interface UserTypeBadgeProps {
  type: string;
}

const TYPE_MAP: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  OWNER: "Propriétaire",
  CUSTOMER: "Client",
};

export function UserTypeBadge({ type }: UserTypeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border border-slate-200 bg-slate-50 px-2 py-0.5",
        "text-[11px] font-medium text-slate-600"
      )}
    >
      {TYPE_MAP[type] || type}
    </span>
  );
}
