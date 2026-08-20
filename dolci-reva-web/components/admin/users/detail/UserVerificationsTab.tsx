"use client";

import {
  Check,
  X,
  Eye,
  Download,
  CheckCircle2,
  XCircle,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DetailSection, DetailField, formatDetailDate } from "./detail-ui";
import { UserStatusBadge } from "./UserStatusBadge";
import type { User, VerificationDocument } from "@/types/entities/user.types";

interface UserVerificationsTabProps {
  user: User;
  canReviewDocuments: boolean;
  canApproveOwner: boolean;
  canRejectOwner: boolean;
  canSuspendOwner: boolean;
  reviewPending: boolean;
  approvePending: boolean;
  rejectPending: boolean;
  suspendPending: boolean;
  onReviewDocument: (documentId: number, status: "APPROVED" | "REJECTED") => void;
  onApproveOwner: () => void;
  onRejectOwner: () => void;
  onSuspendOwner: () => void;
}

function DocumentRow({
  verification,
  canReview,
  reviewPending,
  onReview,
}: {
  verification: VerificationDocument;
  canReview: boolean;
  reviewPending: boolean;
  onReview: (documentId: number, status: "APPROVED" | "REJECTED") => void;
}) {
  const file = verification.document_file;

  return (
    <article className="border border-slate-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">
              {verification.document_type}
              {verification.identity_document_type ? (
                <span className="ml-1.5 font-normal text-slate-400">
                  ({verification.identity_document_type})
                </span>
              ) : null}
            </h3>
            <UserStatusBadge status={verification.status} />
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Document #{verification.id} · Créé le {formatDetailDate(verification.created_at)}
          </p>
        </div>

        {verification.status === "PENDING" && canReview ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => onReview(verification.id, "APPROVED")}
              disabled={reviewPending}
              className="h-8 rounded-none bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Approuver
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReview(verification.id, "REJECTED")}
              disabled={reviewPending}
              className="h-8 rounded-none border-red-200 text-red-700 hover:bg-red-50"
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              Rejeter
            </Button>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 p-4 sm:p-5 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <DetailField label="Numéro">{verification.document_number || "—"}</DetailField>
            {verification.issuing_authority ? (
              <DetailField label="Autorité">{verification.issuing_authority}</DetailField>
            ) : null}
            {verification.document_issue_date ? (
              <DetailField label="Émission">{formatDetailDate(verification.document_issue_date)}</DetailField>
            ) : null}
            {verification.document_expiry_date ? (
              <DetailField label="Expiration">{formatDetailDate(verification.document_expiry_date)}</DetailField>
            ) : null}
            {verification.reviewed_at ? (
              <DetailField label="Révisé le">{formatDetailDate(verification.reviewed_at)}</DetailField>
            ) : null}
            {verification.reviewed_by ? (
              <DetailField label="Révisé par">ID {verification.reviewed_by}</DetailField>
            ) : null}
          </dl>

          {verification.rejection_reason ? (
            <div className="border border-red-200 bg-red-50/40 px-3 py-3">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.06em] text-red-600">
                Raison de rejet
              </p>
              <p className="text-sm text-slate-800">{verification.rejection_reason}</p>
            </div>
          ) : null}

          {verification.notes ? (
            <div className="border border-slate-200 bg-slate-50/50 px-3 py-3">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.06em] text-slate-400">
                Notes
              </p>
              <p className="text-sm text-slate-800">{verification.notes}</p>
            </div>
          ) : null}
        </div>

        {file ? (
          <div className="border border-slate-200 bg-slate-50/40 p-4">
            <p className="truncate text-sm font-medium text-slate-900">{file.file_name}</p>
            <p className="mt-1 text-[11px] text-slate-400">
              {file.mime_type} · {(file.size / 1024).toFixed(1)} KB
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(file.url, "_blank")}
                className="h-8 flex-1 rounded-none border-slate-200"
              >
                <Eye className="mr-1.5 h-3.5 w-3.5" />
                Voir
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = file.url;
                  link.download = file.file_name;
                  link.click();
                }}
                className="h-8 flex-1 rounded-none border-slate-200"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Télécharger
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function UserVerificationsTab({
  user,
  canReviewDocuments,
  canApproveOwner,
  canRejectOwner,
  canSuspendOwner,
  reviewPending,
  approvePending,
  rejectPending,
  suspendPending,
  onReviewDocument,
  onApproveOwner,
  onRejectOwner,
  onSuspendOwner,
}: UserVerificationsTabProps) {
  const docs = user.verifications || [];
  const showOwnerActions =
    user.type === "OWNER" && (canApproveOwner || canRejectOwner || canSuspendOwner);

  if (docs.length === 0) {
    return (
      <DetailSection title="Vérifications">
        <p className="text-sm text-slate-400">Aucune vérification soumise.</p>
        {showOwnerActions ? (
          <OwnerActions
            user={user}
            canApproveOwner={canApproveOwner}
            canRejectOwner={canRejectOwner}
            canSuspendOwner={canSuspendOwner}
            approvePending={approvePending}
            rejectPending={rejectPending}
            suspendPending={suspendPending}
            onApproveOwner={onApproveOwner}
            onRejectOwner={onRejectOwner}
            onSuspendOwner={onSuspendOwner}
          />
        ) : null}
      </DetailSection>
    );
  }

  return (
    <div className="space-y-4">
      {docs.map((verification) => (
        <DocumentRow
          key={verification.id}
          verification={verification}
          canReview={canReviewDocuments}
          reviewPending={reviewPending}
          onReview={onReviewDocument}
        />
      ))}

      {showOwnerActions ? (
        <OwnerActions
          user={user}
          canApproveOwner={canApproveOwner}
          canRejectOwner={canRejectOwner}
          canSuspendOwner={canSuspendOwner}
          approvePending={approvePending}
          rejectPending={rejectPending}
          suspendPending={suspendPending}
          onApproveOwner={onApproveOwner}
          onRejectOwner={onRejectOwner}
          onSuspendOwner={onSuspendOwner}
        />
      ) : null}
    </div>
  );
}

