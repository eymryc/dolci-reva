"use client";

import { DetailSection, DetailField, DetailBool } from "./detail-ui";
import { UserTypeBadge } from "./UserTypeBadge";
import { UserStatusBadge } from "./UserStatusBadge";
import type { User } from "@/types/entities/user.types";

interface UserAccountTabProps {
  user: User;
}

export function UserAccountTab({ user }: UserAccountTabProps) {
  return (
    <DetailSection title="Compte" description="Statuts et flags du compte">
      <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        <DetailField label="Type">
          <UserTypeBadge type={user.type} />
        </DetailField>
        <DetailField label="Rôle">{user.role || "—"}</DetailField>
        <DetailField label="Statut de vérification">
          <UserStatusBadge status={user.verification_status} />
        </DetailField>
        <DetailField label="Niveau de vérification">{user.verification_level || "—"}</DetailField>
        <DetailField label="Téléphone vérifié">
          <DetailBool value={user.phone_verified} />
        </DetailField>
        <DetailField label="Compte vérifié">
          <DetailBool value={user.is_verified} />
        </DetailField>
        <DetailField label="Premium">
          <DetailBool value={user.is_premium} />
        </DetailField>
      </dl>
    </DetailSection>
  );
}
