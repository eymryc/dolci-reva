"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Loader2,
  XCircle,
  Check,
  X,
  CheckCircle2,
  Pause,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUser, userKeys } from "@/hooks/use-users";
import { usePermissions } from "@/hooks/use-permissions";
import {
  useReviewDocument,
  useApproveOwner,
  useRejectOwner,
  useSuspendOwner,
} from "@/hooks/use-owner-verifications";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UserHeader } from "@/components/admin/users/detail/UserHeader";
import { UserOverviewTab } from "@/components/admin/users/detail/UserOverviewTab";
import { UserAccountTab } from "@/components/admin/users/detail/UserAccountTab";
import { UserPermissionsTab } from "@/components/admin/users/detail/UserPermissionsTab";
import { UserStatsTab } from "@/components/admin/users/detail/UserStatsTab";
import { UserVerificationsTab } from "@/components/admin/users/detail/UserVerificationsTab";
import type { User } from "@/types/entities/user.types";

function resolveIdentityVerificationId(user: User): number | null {
  const docs = user.verifications || [];
  const identity =
    docs.find((d) => d.document_type === "IDENTITY" && d.status === "PENDING") ||
    docs.find((d) => d.document_type === "IDENTITY") ||
    docs.find((d) => d.status === "PENDING") ||
    docs[0];
  return identity?.id ?? null;
}