function OwnerActions({
  user,
  canApproveOwner,
  canRejectOwner,
  canSuspendOwner,
  approvePending,
  rejectPending,
  suspendPending,
  onApproveOwner,
  onRejectOwner,
  onSuspendOwner,
}: {
  user: User;
  canApproveOwner: boolean;
  canRejectOwner: boolean;
  canSuspendOwner: boolean;
  approvePending: boolean;
  rejectPending: boolean;
  suspendPending: boolean;
  onApproveOwner: () => void;
  onRejectOwner: () => void;
  onSuspendOwner: () => void;
}) {
  return (
    <section className="border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3 sm:px-5">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900">
          Actions propriétaire
        </h2>
        <p className="mt-0.5 text-[11px] text-slate-400">
          Gérer le statut de vérification du compte
        </p>
      </div>
      <div className="flex flex-wrap gap-2 p-4 sm:p-5">
        {canApproveOwner && user.verification_status !== "APPROVED" ? (
          <Button
            onClick={onApproveOwner}
            disabled={approvePending}
            className="h-9 rounded-none bg-[#f08400] text-white hover:bg-[#d87200]"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Approuver
          </Button>
        ) : null}
        {canRejectOwner && user.verification_status !== "REJECTED" ? (
          <Button
            onClick={onRejectOwner}
            variant="outline"
            disabled={rejectPending}
            className="h-9 rounded-none border-red-200 text-red-700 hover:bg-red-50"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Rejeter
          </Button>
        ) : null}
        {canSuspendOwner && user.verification_status !== "SUSPENDED" ? (
          <Button
            onClick={onSuspendOwner}
            variant="outline"
            disabled={suspendPending}
            className="h-9 rounded-none border-slate-200 text-slate-700"
          >
            <Pause className="mr-2 h-4 w-4" />
            Suspendre
          </Button>
        ) : null}
      </div>
    </section>
  );
}
