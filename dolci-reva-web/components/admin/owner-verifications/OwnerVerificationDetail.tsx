"use client";

import React, { useState } from "react";
import {
  OwnerVerificationStatus,
  OwnerVerificationDocument,
  DocumentType,
  DocumentStatus,
  ReviewDocumentData,
  ApproveOwnerData,
  RejectOwnerData,
  SuspendOwnerData,
} from "@/hooks/use-owner-verifications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ShieldCheck,
  ShieldOff,
  FileText,
  Eye,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  Award,
  Ban,
  Check,
  X,
} from "lucide-react";
import { VerificationModal } from "./VerificationModal";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface OwnerVerificationDetailProps {
  verification: OwnerVerificationStatus;
  onReviewDocument: (documentId: number, data: ReviewDocumentData) => void;
  onApproveOwner: (verificationId: number, data: ApproveOwnerData) => void;
  onRejectOwner: (verificationId: number, data: RejectOwnerData) => void;
  onSuspendOwner: (verificationId: number, data: SuspendOwnerData) => void;
  isLoading?: boolean;
}

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
    PENDING: { label: "En attente", className: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
    SUBMITTED: { label: "Soumis", className: "bg-blue-100 text-blue-800 border-blue-200", icon: Clock },
    UNDER_REVIEW: { label: "En révision", className: "bg-purple-100 text-purple-800 border-purple-200", icon: AlertCircle },
    APPROVED: { label: "Approuvé", className: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2 },
    REJECTED: { label: "Rejeté", className: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
    SUSPENDED: { label: "Suspendu", className: "bg-gray-100 text-gray-800 border-gray-200", icon: ShieldOff },
  };

  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <Badge className={`${config.className} border flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
};

const getLevelBadge = (level: string | null) => {
  if (!level) return <span className="text-gray-500 text-xs">Non certifié</span>;

  const levelConfig: Record<string, { label: string; className: string }> = {
    BRONZE: { label: "🥉 Bronze", className: "bg-amber-100 text-amber-800 border-amber-200" },
    SILVER: { label: "🥈 Argent", className: "bg-gray-100 text-gray-800 border-gray-200" },
    GOLD: { label: "🥇 Or", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    PREMIUM: { label: "💎 Premium", className: "bg-purple-100 text-purple-800 border-purple-200" },
  };

  const config = levelConfig[level] || levelConfig.BRONZE;

  return (
    <Badge className={`${config.className} border`}>
      {config.label}
    </Badge>
  );
};

const getDocumentTypeLabel = (type: DocumentType): string => {
  const labels: Record<DocumentType, string> = {
    IDENTITY: "Document d'identité",
    ADDRESS_PROOF: "Justificatif de domicile",
    PROPERTY_TITLE: "Titre de propriété",
    BANK_STATEMENT: "Relevé bancaire",
    INSURANCE: "Assurance",
  };
  return labels[type] || type;
};

const getDocumentStatusBadge = (status: DocumentStatus) => {
  const statusConfig: Record<DocumentStatus, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
    PENDING: { label: "En attente", className: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
    APPROVED: { label: "Approuvé", className: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2 },
    REJECTED: { label: "Rejeté", className: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge className={`${config.className} border flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
};

export function OwnerVerificationDetail({
  verification,
  onReviewDocument,
  onApproveOwner,
  onRejectOwner,
  onSuspendOwner,
  isLoading = false,
}: OwnerVerificationDetailProps) {
  const [selectedDocument, setSelectedDocument] = useState<OwnerVerificationDocument | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | "suspend" | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [actionReason, setActionReason] = useState("");

  const { verification: ownerVerification, documents } = verification;
  const user = ownerVerification.user;

  const handleReviewDocument = (document: OwnerVerificationDocument) => {
    setSelectedDocument(document);
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = (data: ReviewDocumentData) => {
    if (selectedDocument) {
      onReviewDocument(selectedDocument.id, data);
      setIsReviewModalOpen(false);
      setSelectedDocument(null);
    }
  };

  const handleOpenActionDialog = (type: "approve" | "reject" | "suspend") => {
    setActionType(type);
    setIsActionDialogOpen(true);
    setActionNotes("");
    setActionReason("");
  };

  const handleSubmitAction = () => {
    if (!actionType) return;

    const verificationId = ownerVerification.id;

    if (actionType === "approve") {
      onApproveOwner(verificationId, { admin_notes: actionNotes || undefined });
    } else if (actionType === "reject") {
      if (!actionReason.trim()) {
        alert("La raison du rejet est obligatoire");
        return;
      }
      onRejectOwner(verificationId, { reason: actionReason });
    } else if (actionType === "suspend") {
      if (!actionReason.trim()) {
        alert("La raison de la suspension est obligatoire");
        return;
      }
      onSuspendOwner(verificationId, { reason: actionReason });
    }

    setIsActionDialogOpen(false);
    setActionType(null);
    setActionNotes("");
    setActionReason("");
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Détails de la vérification</h2>
          <p className="text-sm text-gray-500 mt-1">
            Informations complètes du propriétaire et de ses documents
          </p>
        </div>
        <div className="flex gap-2">
          {ownerVerification.verification_status === "UNDER_REVIEW" && (
            <>
              <Button
                onClick={() => handleOpenActionDialog("approve")}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={isLoading}
              >
                <Check className="w-4 h-4 mr-2" />
                Approuver
              </Button>
              <Button
                onClick={() => handleOpenActionDialog("reject")}
                variant="destructive"
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Rejeter
              </Button>
            </>
          )}
          {ownerVerification.verification_status === "APPROVED" && (
            <Button
              onClick={() => handleOpenActionDialog("suspend")}
              variant="destructive"
              disabled={isLoading}
            >
              <Ban className="w-4 h-4 mr-2" />
              Suspendre
            </Button>
          )}
        </div>
      </div>

      {/* Owner Information */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Informations du propriétaire</h3>
            {user && (
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900">
                  {user.first_name} {user.last_name}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 items-end">
            {getStatusBadge(ownerVerification.verification_status)}
            {getLevelBadge(ownerVerification.verification_level)}
          </div>
        </div>

        {user && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{user.phone}</span>
              {ownerVerification.phone_verified ? (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Vérifié
                </Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                  <XCircle className="w-3 h-3 mr-1" />
                  Non vérifié
                </Badge>
              )}
            </div>
            {ownerVerification.address_line1 && (
              <div className="flex items-center gap-2 col-span-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {ownerVerification.address_line1}
                  {ownerVerification.address_line2 && `, ${ownerVerification.address_line2}`}
                  {ownerVerification.postal_code && `, ${ownerVerification.postal_code}`}
                </span>
              </div>
            )}
            {ownerVerification.date_of_birth && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Né(e) le {new Date(ownerVerification.date_of_birth).toLocaleDateString("fr-FR")}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">Score de réputation</span>
            </div>
            <div className={`text-2xl font-bold ${
              ownerVerification.reputation_score >= 80 ? "text-green-600" :
              ownerVerification.reputation_score >= 50 ? "text-yellow-600" : "text-red-600"
            }`}>
              {ownerVerification.reputation_score}/100
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Award className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-600">Réservations</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {ownerVerification.total_bookings}
            </div>
            {ownerVerification.cancelled_bookings > 0 && (
              <div className="text-xs text-red-600 mt-1">
                {ownerVerification.cancelled_bookings} annulées ({ownerVerification.cancellation_rate.toFixed(1)}%)
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Statut</span>
            </div>
            <div className="text-sm font-medium text-gray-900">
              {ownerVerification.is_premium ? "Premium" : "Standard"}
            </div>
            {ownerVerification.has_insurance && (
              <div className="text-xs text-green-600 mt-1">Assuré</div>
            )}
          </div>
        </div>

        {ownerVerification.admin_notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">Notes de l&apos;administrateur:</p>
            <p className="text-sm text-gray-600">{ownerVerification.admin_notes}</p>
          </div>
        )}
      </Card>

      {/* Documents */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents soumis</h3>
        {documents.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun document soumis</p>
        ) : (
          <div className="space-y-4">
            {documents.map((document) => (
              <div
                key={document.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <span className="font-medium text-gray-900">
                        {getDocumentTypeLabel(document.document_type)}
                      </span>
                      {getDocumentStatusBadge(document.status)}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {document.document_number && (
                        <p>Numéro: {document.document_number}</p>
                      )}
                      {document.issuing_authority && (
                        <p>Émis par: {document.issuing_authority}</p>
                      )}
                      {document.document_issue_date && (
                        <p>
                          Émis le: {new Date(document.document_issue_date).toLocaleDateString("fr-FR")}
                        </p>
                      )}
                      {document.document_expiry_date && (
                        <p>
                          Expire le: {new Date(document.document_expiry_date).toLocaleDateString("fr-FR")}
                        </p>
                      )}
                      {document.rejection_reason && (
                        <p className="text-red-600 font-medium">
                          Raison du rejet: {document.rejection_reason}
                        </p>
                      )}
                      {document.notes && (
                        <p className="text-gray-500 italic">Notes: {document.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {document.document_file_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(document.document_file_url!, "_blank")}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </Button>
                    )}
                    {document.status === "PENDING" && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleReviewDocument(document)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Réviser
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Review Modal */}
      <VerificationModal
        open={isReviewModalOpen}
        onOpenChange={setIsReviewModalOpen}
        onSubmit={handleSubmitReview}
        isLoading={isLoading}
        documentType={selectedDocument ? getDocumentTypeLabel(selectedDocument.document_type) : undefined}
      />

      {/* Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" && "Approuver le propriétaire"}
              {actionType === "reject" && "Rejeter le propriétaire"}
              {actionType === "suspend" && "Suspendre le propriétaire"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve" && "Confirmez l'approbation de ce propriétaire."}
              {actionType === "reject" && "Indiquez la raison du rejet."}
              {actionType === "suspend" && "Indiquez la raison de la suspension."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {(actionType === "reject" || actionType === "suspend") && (
              <div className="space-y-2">
                <Label htmlFor="reason">
                  Raison <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Expliquez la raison..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                placeholder="Ajoutez des notes supplémentaires..."
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsActionDialogOpen(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmitAction}
                disabled={isLoading}
                className={
                  actionType === "approve"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }
              >
                {isLoading ? "Enregistrement..." : "Confirmer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