const tabTriggerClass = cn(
  "rounded-none border-b-2 border-transparent bg-transparent px-3 py-2.5 text-xs font-medium text-slate-500 shadow-none",
  "hover:text-slate-800",
  "data-[state=active]:border-[#f08400] data-[state=active]:bg-transparent data-[state=active]:text-slate-900 data-[state=active]:shadow-none"
);

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const { user: currentUser, refreshUser } = useAuth();
  const {
    canManageUsers,
    canReviewDocuments,
    canApproveOwner,
    canRejectOwner,
    canSuspendOwner,
  } = usePermissions();
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useUser(id);

  const [reviewDocumentModal, setReviewDocumentModal] = useState<{
    open: boolean;
    documentId: number | null;
    status: "APPROVED" | "REJECTED" | null;
  }>({ open: false, documentId: null, status: null });
  const [reviewReason, setReviewReason] = useState("");
  const [approveModal, setApproveModal] = useState(false);
  const [approveNotes, setApproveNotes] = useState("");
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [suspendModal, setSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");

  const reviewMutation = useReviewDocument();
  const approveMutation = useApproveOwner();
  const rejectMutation = useRejectOwner();
  const suspendMutation = useSuspendOwner();

  const invalidateUserQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) }),
      queryClient.invalidateQueries({ queryKey: userKeys.all }),
      queryClient.invalidateQueries({ queryKey: ["owner-verifications"] }),
      queryClient.invalidateQueries({ queryKey: ["owner-verification", "status"] }),
      queryClient.invalidateQueries({ queryKey: ["owner-documents"] }),
    ]);
    await queryClient.refetchQueries({ queryKey: userKeys.detail(id) });
  };

  const handleReviewDocument = (documentId: number, status: "APPROVED" | "REJECTED") => {
    setReviewDocumentModal({ open: true, documentId, status });
    setReviewReason("");
  };

  const handleSubmitReview = () => {
    if (!reviewDocumentModal.documentId) return;
    if (reviewDocumentModal.status === "REJECTED" && !reviewReason.trim()) return;

    reviewMutation.mutate(
      {
        documentId: reviewDocumentModal.documentId,
        data: {
          status: reviewDocumentModal.status!,
          reason: reviewDocumentModal.status === "REJECTED" ? reviewReason : undefined,
        },
      },
      {
        onSuccess: () => {
          setReviewDocumentModal({ open: false, documentId: null, status: null });
          setReviewReason("");
          invalidateUserQueries();
          queryClient.invalidateQueries({ queryKey: ["owner-documents"] });
        },
      }
    );
  };

  const handleApproveOwner = () => {
    if (!user || !("first_name" in user)) return;
    const verificationId = resolveIdentityVerificationId(user);
    if (!verificationId) {
      toast.error("Aucun document de vérification à approuver.");
      return;
    }

    approveMutation.mutate(
      {
        verificationId,
        data: { admin_notes: approveNotes || undefined },
      },
      {
        onSuccess: () => {
          setApproveModal(false);
          setApproveNotes("");
          invalidateUserQueries();
          if (currentUser && currentUser.id === id) {
            refreshUser();
          }
        },
      }
    );
  };

  const handleRejectOwner = () => {
    if (!rejectReason.trim() || !user || !("first_name" in user)) return;
    const verificationId = resolveIdentityVerificationId(user);
    if (!verificationId) {
      toast.error("Aucun document de vérification à rejeter.");
      return;
    }

    rejectMutation.mutate(
      {
        verificationId,
        data: { reason: rejectReason },
      },
      {
        onSuccess: () => {
          setRejectModal(false);
          setRejectReason("");
          invalidateUserQueries();
        },
      }
    );
  };

  const handleSuspendOwner = () => {
    if (!suspendReason.trim() || !user || !("first_name" in user)) return;
    const verificationId = resolveIdentityVerificationId(user);
    if (!verificationId) {
      toast.error("Aucun document de vérification à suspendre.");
      return;
    }

    suspendMutation.mutate(
      {
        verificationId,
        data: { reason: suspendReason },
      },
      {
        onSuccess: () => {
          setSuspendModal(false);
          setSuspendReason("");
          invalidateUserQueries();
        },
      }
    );
  };

  if (!canManageUsers()) {
    return (
      <div className="border border-slate-200 bg-white p-10 text-center">
        <XCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
        <h2 className="text-lg font-semibold text-slate-900">Accès refusé</h2>
        <p className="mt-1 text-sm text-slate-500">
          Vous n&apos;avez pas les permissions nécessaires.
        </p>
        <Button
          onClick={() => router.push("/admin/users")}
          className="mt-6 rounded-none bg-[#f08400] text-white hover:bg-[#d87200]"
        >
          Retour à la liste
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-[#f08400]" />
          <p className="text-sm text-slate-500">Chargement du dossier…</p>
        </div>
      </div>
    );
  }

  if (error || !user || !("first_name" in user)) {
    return (
      <div className="border border-slate-200 bg-white p-10 text-center">
        <XCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
        <h2 className="text-lg font-semibold text-slate-900">Erreur</h2>
        <p className="mt-1 text-sm text-slate-500">
          Impossible de charger les détails de l&apos;utilisateur.
        </p>
        <Button
          onClick={() => router.push("/admin/users")}
          className="mt-6 rounded-none bg-[#f08400] text-white hover:bg-[#d87200]"
        >
          Retour à la liste
        </Button>
      </div>
    );
  }

  const showVerifications =
    user.type === "OWNER" || (user.verifications && user.verifications.length > 0);

  return (
    <div className="space-y-6 pb-8 animate-in fade-in-50 duration-500">
      <UserHeader user={user} />

      <Tabs defaultValue="overview" className="space-y-5">
        <TabsList className="h-auto w-full justify-start gap-0 rounded-none border-b border-slate-200 bg-transparent p-0">
          <TabsTrigger value="overview" className={tabTriggerClass}>
            Vue d&apos;ensemble
          </TabsTrigger>
          <TabsTrigger value="account" className={tabTriggerClass}>
            Compte
          </TabsTrigger>
          <TabsTrigger value="permissions" className={tabTriggerClass}>
            Permissions
          </TabsTrigger>
          <TabsTrigger value="stats" className={tabTriggerClass}>
            Statistiques
          </TabsTrigger>
          {showVerifications ? (
            <TabsTrigger value="verifications" className={tabTriggerClass}>
              Vérifications
              {user.verifications?.length ? (
                <span className="ml-1.5 text-[10px] text-slate-400">{user.verifications.length}</span>
              ) : null}
            </TabsTrigger>
          ) : null}
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <UserOverviewTab user={user} />
        </TabsContent>

        <TabsContent value="account" className="mt-0">
          <UserAccountTab user={user} />
        </TabsContent>

        <TabsContent value="permissions" className="mt-0">
          <UserPermissionsTab user={user} />
        </TabsContent>

        <TabsContent value="stats" className="mt-0">
          <UserStatsTab user={user} />
        </TabsContent>

        {showVerifications ? (
          <TabsContent value="verifications" className="mt-0">
            <UserVerificationsTab
              user={user}
              canReviewDocuments={canReviewDocuments()}
              canApproveOwner={canApproveOwner()}
              canRejectOwner={canRejectOwner()}
              canSuspendOwner={canSuspendOwner()}
              reviewPending={reviewMutation.isPending}
              approvePending={approveMutation.isPending}
              rejectPending={rejectMutation.isPending}
              suspendPending={suspendMutation.isPending}
              onReviewDocument={handleReviewDocument}
              onApproveOwner={() => setApproveModal(true)}
              onRejectOwner={() => setRejectModal(true)}
              onSuspendOwner={() => setSuspendModal(true)}
            />
          </TabsContent>
        ) : null}
      </Tabs>

      <Dialog
        open={reviewDocumentModal.open}
        onOpenChange={(open) =>
          !open && setReviewDocumentModal({ open: false, documentId: null, status: null })
        }
      >
        <DialogContent className="rounded-none border-slate-200 sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold tracking-tight">
              {reviewDocumentModal.status === "APPROVED"
                ? "Approuver le document"
                : "Rejeter le document"}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              {reviewDocumentModal.status === "APPROVED"
                ? "Le document sera marqué comme approuvé."
                : "Indiquez la raison du rejet."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {reviewDocumentModal.status === "REJECTED" ? (
              <div className="space-y-2">
                <Label htmlFor="review-reason">Raison du rejet *</Label>
                <Textarea
                  id="review-reason"
                  placeholder="Raison du rejet…"
                  value={reviewReason}
                  onChange={(e) => setReviewReason(e.target.value)}
                  rows={4}
                  className="resize-none rounded-none"
                />
              </div>
            ) : (
              <div className="border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
                Le statut du document sera mis à jour immédiatement.
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-none"
              onClick={() =>
                setReviewDocumentModal({ open: false, documentId: null, status: null })
              }
              disabled={reviewMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={
                reviewMutation.isPending ||
                (reviewDocumentModal.status === "REJECTED" && !reviewReason.trim())
              }
              className={cn(
                "rounded-none text-white",
                reviewDocumentModal.status === "APPROVED"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-red-600 hover:bg-red-700"
              )}
            >
              {reviewMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement…
                </>
              ) : reviewDocumentModal.status === "APPROVED" ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Approuver
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Rejeter
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={approveModal} onOpenChange={setApproveModal}>
        <DialogContent className="rounded-none border-slate-200 sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold tracking-tight">
              Approuver le propriétaire
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Notes d&apos;administration optionnelles.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="approve-notes">Notes</Label>
              <Textarea
                id="approve-notes"
                placeholder="Notes d'administration…"
                value={approveNotes}
                onChange={(e) => setApproveNotes(e.target.value)}
                rows={4}
                className="resize-none rounded-none"
              />
            </div>
            <div className="border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
              Le propriétaire pourra utiliser les fonctionnalités réservées.
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-none"
              onClick={() => setApproveModal(false)}
              disabled={approveMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              onClick={handleApproveOwner}
              disabled={approveMutation.isPending}
              className="rounded-none bg-[#f08400] text-white hover:bg-[#d87200]"
            >
              {approveMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement…
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approuver
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectModal} onOpenChange={setRejectModal}>
        <DialogContent className="rounded-none border-slate-200 sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold tracking-tight">
              Rejeter le propriétaire
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Une raison est obligatoire.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Raison *</Label>
              <Textarea
                id="reject-reason"
                placeholder="Raison du rejet…"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="resize-none rounded-none"
              />
            </div>
            <div className="flex items-start gap-2 border border-red-200 bg-red-50/50 px-3 py-3 text-sm text-red-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              Le propriétaire perdra l&apos;accès aux fonctionnalités réservées.
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-none"
              onClick={() => setRejectModal(false)}
              disabled={rejectMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              onClick={handleRejectOwner}
              disabled={rejectMutation.isPending || !rejectReason.trim()}
              className="rounded-none bg-red-600 text-white hover:bg-red-700"
            >
              {rejectMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement…
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Rejeter
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={suspendModal} onOpenChange={setSuspendModal}>
        <DialogContent className="rounded-none border-slate-200 sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold tracking-tight">
              Suspendre le propriétaire
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Une raison est obligatoire.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="suspend-reason">Raison *</Label>
              <Textarea
                id="suspend-reason"
                placeholder="Raison de la suspension…"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                rows={4}
                className="resize-none rounded-none"
              />
            </div>
            <div className="flex items-start gap-2 border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              Suspension temporaire — le compte pourra être réactivé.
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-none"
              onClick={() => setSuspendModal(false)}
              disabled={suspendMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSuspendOwner}
              disabled={suspendMutation.isPending || !suspendReason.trim()}
              variant="outline"
              className="rounded-none border-slate-200"
            >
              {suspendMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement…
                </>
              ) : (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Suspendre
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
