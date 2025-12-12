/**
 * Composant pour afficher le badge de statut d'utilisateur
 */

import { Badge } from "@/components/ui/badge";

interface UserStatusBadgeProps {
  status?: string | null;
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  if (!status) return null;

  const statusMap: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: "En attente", color: "text-yellow-700", bg: "bg-yellow-100 border-yellow-200" },
    SUBMITTED: { label: "Soumis", color: "text-blue-700", bg: "bg-blue-100 border-blue-200" },
    UNDER_REVIEW: { label: "En révision", color: "text-purple-700", bg: "bg-purple-100 border-purple-200" },
    APPROVED: { label: "Approuvé", color: "text-green-700", bg: "bg-green-100 border-green-200" },
    VERIFIED: { label: "Vérifié", color: "text-green-700", bg: "bg-green-100 border-green-200" },
    REJECTED: { label: "Rejeté", color: "text-red-700", bg: "bg-red-100 border-red-200" },
    SUSPENDED: { label: "Suspendu", color: "text-gray-700", bg: "bg-gray-100 border-gray-200" },
  };

  const statusInfo = statusMap[status] || { 
    label: status, 
    color: "text-gray-700", 
    bg: "bg-gray-100 border-gray-200" 
  };

  return (
    <Badge className={`${statusInfo.bg} ${statusInfo.color} border px-3 py-1`}>
      {statusInfo.label}
    </Badge>
  );
}






