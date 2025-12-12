/**
 * Composant pour afficher le badge de type d'utilisateur
 */

import { Badge } from "@/components/ui/badge";

interface UserTypeBadgeProps {
  type: string;
}

export function UserTypeBadge({ type }: UserTypeBadgeProps) {
  const typeMap: Record<string, { label: string; color: string; bg: string }> = {
    SUPER_ADMIN: { label: "Super Admin", color: "text-red-700", bg: "bg-red-100 border-red-200" },
    ADMIN: { label: "Admin", color: "text-purple-700", bg: "bg-purple-100 border-purple-200" },
    OWNER: { label: "Propriétaire", color: "text-blue-700", bg: "bg-blue-100 border-blue-200" },
    CUSTOMER: { label: "Client", color: "text-green-700", bg: "bg-green-100 border-green-200" },
  };

  const typeInfo = typeMap[type] || { 
    label: type, 
    color: "text-gray-700", 
    bg: "bg-gray-100 border-gray-200" 
  };

  return (
    <Badge className={`${typeInfo.bg} ${typeInfo.color} border px-3 py-1`}>
      {typeInfo.label}
    </Badge>
  );
}






