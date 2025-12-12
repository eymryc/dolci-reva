"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Loader2,
  User,
  Shield,
  FileText,
  Activity,
  FileCheck,
  XCircle,
  CheckCircle2,
  Star,
  Award,
  Ban,
  Check,
  X,
  Eye,
  Download,
  AlertCircle,
  Pause,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/hooks/use-users";
import { usePermissions } from "@/hooks/use-permissions";
import { useReviewDocument, useApproveOwner, useRejectOwner, useSuspendOwner } from "@/hooks/use-owner-verifications";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { UserHeader } from "@/components/admin/users/detail/UserHeader";
import { UserOverviewTab } from "@/components/admin/users/detail/UserOverviewTab";

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
    canSuspendOwner 
  } = usePermissions();
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useUser(id);

  const getTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; color: string; bg: string }> = {
      SUPER_ADMIN: { label: "Super Admin", color: "text-red-700", bg: "bg-red-100 border-red-200" },
      ADMIN: { label: "Admin", color: "text-purple-700", bg: "bg-purple-100 border-purple-200" },
      OWNER: { label: "Propriétaire", color: "text-blue-700", bg: "bg-blue-100 border-blue-200" },
      CUSTOMER: { label: "Client", color: "text-green-700", bg: "bg-green-100 border-green-200" },
    };
    const typeInfo = typeMap[type] || { label: type, color: "text-gray-700", bg: "bg-gray-100 border-gray-200" };
    return (
      <Badge className={`${typeInfo.bg} ${typeInfo.color} border px-3 py-1`}>
        {typeInfo.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return null;
    const statusMap: Record<string, { label: string; color: string; bg: string }> = {
      PENDING: { label: "En attente", color: "text-yellow-700", bg: "bg-yellow-100 border-yellow-200" },
      SUBMITTED: { label: "Soumis", color: "text-blue-700", bg: "bg-blue-100 border-blue-200" },
      UNDER_REVIEW: { label: "En révision", color: "text-purple-700", bg: "bg-purple-100 border-purple-200" },
      APPROVED: { label: "Approuvé", color: "text-green-700", bg: "bg-green-100 border-green-200" },
      REJECTED: { label: "Rejeté", color: "text-red-700", bg: "bg-red-100 border-red-200" },
      SUSPENDED: { label: "Suspendu", color: "text-gray-700", bg: "bg-gray-100 border-gray-200" },
    };
    const statusInfo = statusMap[status] || { label: status, color: "text-gray-700", bg: "bg-gray-100 border-gray-200" };
    return (
      <Badge className={`${statusInfo.bg} ${statusInfo.color} border px-3 py-1`}>
        {statusInfo.label}
      </Badge>
    );
  };

  // States for modals
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

  // Mutations
  const reviewMutation = useReviewDocument();
  const approveMutation = useApproveOwner();
  const rejectMutation = useRejectOwner();
  const suspendMutation = useSuspendOwner();

  // Handlers
  const handleReviewDocument = (documentId: number, status: "APPROVED" | "REJECTED") => {
    setReviewDocumentModal({ open: true, documentId, status });
    setReviewReason("");
  };

  const handleSubmitReview = () => {
    if (!reviewDocumentModal.documentId) return;
    
    if (reviewDocumentModal.status === "REJECTED" && !reviewReason.trim()) {
      return;
    }

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
          queryClient.invalidateQueries({ queryKey: ["users", id] });
          queryClient.invalidateQueries({ queryKey: ["users"] });
          queryClient.invalidateQueries({ queryKey: ["owner-verifications"] });
          queryClient.invalidateQueries({ queryKey: ["owner-documents"] });
        },
      }
    );
  };

  const handleApproveOwner = () => {
    approveMutation.mutate(
      {
        ownerId: id,
        data: {
          admin_notes: approveNotes || undefined,
        },
      },
      {
        onSuccess: () => {
          setApproveModal(false);
          setApproveNotes("");
          queryClient.invalidateQueries({ queryKey: ["users", id] });
          queryClient.invalidateQueries({ queryKey: ["users"] });
          queryClient.invalidateQueries({ queryKey: ["owner-verifications"] });
          // Rafraîchir le contexte d'authentification si l'utilisateur connecté est le propriétaire approuvé
          if (currentUser && currentUser.id === id) {
            refreshUser();
          }
        },
      }
    );
  };

  const handleRejectOwner = () => {
    if (!rejectReason.trim()) return;

    rejectMutation.mutate(
      {
        ownerId: id,
        data: {
          reason: rejectReason,
        },
      },
      {
        onSuccess: () => {
          setRejectModal(false);
          setRejectReason("");
          queryClient.invalidateQueries({ queryKey: ["users", id] });
          queryClient.invalidateQueries({ queryKey: ["users"] });
          queryClient.invalidateQueries({ queryKey: ["owner-verifications"] });
        },
      }
    );
  };

  const handleSuspendOwner = () => {
    if (!suspendReason.trim()) return;

    suspendMutation.mutate(
      {
        ownerId: id,
        data: {
          reason: suspendReason,
        },
      },
      {
        onSuccess: () => {
          setSuspendModal(false);
          setSuspendReason("");
          queryClient.invalidateQueries({ queryKey: ["users", id] });
          queryClient.invalidateQueries({ queryKey: ["users"] });
          queryClient.invalidateQueries({ queryKey: ["owner-verifications"] });
        },
      }
    );
  };

  if (!canManageUsers()) {
    return (
      <div className="space-y-6 pb-8">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-red-200/60 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h2>
          <p className="text-gray-600 mb-6">Vous n&apos;avez pas les permissions nécessaires pour voir les détails de cet utilisateur.</p>
          <Button
            onClick={() => router.push("/admin/users")}
            className="bg-theme-primary hover:bg-[#d87200] text-white"
          >
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-theme-primary mb-6 mx-auto" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-theme-primary/20 rounded-full mx-auto animate-pulse"></div>
          </div>
          <p className="text-gray-600 text-sm font-medium">Chargement des détails de l&apos;utilisateur...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6 pb-8">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-red-200/60 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">Impossible de charger les détails de l&apos;utilisateur.</p>
          <Button
            onClick={() => router.push("/admin/users")}
            className="bg-theme-primary hover:bg-[#d87200] text-white"
          >
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 animate-in fade-in-50 duration-500">
      <UserHeader user={user} />

      {/* Tabs pour organiser les sections */}
      <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/90 backdrop-blur-md rounded-2xl p-1.5 shadow-lg border border-gray-200/60 h-auto">
          <TabsTrigger value="overview" className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-theme-primary data-[state=active]:text-white rounded-xl transition-all duration-200">
            <User className="w-4 h-4" />
            Vue d&apos;ensemble
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-theme-primary data-[state=active]:text-white rounded-xl transition-all duration-200">
            <Shield className="w-4 h-4" />
            Compte
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-theme-primary data-[state=active]:text-white rounded-xl transition-all duration-200">
            <FileText className="w-4 h-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-theme-primary data-[state=active]:text-white rounded-xl transition-all duration-200">
            <Activity className="w-4 h-4" />
            Statistiques
          </TabsTrigger>
          {user.verifications && user.verifications.length > 0 && (
            <TabsTrigger value="verifications" className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-theme-primary data-[state=active]:text-white rounded-xl transition-all duration-200">
              <FileCheck className="w-4 h-4" />
              Vérifications
            </TabsTrigger>
          )}
        </TabsList>

        {/* Vue d&apos;ensemble */}
        <TabsContent value="overview" className="space-y-6 mt-0">
          <UserOverviewTab user={user} />
        </TabsContent>

        {/* Compte */}
        <TabsContent value="account" className="space-y-6 mt-0">
          <Card className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/60 hover:shadow-xl transition-all duration-300 overflow-hidden">
            {/* Header compact */}
              <div className="bg-linear-to-r from-purple-50 via-purple-50/50 to-transparent p-5 border-b border-gray-200/50">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-linear-to-br from-purple-500 to-purple-600 rounded-xl shadow-md">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Informations de compte</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Détails du compte et statuts de vérification</p>
                </div>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Type */}
                <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-200/50">
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Type</label>
                  <div className="mt-1">{getTypeBadge(user.type)}</div>
                </div>

                {/* Rôle */}
                <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-200/50">
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Rôle</label>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{user.role}</p>
                </div>

                {/* Statut de vérification */}
                <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-200/50">
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Statut de vérification</label>
                  <div className="mt-1">{getStatusBadge(user.verification_status)}</div>
                </div>

                {/* Niveau de vérification */}
                <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-200/50">
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Niveau de vérification</label>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{user.verification_level || "N/A"}</p>
                </div>

                {/* Téléphone vérifié */}
                <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-200/50">
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Téléphone vérifié</label>
                  <div className="flex items-center gap-2 mt-1">
                    {user.phone_verified ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600 font-semibold">Oui</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-600 font-semibold">Non</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Compte vérifié */}
                <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-200/50">
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Compte vérifié</label>
                  <div className="flex items-center gap-2 mt-1">
                    {user.is_verified ? (
                      <>
                        <Shield className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600 font-semibold">Oui</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500 font-semibold">Non</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Premium */}
                <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-200/50">
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Premium</label>
                  <div className="flex items-center gap-2 mt-1">
                    {user.is_premium ? (
                      <>
                        <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                        <span className="text-sm text-yellow-600 font-semibold">Oui</span>
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500 font-semibold">Non</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Permissions */}
        <TabsContent value="permissions" className="space-y-6 mt-0">
          {user.permissions && user.permissions.length > 0 ? (
            <Card className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/60 hover:shadow-xl transition-all duration-300 overflow-hidden">
              {/* Header compact */}
              <div className="bg-linear-to-r from-green-50 via-green-50/50 to-transparent p-5 border-b border-gray-200/50">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-linear-to-br from-green-500 to-green-600 rounded-xl shadow-md">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Permissions</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{user.permissions.length} permission(s) accordée(s)</p>
                  </div>
                </div>
              </div>

              {/* Contenu */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-2">
                  {user.permissions.map((permission, index) => (
                    <div
                      key={index}
                      className="px-3 py-2.5 bg-linear-to-br from-gray-50 to-white rounded-lg text-xs text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                      <span className="font-medium">{permission}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/60 text-center p-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Aucune permission</h3>
              <p className="text-sm text-gray-600">Cet utilisateur n&apos;a aucune permission assignée.</p>
            </Card>
          )}
        </TabsContent>

        {/* Statistiques */}
        <TabsContent value="stats" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/60 hover:shadow-xl transition-all duration-300 overflow-hidden">
              {/* Header compact */}
              <div className="bg-linear-to-r from-blue-50 via-blue-50/50 to-transparent p-4 border-b border-gray-200/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">Score de réputation</h3>
                </div>
              </div>
              {/* Contenu */}
              <div className="p-6">
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {user.reputation_score ? parseFloat(user.reputation_score).toFixed(2) : "0.00"}
                </p>
                <p className="text-xs text-gray-500">Basé sur les avis et interactions</p>
              </div>
            </Card>

            <Card className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/60 hover:shadow-xl transition-all duration-300 overflow-hidden">
              {/* Header compact */}
              <div className="bg-linear-to-r from-green-50 via-green-50/50 to-transparent p-4 border-b border-gray-200/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-linear-to-br from-green-500 to-green-600 rounded-lg shadow-md">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">Total réservations</h3>
                </div>
              </div>
              {/* Contenu */}
              <div className="p-6">
                <p className="text-3xl font-bold text-gray-900 mb-1">{user.total_bookings || 0}</p>
                <p className="text-xs text-gray-500">Réservations effectuées</p>
              </div>
            </Card>

            <Card className={`bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/60 hover:shadow-xl transition-all duration-300 overflow-hidden`}>
              {/* Header compact */}
              <div className={`bg-linear-to-r ${parseFloat(user.cancellation_rate || "0") > 10 ? "from-red-50 via-red-50/50" : parseFloat(user.cancellation_rate || "0") > 5 ? "from-yellow-50 via-yellow-50/50" : "from-green-50 via-green-50/50"} to-transparent p-4 border-b border-gray-200/50`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-linear-to-br ${parseFloat(user.cancellation_rate || "0") > 10 ? "from-red-500 to-red-600" : parseFloat(user.cancellation_rate || "0") > 5 ? "from-yellow-500 to-yellow-600" : "from-green-500 to-green-600"} rounded-lg shadow-md`}>
                    <Ban className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">Taux d&apos;annulation</h3>
                </div>
              </div>
              {/* Contenu */}
              <div className="p-6">
                <p className={`text-3xl font-bold mb-1 ${parseFloat(user.cancellation_rate || "0") > 10 ? "text-red-600" : parseFloat(user.cancellation_rate || "0") > 5 ? "text-yellow-600" : "text-green-600"}`}>
                  {user.cancellation_rate ? parseFloat(user.cancellation_rate).toFixed(2) : "0.00"}%
                </p>
                <p className="text-xs text-gray-500">Pourcentage d&apos;annulations</p>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Vérifications */}
        <TabsContent value="verifications" className="space-y-6 mt-0">
          {user.verifications && user.verifications.length > 0 ? (
            <div className="space-y-4">
              {user.verifications.map((verification) => (
                <Card
                  key={verification.id}
                  className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/60 hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Header compact */}
                  <div className="bg-linear-to-r from-blue-50 via-blue-50/50 to-transparent p-5 border-b border-gray-200/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                          <FileCheck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {verification.document_type}
                            {verification.identity_document_type && (
                              <span className="text-sm font-normal text-gray-500 ml-2">
                                ({verification.identity_document_type})
                              </span>
                            )}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Document #{verification.id} • Créé le {new Date(verification.created_at).toLocaleDateString("fr-FR", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(verification.status)}
                        {verification.status === "PENDING" && canReviewDocuments() && (
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleReviewDocument(verification.id, "APPROVED")}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white h-8"
                              disabled={reviewMutation.isPending || verification.status !== "PENDING"}
                            >
                              <Check className="w-3.5 h-3.5 mr-1.5" />
                              Approuver
                            </Button>
                            <Button
                              onClick={() => handleReviewDocument(verification.id, "REJECTED")}
                              size="sm"
                              variant="destructive"
                              className="h-8"
                              disabled={reviewMutation.isPending || verification.status !== "PENDING"}
                            >
                              <X className="w-3.5 h-3.5 mr-1.5" />
                              Rejeter
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contenu principal */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Colonne 1: Informations principales */}
                      <div className="lg:col-span-2 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-200/50">
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Numéro de document</label>
                            <p className="text-sm font-semibold text-gray-900 break-all">{verification.document_number}</p>
                          </div>
                          {verification.issuing_authority && (
                            <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-200/50">
                              <label className="text-xs font-medium text-gray-500 mb-1 block">Autorité émettrice</label>
                              <p className="text-sm font-semibold text-gray-900">{verification.issuing_authority}</p>
                            </div>
                          )}
                          {verification.document_issue_date && (
                            <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-200/50">
                              <label className="text-xs font-medium text-gray-500 mb-1 block">Date d&apos;émission</label>
                              <p className="text-sm font-semibold text-gray-900">
                                {new Date(verification.document_issue_date).toLocaleDateString("fr-FR", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                          )}
                          {verification.document_expiry_date && (
                            <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-200/50">
                              <label className="text-xs font-medium text-gray-500 mb-1 block">Date d&apos;expiration</label>
                              <p className="text-sm font-semibold text-gray-900">
                                {new Date(verification.document_expiry_date).toLocaleDateString("fr-FR", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                          )}
                          {verification.reviewed_at && (
                            <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-200/50">
                              <label className="text-xs font-medium text-gray-500 mb-1 block">Date de révision</label>
                              <p className="text-sm font-semibold text-gray-900">
                                {new Date(verification.reviewed_at).toLocaleDateString("fr-FR", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                          )}
                          {verification.reviewed_by && (
                            <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-200/50">
                              <label className="text-xs font-medium text-gray-500 mb-1 block">Révisé par</label>
                              <p className="text-sm font-semibold text-gray-900">ID: {verification.reviewed_by}</p>
                            </div>
                          )}
                        </div>

                        {/* Notes et raison de rejet */}
                        {(verification.notes || verification.rejection_reason) && (
                          <div className="space-y-3">
                            {verification.rejection_reason && (
                              <div className="p-4 bg-red-50/50 rounded-lg border-2 border-red-200/50">
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertCircle className="w-4 h-4 text-red-600" />
                                  <label className="text-xs font-semibold text-red-700">Raison de rejet</label>
                                </div>
                                <p className="text-sm text-gray-900">{verification.rejection_reason}</p>
                              </div>
                            )}
                            {verification.notes && (
                              <div className="p-4 bg-gray-50/50 rounded-lg border border-gray-200/50">
                                <label className="text-xs font-semibold text-gray-700 mb-2 block">Notes</label>
                                <p className="text-sm text-gray-900">{verification.notes}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Colonne 2: Fichier du document */}
                      {verification.document_file && (
                        <div className="space-y-4">
                          <div className="p-4 bg-linear-to-br from-blue-50 via-blue-50/50 to-white rounded-xl border-2 border-blue-200/50">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                                <FileText className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{verification.document_file.file_name}</p>
                                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-600">
                                  <span>{verification.document_file.mime_type}</span>
                                  <span>•</span>
                                  <span>{(verification.document_file.size / 1024).toFixed(2)} KB</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(verification.document_file!.url, "_blank")}
                                className="flex-1 hover:bg-blue-50 hover:border-blue-300"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1.5" />
                                Voir
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const link = document.createElement("a");
                                  link.href = verification.document_file!.url;
                                  link.download = verification.document_file!.file_name;
                                  link.click();
                                }}
                                className="flex-1 hover:bg-blue-50 hover:border-blue-300"
                              >
                                <Download className="w-3.5 h-3.5 mr-1.5" />
                                Télécharger
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {/* Actions sur le propriétaire */}
              {user.type === "OWNER" && (canApproveOwner() || canRejectOwner() || canSuspendOwner()) && (
                <Card className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-200/60 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-linear-to-br from-orange-500/5 to-transparent rounded-full blur-3xl z-0"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-linear-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Actions sur le propriétaire</h2>
                        <p className="text-sm text-gray-500 mt-1">Gérer la vérification du propriétaire</p>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="flex flex-wrap gap-3">
                      {canApproveOwner() && user.verification_status !== "APPROVED" && (
                        <Button
                          onClick={() => setApproveModal(true)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          disabled={approveMutation.isPending || user.verification_status === "APPROVED"}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Approuver le propriétaire
                        </Button>
                      )}
                      {canRejectOwner() && user.verification_status !== "REJECTED" && (
                        <Button
                          onClick={() => setRejectModal(true)}
                          variant="destructive"
                          disabled={rejectMutation.isPending || user.verification_status === "REJECTED"}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Rejeter le propriétaire
                        </Button>
                      )}
                      {canSuspendOwner() && user.verification_status !== "SUSPENDED" && (
                        <Button
                          onClick={() => setSuspendModal(true)}
                          variant="outline"
                          className="border-orange-300 text-orange-700 hover:bg-orange-50"
                          disabled={suspendMutation.isPending || user.verification_status === "SUSPENDED"}
                        >
                          <Pause className="w-4 h-4 mr-2" />
                          Suspendre le propriétaire
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <Card className="bg-white/90 backdrop-blur-md rounded-3xl p-12 shadow-xl shadow-gray-200/50 border border-gray-200/60 text-center">
              <FileCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune vérification</h3>
              <p className="text-gray-600">Cet utilisateur n&apos;a soumis aucune vérification.</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal pour réviser un document */}
      <Dialog open={reviewDocumentModal.open} onOpenChange={(open) => !open && setReviewDocumentModal({ open: false, documentId: null, status: null })}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {reviewDocumentModal.status === "APPROVED" ? "Approuver le document" : "Rejeter le document"}
            </DialogTitle>
            <DialogDescription>
              {reviewDocumentModal.status === "APPROVED"
                ? "Vous êtes sur le point d&apos;approuver ce document."
                : "Veuillez fournir une raison pour le rejet de ce document."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {reviewDocumentModal.status === "REJECTED" && (
              <div className="space-y-2">
                <Label htmlFor="review-reason">Raison du rejet *</Label>
                <Textarea
                  id="review-reason"
                  placeholder="Entrez la raison du rejet..."
                  value={reviewReason}
                  onChange={(e) => setReviewReason(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
            )}
            {reviewDocumentModal.status === "APPROVED" && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  Le document sera approuvé et le statut sera mis à jour.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDocumentModal({ open: false, documentId: null, status: null })}
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
              className={
                reviewDocumentModal.status === "APPROVED"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }
            >
              {reviewMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : reviewDocumentModal.status === "APPROVED" ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Approuver
                </>
              ) : (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Rejeter
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal pour approuver un propriétaire */}
      <Dialog open={approveModal} onOpenChange={setApproveModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Approuver le propriétaire</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point d&apos;approuver ce propriétaire. Vous pouvez ajouter des notes optionnelles.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="approve-notes">Notes d&apos;administration (optionnel)</Label>
              <Textarea
                id="approve-notes"
                placeholder="Entrez des notes d&apos;administration..."
                value={approveNotes}
                onChange={(e) => setApproveNotes(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                Le propriétaire sera approuvé et pourra utiliser toutes les fonctionnalités disponibles.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveModal(false)} disabled={approveMutation.isPending}>
              Annuler
            </Button>
            <Button
              onClick={handleApproveOwner}
              disabled={approveMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {approveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approuver
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal pour rejeter un propriétaire */}
      <Dialog open={rejectModal} onOpenChange={setRejectModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Rejeter le propriétaire</DialogTitle>
            <DialogDescription>
              Veuillez fournir une raison pour le rejet de ce propriétaire.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Raison du rejet *</Label>
              <Textarea
                id="reject-reason"
                placeholder="Entrez la raison du rejet..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-800">
                  Cette action rejettera le propriétaire et il ne pourra plus utiliser les fonctionnalités réservées aux propriétaires.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModal(false)} disabled={rejectMutation.isPending}>
              Annuler
            </Button>
            <Button
              onClick={handleRejectOwner}
              disabled={rejectMutation.isPending || !rejectReason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {rejectMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Rejeter
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal pour suspendre un propriétaire */}
      <Dialog open={suspendModal} onOpenChange={setSuspendModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Suspendre le propriétaire</DialogTitle>
            <DialogDescription>
              Veuillez fournir une raison pour la suspension de ce propriétaire.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="suspend-reason">Raison de la suspension *</Label>
              <Textarea
                id="suspend-reason"
                placeholder="Entrez la raison de la suspension..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
                <p className="text-sm text-orange-800">
                  Cette action suspendra temporairement le propriétaire. Il pourra être réactivé plus tard.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendModal(false)} disabled={suspendMutation.isPending}>
              Annuler
            </Button>
            <Button
              onClick={handleSuspendOwner}
              disabled={suspendMutation.isPending || !suspendReason.trim()}
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              {suspendMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 mr-2" />
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

