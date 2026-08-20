"use client";

import { Check } from "lucide-react";
import { DetailSection } from "./detail-ui";
import type { User } from "@/types/entities/user.types";

interface UserPermissionsTabProps {
  user: User;
}

export function UserPermissionsTab({ user }: UserPermissionsTabProps) {
  const permissions = user.permissions || [];

  if (permissions.length === 0) {
    return (
      <DetailSection title="Permissions">
        <p className="text-sm text-slate-400">Aucune permission assignée.</p>
      </DetailSection>
    );
  }

  return (
    <DetailSection title="Permissions" description={`${permissions.length} accordée(s)`}>
      <ul className="grid max-h-[560px] grid-cols-1 gap-px overflow-y-auto border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
        {permissions.map((permission) => (
          <li
            key={permission}
            className="flex items-center gap-2 bg-white px-3 py-2.5 text-xs text-slate-700"
          >
            <Check className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="font-medium">{permission}</span>
          </li>
        ))}
      </ul>
    </DetailSection>
  );
}
