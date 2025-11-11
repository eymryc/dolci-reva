"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  User, 
  Mail, 
  Phone, 
  ArrowLeft,
  Save,
  Loader2,
  ShieldOff,
  FileText,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Award,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/use-permissions";
import { useVerificationStatus } from "@/hooks/use-owner-verifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/lib/axios";

export default function CustomerProfilePage() {
  const { user, refreshUser } = useAuth();
  const { isCustomer, isOwner } = usePermissions();
  const searchParams = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingDocument, setUploadingDocument] = useState<string | null>(null);
  const [documentDialogOpen, setDocumentDialogOpen] = useState<string | null>(null);
  const [documentFormData, setDocumentFormData] = useState({
    document_type: "",
    document_number: "",
    document_issue_date: "",
    document_expiry_date: "",
    identity_document_type: "",
    notes: "",
    document_file: null as File | null,
  });

  const {
    data: verificationStatus,
    isLoading: isLoadingVerification,
    refetch: refetchVerification,
  } = useVerificationStatus(isOwner());

  // Gérer le paramètre tab dans l'URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "verification" && isOwner()) {
      setActiveTab("verification");
    }
  }, [searchParams, isOwner]);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await api.put("/profile", formData);
      await refreshUser();
      setIsEditing(false);
      toast.success("Profil mis à jour avec succès !");
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || "Erreur lors de la mise à jour du profil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!documentFormData.document_file || !documentFormData.document_type) {
      toast.error("Veuillez sélectionner un fichier et remplir les champs requis");
      return;
    }

    setUploadingDocument(documentFormData.document_type);
    try {
      const formData = new FormData();
      formData.append("document_type", documentFormData.document_type);
      formData.append("document_file", documentFormData.document_file);
      if (documentFormData.document_number) {
        formData.append("document_number", documentFormData.document_number);
      }
      if (documentFormData.document_issue_date) {
        formData.append("document_issue_date", documentFormData.document_issue_date);
      }
      if (documentFormData.document_expiry_date) {
        formData.append("document_expiry_date", documentFormData.document_expiry_date);
      }
      if (documentFormData.identity_document_type) {
        formData.append("identity_document_type", documentFormData.identity_document_type);
      }
      if (documentFormData.notes) {
        formData.append("notes", documentFormData.notes);
      }
      
      await api.post("/owner-verification/documents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      toast.success("Document soumis avec succès !");
      refetchVerification();
      setDocumentDialogOpen(null);
      setDocumentFormData({
        document_type: "",
        document_number: "",
        document_issue_date: "",
        document_expiry_date: "",
        identity_document_type: "",
        notes: "",
        document_file: null,
      });
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || "Erreur lors de la soumission du document");
    } finally {
      setUploadingDocument(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentFormData(prev => ({ ...prev, document_file: file }));
    }
  };

  const openDocumentDialog = (documentType: string) => {
    setDocumentFormData(prev => ({ ...prev, document_type: documentType }));
    setDocumentDialogOpen(documentType);
  };

  const getUserInitials = () => {
    if (!user) return "U";
    return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
  };

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


  if (!isCustomer() && !isOwner()) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Accès refusé</h1>
        <p className="text-gray-600">Vous devez être connecté pour accéder à cette page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      {/* Header */}
      <div className="mb-8">
        <Link href={isCustomer() ? "/customer/dashboard" : "/admin/dashboard"}>
          <Button variant="ghost" className="mb-4 hover:bg-theme-primary/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au tableau de bord
          </Button>
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-theme-primary/10 rounded-xl">
            <User className="w-6 h-6 text-theme-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Mon profil
          </h1>
        </div>
        <p className="text-gray-500 text-sm ml-14">
          Gérez vos informations personnelles{isOwner() && " et votre vérification"}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          {isOwner() && <TabsTrigger value="verification">Vérification</TabsTrigger>}
        </TabsList>

        <TabsContent value="profile" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <Card className="lg:col-span-1 bg-gradient-to-br from-white via-white to-theme-primary/5 backdrop-blur-sm border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-theme-primary/10 to-transparent rounded-full blur-2xl"></div>
              <div className="relative flex flex-col items-center text-center">
                <div className="relative mb-6 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-theme-primary/40 to-theme-accent/30 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-300"></div>
                  <Avatar className="relative w-28 h-28 ring-4 ring-theme-primary/30 shadow-2xl group-hover:scale-105 transition-transform duration-300">
                    <AvatarFallback className="bg-gradient-to-br from-theme-primary via-theme-primary to-theme-accent text-white text-3xl font-bold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  {user?.is_verified && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 shadow-lg ring-4 ring-white">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {user?.first_name} {user?.last_name}
                </h2>
                <p className="text-gray-600 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </p>
                <p className="text-gray-500 text-sm mb-4 flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  {user?.phone}
                </p>
                <div className="flex flex-col gap-3 w-full">
                  <Badge className="bg-gradient-to-r from-theme-primary/10 to-theme-primary/5 text-theme-primary border-theme-primary/30 px-4 py-1.5 text-sm font-semibold">
                    {isCustomer() ? "Client" : user?.role || "Propriétaire"}
                </Badge>
                {isOwner() && verificationStatus && (
                    <div className="flex flex-col gap-2">
                    {getStatusBadge(verificationStatus.verification?.verification_status || "PENDING")}
                    {getLevelBadge(verificationStatus.verification?.verification_level || null)}
                  </div>
                )}
                  {user?.is_premium && (
                    <Badge className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 text-purple-700 border-purple-300/30 px-4 py-1.5 text-sm font-semibold">
                      <Award className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
              </div>
            </Card>

            {/* Form Card */}
            <Card className="lg:col-span-2 bg-gradient-to-br from-white via-white to-gray-50/50 backdrop-blur-sm border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 p-8">
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-theme-primary" />
                  Informations personnelles
                </h3>
                <p className="text-sm text-gray-500 mt-1">Gérez vos informations de profil</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 group">
                    <Label htmlFor="first_name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4 text-theme-primary" />
                      Prénom
                    </Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`h-12 transition-all duration-200 ${
                        !isEditing 
                          ? "bg-gray-50/80 border-gray-200 cursor-not-allowed" 
                          : "bg-white border-gray-300 focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20"
                      }`}
                    />
                  </div>

                  <div className="space-y-2 group">
                    <Label htmlFor="last_name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4 text-theme-primary" />
                      Nom
                    </Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`h-12 transition-all duration-200 ${
                        !isEditing 
                          ? "bg-gray-50/80 border-gray-200 cursor-not-allowed" 
                          : "bg-white border-gray-300 focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20"
                      }`}
                    />
                  </div>

                  <div className="space-y-2 group">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-theme-primary" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`h-12 transition-all duration-200 ${
                        !isEditing 
                          ? "bg-gray-50/80 border-gray-200 cursor-not-allowed" 
                          : "bg-white border-gray-300 focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20"
                      }`}
                    />
                  </div>

                  <div className="space-y-2 group">
                    <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-theme-primary" />
                      Téléphone
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`h-12 transition-all duration-200 ${
                        !isEditing 
                          ? "bg-gray-50/80 border-gray-200 cursor-not-allowed" 
                          : "bg-white border-gray-300 focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20"
                      }`}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  {isEditing ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            first_name: user?.first_name || "",
                            last_name: user?.last_name || "",
                            email: user?.email || "",
                            phone: user?.phone || "",
                          });
                        }}
                        disabled={isLoading}
                        className="h-12 px-6 border-gray-300 hover:bg-gray-50 transition-all duration-200"
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-theme-primary to-theme-accent hover:from-theme-accent hover:to-theme-primary text-white h-12 px-6 shadow-lg hover:shadow-xl transition-all duration-200"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Enregistrer
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-theme-primary to-theme-accent hover:from-theme-accent hover:to-theme-primary text-white h-12 px-6 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Modifier le profil
                    </Button>
                  )}
                </div>
              </form>
            </Card>
          </div>
        </TabsContent>

        {isOwner() && (
          <TabsContent value="verification" className="mt-0">
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg p-6">
              {isLoadingVerification ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-theme-primary" />
                </div>
              ) : verificationStatus ? (
                <div className="space-y-8">
                  {/* Documents Section */}
                  <div>
                    <div className="mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-theme-primary/10 to-theme-primary/5">
                          <FileText className="w-6 h-6 text-theme-primary" />
                        </div>
                        Documents de vérification
                      </h3>
                      <p className="text-sm text-gray-500 ml-12">Soumettez vos documents pour compléter votre vérification</p>
                    </div>
                    <div className="space-y-6">
                      {[
                        { type: "IDENTITY", label: "Document d'identité", required: true, icon: FileText, iconBg: "bg-gradient-to-br from-blue-500 to-blue-600", iconColor: "text-white" },
                      ].map((docType) => {
                        const existingDoc = (verificationStatus?.documents || []).find(
                          (doc) => doc.document_type === docType.type
                        );
                        const Icon = docType.icon;
                        const statusConfig: Record<string, { border: string; bg: string; badge: string; icon: React.ComponentType<{ className?: string }> }> = {
                          APPROVED: {
                            border: "border-green-300",
                            bg: "bg-gradient-to-br from-green-50 via-white to-green-50/50",
                            badge: "bg-green-500 text-white",
                            icon: CheckCircle2
                          },
                          REJECTED: {
                            border: "border-red-300",
                            bg: "bg-gradient-to-br from-red-50 via-white to-red-50/50",
                            badge: "bg-red-500 text-white",
                            icon: XCircle
                          },
                          PENDING: {
                            border: "border-yellow-300",
                            bg: "bg-gradient-to-br from-yellow-50 via-white to-yellow-50/50",
                            badge: "bg-yellow-500 text-white",
                            icon: Clock
                          },
                        };
                        const config = existingDoc ? statusConfig[existingDoc.status] || { border: "border-gray-200", bg: "bg-gradient-to-br from-gray-50 via-white to-gray-50/50", badge: "bg-gray-500 text-white", icon: FileText } : { border: "border-gray-200", bg: "bg-gradient-to-br from-gray-50 via-white to-gray-50/50", badge: "bg-gray-500 text-white", icon: FileText };
                        const StatusIcon = config.icon;
                        
                        return (
                          <div key={docType.type} className={`border-2 ${config.border} ${config.bg} rounded-2xl p-8 transition-all duration-300 relative overflow-hidden`}>
                            {/* Decorative gradient overlay */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-theme-primary/5 to-transparent rounded-full blur-3xl -z-0"></div>
                            
                            <div className="relative z-10">
                              <div className="flex items-start gap-6 mb-6">
                                {/* Icon Section */}
                                <div className={`p-4 rounded-2xl ${docType.iconBg} flex-shrink-0 shadow-lg`}>
                                  <Icon className={`w-8 h-8 ${docType.iconColor}`} />
                                </div>
                                
                                {/* Content Section */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-4 mb-4">
                              <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        <h4 className="text-xl font-bold text-gray-900">
                                          {docType.label}
                                        </h4>
                                  {docType.required && (
                                          <Badge className="bg-red-500 text-white border-0 text-xs px-2.5 py-1 font-semibold">
                                      Requis
                                    </Badge>
                                  )}
                                </div>
                                      {!existingDoc && (
                                        <p className="text-sm text-gray-500 mt-1">Aucun document soumis pour le moment</p>
                                      )}
                                    </div>
                                    
                                    {/* Status Badge and Action Button */}
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                      {existingDoc && (
                                        <Badge className={`${config.badge} border-0 px-4 py-2 text-sm font-semibold shadow-md flex items-center gap-2`}>
                                          <StatusIcon className="w-4 h-4" />
                                          {existingDoc.status === "APPROVED" ? "Approuvé" : existingDoc.status === "REJECTED" ? "Rejeté" : "En attente"}
                                        </Badge>
                                      )}
                                      
                                      {/* Action Button */}
                                      <Dialog 
                                        open={documentDialogOpen === docType.type} 
                                        onOpenChange={(open) => {
                                          if (!open) {
                                            setDocumentDialogOpen(null);
                                            setDocumentFormData({
                                              document_type: "",
                                              document_number: "",
                                              document_issue_date: "",
                                              document_expiry_date: "",
                                              identity_document_type: "",
                                              notes: "",
                                              document_file: null,
                                            });
                                          } else {
                                            openDocumentDialog(docType.type);
                                          }
                                        }}
                                      >
                                        <DialogTrigger asChild>
                                <Button
                                  type="button"
                                            className="bg-gradient-to-r from-theme-primary to-theme-accent text-white h-10 px-4 text-sm font-semibold shadow-lg transition-all duration-300 active:scale-[0.98] whitespace-nowrap"
                                  disabled={uploadingDocument === docType.type}
                                >
                                  {uploadingDocument === docType.type ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Upload...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="w-4 h-4 mr-2" />
                                      {existingDoc ? "Remplacer" : "Soumettre"}
                                    </>
                                  )}
                                </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                                          <DialogHeader className="border-b border-gray-200">
                                            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-theme-primary to-theme-accent bg-clip-text text-transparent">
                                              {docType.label}
                                            </DialogTitle>
                                            <DialogDescription>
                                              Remplissez tous les champs requis pour soumettre votre document
                                            </DialogDescription>
                                          </DialogHeader>
                                          <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                              <Label htmlFor="document_number">
                                                Numéro du document <span className="text-red-500">*</span>
                                              </Label>
                                              <Input
                                                id="document_number"
                                                value={documentFormData.document_number}
                                                onChange={(e) => setDocumentFormData(prev => ({ ...prev, document_number: e.target.value }))}
                                                placeholder="Ex: 123456789"
                                                className="h-12"
                                              />
                                            </div>
                                            <div className="space-y-2">
                                              <Label htmlFor="identity_document_type">
                                                Type de document <span className="text-red-500">*</span>
                                              </Label>
                                              <Select
                                                value={documentFormData.identity_document_type}
                                                onValueChange={(value) => setDocumentFormData(prev => ({ ...prev, identity_document_type: value }))}
                                              >
                                                <SelectTrigger 
                                                  id="identity_document_type" 
                                                  className="!h-12 min-w-0"
                                                  style={{ width: '100%' }}
                                                >
                                                  <SelectValue placeholder="Sélectionnez un type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="CNI">CNI</SelectItem>
                                                  <SelectItem value="PASSEPORT">Passeport</SelectItem>
                                                  <SelectItem value="AUTRE">Autre</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </div>
                                            <div className="space-y-2">
                                              <Label htmlFor="document_issue_date">
                                                Date d&apos;émission <span className="text-red-500">*</span>
                                              </Label>
                                              <Input
                                                id="document_issue_date"
                                                type="date"
                                                value={documentFormData.document_issue_date}
                                                onChange={(e) => setDocumentFormData(prev => ({ ...prev, document_issue_date: e.target.value }))}
                                                className="h-12"
                                              />
                                            </div>
                                            <div className="space-y-2">
                                              <Label htmlFor="document_expiry_date">
                                                Date d&apos;expiration <span className="text-red-500">*</span>
                                              </Label>
                                              <Input
                                                id="document_expiry_date"
                                                type="date"
                                                value={documentFormData.document_expiry_date}
                                                onChange={(e) => setDocumentFormData(prev => ({ ...prev, document_expiry_date: e.target.value }))}
                                                className="h-12"
                                              />
                                            </div>
                                            <div className="space-y-2">
                                              <Label htmlFor="document_file">
                                                Fichier du document <span className="text-red-500">*</span>
                                              </Label>
                                              <div className="flex items-center gap-4">
                                                <Input
                                                  id="document_file"
                                                  type="file"
                                                  accept=".pdf,.jpg,.jpeg,.png"
                                                  onChange={handleFileChange}
                                                  ref={fileInputRef}
                                                  className="h-12"
                                                />
                                                {documentFormData.document_file && (
                                                  <Badge className="bg-green-100 text-green-800 border-green-200">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                    {documentFormData.document_file.name}
                                                  </Badge>
                                                )}
                                              </div>
                                              <p className="text-xs text-gray-500">Formats acceptés: PDF, JPG, JPEG, PNG (Max 10MB)</p>
                                            </div>
                                            <div className="flex gap-2 justify-center pt-4 border-t border-gray-200">
                                              <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                  setDocumentDialogOpen(null);
                                                  setDocumentFormData({
                                                    document_type: "",
                                                    document_number: "",
                                                    document_issue_date: "",
                                                    document_expiry_date: "",
                                                    identity_document_type: "",
                                                    notes: "",
                                                    document_file: null,
                                                  });
                                                }}
                                                disabled={uploadingDocument === docType.type}
                                                className="h-12"
                                              >
                                                Annuler
                                              </Button>
                                              <Button
                                                type="button"
                                                onClick={handleFileUpload}
                                                disabled={uploadingDocument === docType.type || !documentFormData.document_file}
                                                className="bg-gradient-to-r from-theme-primary to-theme-accent hover:from-theme-accent hover:to-theme-primary text-white h-12"
                                              >
                                                {uploadingDocument === docType.type ? (
                                                  <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Envoi en cours...
                                                  </>
                                                ) : (
                                                  <>
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    Soumettre
                                                  </>
                                                )}
                                              </Button>
                                            </div>
                                          </div>
                                        </DialogContent>
                                      </Dialog>
                                    </div>
                                  </div>
                                  
                                  {/* Document Details */}
                                  {existingDoc && (
                                    <div className="space-y-4 mt-4">
                                    {existingDoc.rejection_reason && (
                                        <div className="bg-red-50/80 border-l-4 border-red-500 rounded-lg p-4 backdrop-blur-sm">
                                          <div className="flex items-start gap-2">
                                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                              <p className="text-sm font-semibold text-red-900 mb-1">Raison du rejet</p>
                                              <p className="text-sm text-red-700">{existingDoc.rejection_reason}</p>
                                            </div>
                                          </div>
                                        </div>
                                    )}
                                    {existingDoc.document_file_url && (
                                      <a
                                        href={existingDoc.document_file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium transition-colors duration-200 border border-blue-200"
                                      >
                                          <FileText className="w-4 h-4" />
                                        Voir le document
                                      </a>
                                    )}
                                  </div>
                                )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShieldOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucune information de vérification disponible</p>
                </div>
              )}
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
