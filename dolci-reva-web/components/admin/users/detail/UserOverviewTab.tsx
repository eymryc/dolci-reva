"use client";

import { DetailSection, DetailField, DetailBool, formatDetailDate, formatDetailMoney } from "./detail-ui";
import { cn } from "@/lib/utils";
import type { User as UserType } from "@/types/entities/user.types";

interface UserOverviewTabProps {
  user: UserType;
}

const TYPE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  OWNER: "Propriétaire",
  CUSTOMER: "Client",
};

export function UserOverviewTab({ user }: UserOverviewTabProps) {
  const emailVerified = Boolean(user.email_verified_at || user.email_verified);
  const docs = user.verifications || [];
  const identityDoc = docs.find((d) => d.document_type === "IDENTITY");

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <div className="space-y-4 xl:col-span-8">
        <DetailSection title="Identité" description="Informations personnelles">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            <DetailField label="Prénom">{user.first_name || "—"}</DetailField>
            <DetailField label="Nom">{user.last_name || "—"}</DetailField>
            <DetailField label="Email">
              <span className="break-all">{user.email || "—"}</span>
            </DetailField>
            <DetailField label="Téléphone">{user.phone || "—"}</DetailField>
            <DetailField label="Date de naissance">{formatDetailDate(user.date_of_birth)}</DetailField>
            <DetailField label="N° pièce (profil)">{user.id_document_number || "—"}</DetailField>
          </dl>
        </DetailSection>

        <DetailSection title="Adresse" description="Coordonnées postales">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            <DetailField label="Adresse ligne 1">{user.address_line1 || "—"}</DetailField>
            <DetailField label="Adresse ligne 2">{user.address_line2 || "—"}</DetailField>
            <DetailField label="Code postal">{user.postal_code || "—"}</DetailField>
            <DetailField label="Type de compte">{TYPE_LABELS[user.type] || user.type || "—"}</DetailField>
          </dl>
        </DetailSection>

        <DetailSection
          title="Types de business"
          description={`${user.businessTypes?.length || 0} service(s)`}
        >
          {user.businessTypes && user.businessTypes.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {user.businessTypes.map((bt) => (
                <span
                  key={bt.id}
                  className="border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                >
                  {bt.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Aucun type associé.</p>
          )}
        </DetailSection>
      </div>

      <div className="space-y-4 xl:col-span-4">
        <DetailSection title="Confiance">
          <ul className="divide-y divide-slate-100">
            <li className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium text-slate-800">Email</p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {emailVerified ? `Confirmé le ${formatDetailDate(user.email_verified_at)}` : "Non confirmé"}
                </p>
              </div>
              <DetailBool value={emailVerified} yes="OK" no="Non" />
            </li>
            <li className="flex items-start justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800">Pièce d&apos;identité</p>
                <p className="mt-0.5 truncate text-[11px] text-slate-400">
                  {identityDoc
                    ? `${identityDoc.identity_document_type || "Document"} · ${identityDoc.document_number || "—"}`
                    : "Aucun document"}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 text-sm font-medium",
                  identityDoc?.status === "APPROVED"
                    ? "text-emerald-700"
                    : identityDoc?.status === "REJECTED"
                      ? "text-red-600"
                      : identityDoc
                        ? "text-amber-700"
                        : "text-slate-400"
                )}
              >
                {identityDoc?.status === "APPROVED"
                  ? "OK"
                  : identityDoc?.status === "REJECTED"
                    ? "Rejetée"
                    : identityDoc
                      ? "Attente"
                      : "—"}
              </span>
            </li>
            <li className="flex items-start justify-between gap-3 py-3 last:pb-0">
              <p className="text-sm font-medium text-slate-800">Téléphone</p>
              <DetailBool value={user.phone_verified} yes="OK" no="Non" />
            </li>
          </ul>
        </DetailSection>

        <DetailSection title="Wallet">
          <p className="text-2xl font-semibold tracking-tight text-slate-900">
            {formatDetailMoney(user.wallet?.balance)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            {user.wallet?.id != null ? `Wallet #${user.wallet.id}` : "Aucun wallet"}
          </p>
        </DetailSection>

        <DetailSection title="Système">
          <dl className="space-y-4">
            <DetailField label="Créé le">{formatDetailDate(user.created_at)}</DetailField>
            <DetailField label="Mis à jour">{formatDetailDate(user.updated_at)}</DetailField>
            <DetailField label="Rôle">{user.role || "—"}</DetailField>
            <DetailField label="Permissions">{(user.permissions || []).length}</DetailField>
          </dl>
        </DetailSection>
      </div>
    </div>
  );
}
