"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Loader2,
  ShieldOff,
  AlertCircle,
} from "lucide-react";
import {
  useOwnerVerifications,
  usePendingVerifications,
  useOwnerVerification,
  useReviewDocument,
  useApproveOwner,
  useRejectOwner,
  useSuspendOwner,
  type OwnerVerification,
  type ReviewDocumentData,
  type ApproveOwnerData,
  type RejectOwnerData,
  type SuspendOwnerData,
} from "@/hooks/use-owner-verifications";
import { usePermissions } from "@/hooks/use-permissions";
import { VerificationTable } from "@/components/admin/owner-verifications/VerificationTable";
import { OwnerVerificationDetail } from "@/components/admin/owner-verifications/OwnerVerificationDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function OwnerVerificationsPage() {
  const router = useRouter();
  const { isAnyAdmin } = usePermissions();
  const [selectedVerification, setSelectedVerification] = useState<OwnerVerification | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");

  // Verifications - TanStack Query
  const {
    data: verifications = [],
    isLoading: isLoadingVerifications,
    refetch: refetchVerifications,
    isRefetching: isRefetchingVerifications,
  } = useOwnerVerifications();

  const {
    data: pendingVerifications = [],
    isLoading: isLoadingPending,
    refetch: refetchPending,
    isRefetching: isRefetchingPending,
  } = usePendingVerifications();

  const {
    data: verificationDetail,
    isLoading: isLoadingDetail,
    refetch: refetchDetail,
  } = useOwnerVerification(selectedVerification?.id || 0);

  const reviewMutation = useReviewDocument();
  const approveMutation = useApproveOwner();
  const rejectMutation = useRejectOwner();
  const suspendMutation = useSuspendOwner();

  // Handlers
  const handleView = (verification: OwnerVerification) => {
    setSelectedVerification(verification);
    setViewMode("detail");
    refetchDetail();
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedVerification(null);
  };

  const handleReviewDocument = (documentId: number, data: ReviewDocumentData) => {
    reviewMutation.mutate(
      { documentId, data },
      {
        onSuccess: () => {
          refetchDetail();
          refetchVerifications();
          refetchPending();
        },
      }
    );
  };

  const handleApproveOwner = (ownerId: number, data: ApproveOwnerData) => {
    approveMutation.mutate(
      { ownerId, data },
      {
        onSuccess: () => {
          refetchDetail();
          refetchVerifications();
          refetchPending();
          handleBackToList();
        },
      }
    );
  };

  const handleRejectOwner = (ownerId: number, data: RejectOwnerData) => {
    rejectMutation.mutate(
      { ownerId, data },
      {
        onSuccess: () => {
          refetchDetail();
          refetchVerifications();
          refetchPending();
          handleBackToList();
        },
      }
    );
  };

  const handleSuspendOwner = (ownerId: number, data: SuspendOwnerData) => {
    suspendMutation.mutate(
      { ownerId, data },
      {
        onSuccess: () => {
          refetchDetail();
          refetchVerifications();
          refetchPending();
          handleBackToList();
        },
      }
    );
  };

  // Si l'utilisateur n'a pas les permissions, afficher un message
  if (!isAnyAdmin()) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-500 rounded-xl shadow-lg">
                <ShieldOff className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-[#101828]">
                Accès refusé
              </h1>
            </div>
            <p className="text-gray-500 text-sm ml-14">
              Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
            </p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-gray-200/50 text-center">
          <ShieldOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Accès restreint
          </h2>
          <p className="text-gray-600 mb-6">
            Seuls les administrateurs peuvent gérer les vérifications des propriétaires.
          </p>
          <Button
            onClick={() => router.push("/admin/dashboard")}
            className="bg-[#f08400] hover:bg-[#d87200] text-white"
          >
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  // Si on est en mode détail
  if (viewMode === "detail" && verificationDetail) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#f08400] rounded-xl shadow-lg">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-[#101828]">
                Vérification des Propriétaires
              </h1>
            </div>
            <p className="text-gray-500 text-sm ml-14">
              Détails de la vérification du propriétaire
            </p>
          </div>
          <Button
            onClick={handleBackToList}
            variant="outline"
            className="h-12"
          >
            Retour à la liste
          </Button>
        </div>

        {/* Detail Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#f08400]" />
            </div>
          ) : (
            <OwnerVerificationDetail
              verification={verificationDetail}
              onReviewDocument={handleReviewDocument}
              onApproveOwner={handleApproveOwner}
              onRejectOwner={handleRejectOwner}
              onSuspendOwner={handleSuspendOwner}
              isLoading={
                reviewMutation.isPending ||
                approveMutation.isPending ||
                rejectMutation.isPending ||
                suspendMutation.isPending
              }
            />
          )}
        </div>
      </div>
    );
  }

  // Mode liste
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#f08400] rounded-xl shadow-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-[#101828]">
              Vérification des Propriétaires
            </h1>
          </div>
          <p className="text-gray-500 text-sm ml-14">
            Gérez les vérifications et certifications des propriétaires
          </p>
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Toutes les vérifications
              {verifications.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 rounded-full">
                  {verifications.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              En attente
              {pendingVerifications.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-200 rounded-full">
                  {pendingVerifications.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            {isLoadingVerifications ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#f08400]" />
              </div>
            ) : (
              <VerificationTable
                data={verifications}
                onView={handleView}
                isLoading={isLoadingVerifications}
                onRefresh={() => refetchVerifications()}
                isRefreshing={isRefetchingVerifications}
              />
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-0">
            {isLoadingPending ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#f08400]" />
              </div>
            ) : (
              <VerificationTable
                data={pendingVerifications}
                onView={handleView}
                isLoading={isLoadingPending}
                onRefresh={() => refetchPending()}
                isRefreshing={isRefetchingPending}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

