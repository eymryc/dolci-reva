"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  User,
  Mail,
  Phone,
  Save,
  Loader2,
  Edit2,
  Shield,
  Star,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  ShieldCheck,
  Upload,
  Clock,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentVerificationModal } from "@/components/admin/owner-verifications/DocumentVerificationModal";
import { DocumentVerificationFormData } from "@/components/admin/owner-verifications/DocumentVerificationForm";
import { useBusinessTypes } from "@/hooks/use-business-types";
import { Check } from "lucide-react";
import { useVerificationStatus, DocumentType, useSubmitDocument } from "@/hooks/use-owner-verifications";
import { useUpdateProfile } from "@/hooks/use-profile";

export default function AdminProfilePage() {
  const { user } = useAuth();
  const { isAnyAdmin } = usePermissions();
  const [isEditing, setIsEditing] = useState(false);
  // Charger les business types
  const { data: businessTypes = [], isLoading: isLoadingBusinessTypes } = useBusinessTypes();
  const [selectedBusinessTypes, setSelectedBusinessTypes] = useState<number[]>([]);

  // Hook pour la mise à jour du profil
  const updateProfile = useUpdateProfile();

  // Charger les informations de vérification (si OWNER)
  const {
    data: verificationStatus,
    isLoading: isLoadingVerification,
    refetch: refetchVerification
  } = useVerificationStatus(user?.type === "OWNER");

  // États pour la soumission de documents
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [defaultDocumentType, setDefaultDocumentType] = useState<DocumentType | undefined>(undefined);

  // Hook pour la soumission de documents
  const submitDocument = useSubmitDocument();

  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    id_document_number: user?.id_document_number || "",
    date_of_birth: user?.date_of_birth ? user.date_of_birth.split('T')[0] : "",
    address_line1: user?.address_line1 || "",
    address_line2: user?.address_line2 || "",
    postal_code: user?.postal_code || "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        id_document_number: user.id_document_number || "",
        date_of_birth: user.date_of_birth ? user.date_of_birth.split('T')[0] : "",
        address_line1: user.address_line1 || "",
        address_line2: user.address_line2 || "",
        postal_code: user.postal_code || "",
      });
      // Initialiser les business types sélectionnés
      if (user.businessTypes && user.businessTypes.length > 0) {
        setSelectedBusinessTypes(user.businessTypes.map(bt => bt.id));
      } else {
        setSelectedBusinessTypes([]);
      }
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBusinessTypeToggle = (businessTypeId: number) => {
    setSelectedBusinessTypes(prev => {
      const newSelection = prev.includes(businessTypeId)
        ? prev.filter(id => id !== businessTypeId)
        : [...prev, businessTypeId];
      return newSelection;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    updateProfile.mutate(
      {
        ...formData,
        services: selectedBusinessTypes,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const openDocumentDialog = (documentType: DocumentType) => {
    setDefaultDocumentType(documentType);
    setIsDocumentModalOpen(true);
  };

  const handleDocumentSubmit = async (data: DocumentVerificationFormData): Promise<void> => {
    if (!data.document_file) {
      throw new Error("Le fichier du document est requis");
    }

    return new Promise((resolve, reject) => {
      submitDocument.mutate(
        {
          document_type: data.document_type,
          document_file: data.document_file as File,
          document_number: data.document_number,
          document_issue_date: data.document_issue_date,
          document_expiry_date: data.document_expiry_date,
          identity_document_type: data.identity_document_type,
        },
        {
          onSuccess: () => {
            refetchVerification();
            setIsDocumentModalOpen(false);
            setDefaultDocumentType(undefined);
            resolve();
          },
          onError: (error) => {
            reject(error);
          },
        }
      );
    });
  };

  const getUserInitials = () => {
    if (!user) return "U";
    return `${user.first_name?.charAt(0) || ""}${user.last_name?.charAt(0) || ""}`.toUpperCase();
  };

  const getUserFullName = () => {
    if (!user) return "User";
    return `${user.first_name || ""} ${user.last_name || ""}`.trim() || "User";
  };

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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-[#f08400] mb-6 mx-auto" />
          <p className="text-gray-600 text-sm font-medium">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-4 sm:pb-8 animate-in fade-in-50 duration-500 px-2 sm:px-0">
      {/* Header avec Avatar */}
      <Card className="bg-gradient-to-br from-white via-white to-gray-50/50 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl shadow-gray-200/50 border border-gray-200/60 overflow-hidden relative">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-[#f08400]/5 via-transparent to-transparent rounded-full blur-3xl -z-0"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-tr from-blue-500/5 via-transparent to-transparent rounded-full blur-3xl -z-0"></div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 flex-1 w-full">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#f08400] via-[#f08400]/90 to-orange-600 flex items-center justify-center shadow-2xl shadow-[#f08400]/30 ring-2 sm:ring-4 ring-white overflow-hidden">
                  {(user as unknown as { profile_picture?: string }).profile_picture ? (
                    <Image
                      src={(user as unknown as { profile_picture: string }).profile_picture}
                      alt={getUserFullName()}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{getUserInitials()}</span>
                  )}
                </div>
                {user.is_verified && (
                  <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center border-2 sm:border-4 border-white shadow-lg">
                    <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                )}
                {user.is_premium && (
                  <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-500 rounded-full flex items-center justify-center border-2 sm:border-4 border-white shadow-lg">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-white fill-white" />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0 w-full sm:w-auto">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#101828] truncate">
                    {user.first_name} {user.last_name}
                  </h1>
                  {getTypeBadge(user.type)}
                </div>
                <p className="text-gray-600 text-sm sm:text-base mb-2 sm:mb-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span className="flex items-center gap-2 text-xs sm:text-sm">
                    <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="truncate">{user.email}</span>
                  </span>
                  <span className="flex items-center gap-2 text-xs sm:text-sm">
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {user.phone}
                  </span>
                </p>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  {getStatusBadge(user.verification_status)}
                  {user.role && (
                    <Badge variant="outline" className="px-2 py-0.5 sm:px-3 sm:py-1 text-xs">
                      {user.role}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="bg-[#f08400] hover:bg-[#d87200] text-white shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
              >
                <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                {isEditing ? "Annuler" : "Modifier"}
              </Button>
            </div>
          </div>

        </div>
      </Card>

      {/* Tabs pour organiser les sections - Vertical */}
      <Tabs defaultValue="overview" orientation="vertical" className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        <TabsList className="flex flex-row lg:flex-col bg-white/90 backdrop-blur-md rounded-xl sm:rounded-2xl p-1 sm:p-1.5 shadow-lg border border-gray-200/60 h-auto w-full lg:w-auto lg:min-w-[250px] xl:min-w-[300px] overflow-x-auto">
          <TabsTrigger value="overview" className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 w-full lg:w-full justify-start data-[state=active]:bg-[#f08400] data-[state=active]:text-white rounded-lg sm:rounded-xl transition-all duration-200 text-xs sm:text-sm whitespace-nowrap">
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Vue d&apos;ensemble</span>
            <span className="sm:hidden">Vue</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 w-full lg:w-full justify-start data-[state=active]:bg-[#f08400] data-[state=active]:text-white rounded-lg sm:rounded-xl transition-all duration-200 text-xs sm:text-sm whitespace-nowrap">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Compte
          </TabsTrigger>
          {isAnyAdmin() && (
            <TabsTrigger value="permissions" className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 w-full lg:w-full justify-start data-[state=active]:bg-[#f08400] data-[state=active]:text-white rounded-lg sm:rounded-xl transition-all duration-200 text-xs sm:text-sm whitespace-nowrap">
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Permissions</span>
              <span className="sm:hidden">Perm.</span>
            </TabsTrigger>
          )}
          {user.type === "OWNER" && (
            <TabsTrigger value="verification" className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 w-full lg:w-full justify-start data-[state=active]:bg-[#f08400] data-[state=active]:text-white rounded-lg sm:rounded-xl transition-all duration-200 text-xs sm:text-sm whitespace-nowrap">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Vérification</span>
              <span className="sm:hidden">Vérif.</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6 mt-0 flex-1">
          <div className="space-y-4">
            {/* Informations personnelles */}
            <Card className="bg-white/90 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/60 hover:shadow-xl transition-all duration-300 overflow-hidden py-0">
              {/* Header compact */}
              <div className="bg-gradient-to-r from-blue-50 via-blue-50/50 to-transparent p-3 sm:p-4 lg:p-5 border-b border-gray-200/50">
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                  <div className="p-1.5 sm:p-2 lg:p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl shadow-md">
                    <User className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-900">Informations personnelles</h2>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Données de base de votre profil</p>
                  </div>
                </div>
              </div>

              {/* Contenu */}
              <div className="p-3 sm:p-4 lg:p-6">
                  <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                    {/* Prénom, Nom, Email et Téléphone sur la même ligne */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      <div className="space-y-1 sm:space-y-1.5">
                        <Label htmlFor="first_name" className="text-xs sm:text-sm">
                          Prénom
                        </Label>
                        <Input
                          id="first_name"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          placeholder="Exemple : John"
                          className="h-10 sm:h-12 text-xs sm:text-sm"
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-1 sm:space-y-1.5">
                        <Label htmlFor="last_name" className="text-xs sm:text-sm">
                          Nom
                        </Label>
                        <Input
                          id="last_name"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          placeholder="Exemple : Doe"
                          className="h-10 sm:h-12 text-xs sm:text-sm"
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-1 sm:space-y-1.5">
                        <Label htmlFor="email" className="text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5">
                          <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          Email
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Exemple : john.doe@example.com"
                          className="h-10 sm:h-12 text-xs sm:text-sm"
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-1 sm:space-y-1.5">
                        <Label htmlFor="phone" className="text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5">
                          <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          Téléphone
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Exemple : 0612345678"
                          className="h-10 sm:h-12 text-xs sm:text-sm"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                  {/* Informations supplémentaires */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-3 sm:mt-4">
                    <div className="space-y-1 sm:space-y-1.5">
                      <Label htmlFor="id_document_number" className="text-xs sm:text-sm">
                        Numéro de pièce d&apos;identité
                      </Label>
                      <Input
                        id="id_document_number"
                        name="id_document_number"
                        value={formData.id_document_number}
                        onChange={handleInputChange}
                        placeholder="Exemple : CI123456789"
                        className="h-10 sm:h-12 text-xs sm:text-sm"
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-1 sm:space-y-1.5">
                      <Label htmlFor="date_of_birth" className="text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5">
                        <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        Date de naissance
                      </Label>
                      <Input
                        id="date_of_birth"
                        name="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={handleInputChange}
                        className="h-10 sm:h-12 text-xs sm:text-sm"
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-1 sm:space-y-1.5">
                      <Label htmlFor="address_line1" className="text-xs sm:text-sm">
                        Adresse (ligne 1)
                      </Label>
                      <Input
                        id="address_line1"
                        name="address_line1"
                        value={formData.address_line1}
                        onChange={handleInputChange}
                        placeholder="Exemple : 123 Rue de la République"
                        className="h-10 sm:h-12 text-xs sm:text-sm"
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-1 sm:space-y-1.5 sm:col-span-2 lg:col-span-3">
                      <Label htmlFor="address_line2" className="text-xs sm:text-sm">
                        Adresse (ligne 2)
                      </Label>
                      <Textarea
                        id="address_line2"
                        name="address_line2"
                        value={formData.address_line2}
                        onChange={handleInputChange}
                        placeholder="Exemple : Appartement 4B, Résidence Les Palmiers"
                        className="min-h-[80px] sm:min-h-[100px] text-xs sm:text-sm"
                        rows={3}
                        disabled={!isEditing}
                      />
                    </div>

                  </div>

                  {/* Sélection des services (business types) */}
                  {user?.type === "OWNER" && (
                    <div className="space-y-1 sm:space-y-1.5 mt-3 sm:mt-4">
                      <Label className="text-xs sm:text-sm font-semibold">
                        Types de services
                      </Label>
                      {isLoadingBusinessTypes ? (
                        <div className="flex items-center justify-center py-6 sm:py-8 border border-gray-200 rounded-lg bg-gray-50">
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-[#f08400]" />
                          <span className="ml-2 text-xs sm:text-sm text-gray-500">Chargement des services...</span>
                        </div>
                      ) : businessTypes.length === 0 ? (
                        <div className="flex items-center justify-center py-6 sm:py-8 border border-gray-200 rounded-lg bg-gray-50">
                          <p className="text-xs sm:text-sm text-gray-500">Aucun type de service disponible</p>
                        </div>
                      ) : (
                        <div className="border border-gray-200 rounded-lg p-2 sm:p-4 bg-white max-h-48 sm:max-h-64 overflow-y-auto">
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {businessTypes.map((businessType) => {
                              const isSelected = selectedBusinessTypes.includes(businessType.id);
                              return (
                                <button
                                  key={businessType.id}
                                  type="button"
                                  onClick={() => handleBusinessTypeToggle(businessType.id)}
                                  disabled={!isEditing}
                                  className={`
                                      relative inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium
                                      transition-all duration-200 ease-in-out
                                      border-2
                                      ${isSelected
                                      ? "bg-[#f08400]/10 border-[#f08400] text-[#f08400] shadow-sm shadow-[#f08400]/20"
                                      : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                                    }
                                      ${!isEditing ? "opacity-60 cursor-not-allowed" : "focus:outline-none focus:ring-2 focus:ring-[#f08400] focus:ring-offset-2 active:scale-95"}
                                    `}
                                >
                                  {isSelected && (
                                    <div className="flex items-center justify-center w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#f08400] text-white">
                                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    </div>
                                  )}
                                  <span>{businessType.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {selectedBusinessTypes.length > 0 && (
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1.5 sm:mt-2">
                          {selectedBusinessTypes.length} service{selectedBusinessTypes.length > 1 ? "s" : ""} sélectionné{selectedBusinessTypes.length > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  )}

                  {isEditing && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-3 sm:pt-4">
                      <Button
                        type="submit"
                        disabled={updateProfile.isPending}
                        className="bg-[#f08400] hover:bg-[#d87200] text-white h-10 sm:h-12 text-xs sm:text-sm"
                      >
                        {updateProfile.isPending ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 animate-spin" />
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                            Enregistrer
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            first_name: user.first_name || "",
                            last_name: user.last_name || "",
                            email: user.email || "",
                            phone: user.phone || "",
                            id_document_number: user.id_document_number || "",
                            date_of_birth: user.date_of_birth ? user.date_of_birth.split('T')[0] : "",
                            address_line1: user.address_line1 || "",
                            address_line2: user.address_line2 || "",
                            postal_code: user.postal_code || "",
                          });
                          // Réinitialiser les business types
                          if (user.businessTypes && user.businessTypes.length > 0) {
                            setSelectedBusinessTypes(user.businessTypes.map(bt => bt.id));
                          } else {
                            setSelectedBusinessTypes([]);
                          }
                        }}
                        className="h-10 sm:h-12 text-xs sm:text-sm"
                      >
                        Annuler
                      </Button>
                    </div>
                  )}
                </form>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Compte */}
        <TabsContent value="account" className="space-y-4 sm:space-y-6 mt-0">
          <Card className="bg-white/90 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/60 hover:shadow-xl transition-all duration-300 overflow-hidden py-0">
            {/* Header compact */}
            <div className="bg-gradient-to-r from-purple-50 via-purple-50/50 to-transparent p-3 sm:p-4 lg:p-5 border-b border-gray-200/50">
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                <div className="p-1.5 sm:p-2 lg:p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl shadow-md">
                  <Shield className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">Informations de compte</h2>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Détails du compte et statuts de vérification</p>
                </div>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="p-3 sm:p-4 lg:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* Type */}
                <div className="p-2.5 sm:p-3 bg-gray-50/50 rounded-lg border border-gray-200/50">
                  <label className="text-[10px] sm:text-xs font-medium text-gray-500 mb-1 sm:mb-1.5 block">Type</label>
                  <div className="mt-1">{getTypeBadge(user.type)}</div>
                </div>

                {/* Rôle */}
                <div className="p-2.5 sm:p-3 bg-gray-50/50 rounded-lg border border-gray-200/50">
                  <label className="text-[10px] sm:text-xs font-medium text-gray-500 mb-1 sm:mb-1.5 block">Rôle</label>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 mt-1">{user.role}</p>
                </div>

                {/* Statut de vérification */}
                <div className="p-2.5 sm:p-3 bg-gray-50/50 rounded-lg border border-gray-200/50">
                  <label className="text-[10px] sm:text-xs font-medium text-gray-500 mb-1 sm:mb-1.5 block">Statut de vérification</label>
                  <div className="mt-1">{getStatusBadge(user.verification_status)}</div>
                </div>

                {/* Niveau de vérification */}
                <div className="p-2.5 sm:p-3 bg-gray-50/50 rounded-lg border border-gray-200/50">
                  <label className="text-[10px] sm:text-xs font-medium text-gray-500 mb-1 sm:mb-1.5 block">Niveau de vérification</label>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 mt-1">{user.verification_level || "N/A"}</p>
                 </div>

                {/* Téléphone vérifié */}
                <div className="p-2.5 sm:p-3 bg-gray-50/50 rounded-lg border border-gray-200/50">
                  <label className="text-[10px] sm:text-xs font-medium text-gray-500 mb-1 sm:mb-1.5 block">Téléphone vérifié</label>
                  <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                    {user.phone_verified ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                        <span className="text-xs sm:text-sm text-green-600 font-semibold">Oui</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
                        <span className="text-xs sm:text-sm text-red-600 font-semibold">Non</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Compte vérifié */}
                <div className="p-2.5 sm:p-3 bg-gray-50/50 rounded-lg border border-gray-200/50">
                  <label className="text-[10px] sm:text-xs font-medium text-gray-500 mb-1 sm:mb-1.5 block">Compte vérifié</label>
                  <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                    {user.is_verified ? (
                      <>
                        <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                        <span className="text-xs sm:text-sm text-green-600 font-semibold">Oui</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                        <span className="text-xs sm:text-sm text-gray-500 font-semibold">Non</span>
                      </>
                    )}
                  </div>
                 </div>
                  
                {/* Premium */}
                <div className="p-2.5 sm:p-3 bg-gray-50/50 rounded-lg border border-gray-200/50">
                  <label className="text-[10px] sm:text-xs font-medium text-gray-500 mb-1 sm:mb-1.5 block">Premium</label>
                  <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                    {user.is_premium ? (
                      <>
                        <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-600 fill-yellow-600" />
                        <span className="text-xs sm:text-sm text-yellow-600 font-semibold">Oui</span>
                      </>
                    ) : (
                      <>
                        <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                        <span className="text-xs sm:text-sm text-gray-500 font-semibold">Non</span>
                      </>
                    )}
                  </div>
                                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Permissions */}
        {isAnyAdmin() && (
          <TabsContent value="permissions" className="space-y-4 sm:space-y-6 mt-0">
            {user.permissions && user.permissions.length > 0 ? (
              <Card className="bg-white/90 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/60 hover:shadow-xl transition-all duration-300 overflow-hidden py-0">
                {/* Header compact */}
                <div className="bg-gradient-to-r from-green-50 via-green-50/50 to-transparent p-3 sm:p-4 lg:p-5 border-b border-gray-200/50">
                  <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                    <div className="p-1.5 sm:p-2 lg:p-2.5 bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl shadow-md">
                      <FileText className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-gray-900">Permissions</h2>
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{user.permissions.length} permission(s) accordée(s)</p>
                    </div>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-3 sm:p-4 lg:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 max-h-[400px] sm:max-h-[600px] overflow-y-auto pr-1 sm:pr-2">
                    {user.permissions.map((permission, index) => (
                      <div
                        key={index}
                        className="px-2.5 sm:px-3 py-2 sm:py-2.5 bg-gradient-to-br from-gray-50 to-white rounded-lg text-[10px] sm:text-xs text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 flex items-center gap-1.5 sm:gap-2"
                      >
                        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600 flex-shrink-0" />
                        <span className="font-medium truncate">{permission}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="bg-white/90 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/60 text-center p-8 sm:p-12">
                <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 sm:mb-2">Aucune permission</h3>
                <p className="text-xs sm:text-sm text-gray-600">Vous n&apos;avez aucune permission assignée.</p>
              </Card>
            )}
          </TabsContent>
        )}


        {/* Verification */}
        {user.type === "OWNER" && (
          <TabsContent value="verification" className="space-y-4 sm:space-y-6 mt-0">
            {isLoadingVerification ? (
              <Card className="bg-white/90 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/60 p-8 sm:p-12">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                  <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-[#f08400]" />
                  <span className="text-xs sm:text-sm text-gray-500 text-center">Chargement des informations de vérification...</span>
                </div>
              </Card>
            ) : (
              <>
                {/* Statut de vérification */}
                <Card className="bg-white/90 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/60 hover:shadow-xl transition-all duration-300 overflow-hidden py-0">
                  <div className="bg-gradient-to-r from-blue-50 via-blue-50/50 to-transparent p-3 sm:p-4 lg:p-5 border-b border-gray-200/50">
                    <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                      <div className="p-1.5 sm:p-2 lg:p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl shadow-md">
                        <ShieldCheck className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-gray-900">Statut de vérification</h2>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Informations sur votre vérification</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 lg:p-6">
                    <div className="space-y-2 sm:space-y-3">
                      {/* Vérification d'identité - Ligne principale - Toujours affichée */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r from-blue-50/50 to-white rounded-lg border border-gray-200/50 hover:border-gray-300 transition-all duration-200">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <label className="text-xs sm:text-sm font-semibold text-gray-900 block truncate">Vérification d&apos;identité pièce d&apos;identité</label>
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                              {(() => {
                                const identityDoc = verificationStatus?.documents?.find(doc => doc.document_type === "IDENTITY");
                                if (identityDoc) {
                                  if (identityDoc.status === "APPROVED") {
                                    return "Vérifiée";
                                  } else if (identityDoc.status === "REJECTED") {
                                    return "Rejetée";
                                  } else {
                                    return "En attente de vérification";
                                  }
                                }
                                return "Non vérifiée";
                              })()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                          {(() => {
                            const identityDoc = verificationStatus?.documents?.find(doc => doc.document_type === "IDENTITY");
                            if (identityDoc) {
                              if (identityDoc.status === "APPROVED") {
                                return (
                                  <Badge className="bg-green-100 text-green-700 border-green-200 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs">
                                    <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 inline" />
                                    Vérifiée
                                  </Badge>
                                );
                              } else if (identityDoc.status === "REJECTED") {
                                return (
                                  <Badge className="bg-red-100 text-red-700 border-red-200 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs">
                                    <XCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 inline" />
                                    Rejetée
                                  </Badge>
                                );
                              } else {
                                return (
                                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs">
                                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 inline" />
                                    En attente
                                  </Badge>
                                );
                              }
                            }
                            return (
                              <Badge className="bg-gray-100 text-gray-700 border-gray-200 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs">
                                <XCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 inline" />
                                Non vérifiée
                              </Badge>
                            );
                          })()}
                          {(() => {
                            const identityDoc = verificationStatus?.documents?.find(doc => doc.document_type === "IDENTITY");
                            if (!identityDoc || identityDoc.status === "REJECTED") {
                              return (
                                <Button
                                  onClick={() => openDocumentDialog("IDENTITY")}
                                  size="sm"
                                  className="bg-[#f08400] hover:bg-[#d87200] text-white h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
                                >
                                  <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                  <span className="hidden sm:inline">Initier la vérification</span>
                                  <span className="sm:hidden">Initier</span>
                                </Button>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>

                      {/* Autres informations en grille - Affichées seulement si verification existe */}
                      {verificationStatus?.verification && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-3 sm:mt-4">
                          <div className="p-2.5 sm:p-4 bg-gray-50/50 rounded-lg border border-gray-200/50">
                            <label className="text-[10px] sm:text-xs font-medium text-gray-500 mb-1 sm:mb-1.5 block">Statut global</label>
                            <div className="mt-1">{getStatusBadge(verificationStatus.verification.verification_status)}</div>
                          </div>

                          <div className="p-2.5 sm:p-4 bg-gray-50/50 rounded-lg border border-gray-200/50">
                            <label className="text-[10px] sm:text-xs font-medium text-gray-500 mb-1 sm:mb-1.5 block">Niveau de vérification</label>
                            <p className="text-xs sm:text-sm font-semibold text-gray-900 mt-1">
                              {verificationStatus.verification.verification_level || "N/A"}
                            </p>
                          </div>

                          <div className="p-2.5 sm:p-4 bg-gray-50/50 rounded-lg border border-gray-200/50">
                            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Téléphone vérifié</label>
                            <div className="flex items-center gap-2 mt-1">
                              {verificationStatus.verification.phone_verified ? (
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

                          {verificationStatus.verification.phone_verified_at && (
                            <div className="p-4 bg-gray-50/50 rounded-lg border border-gray-200/50">
                              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Date de vérification téléphone</label>
                              <p className="text-sm font-semibold text-gray-900 mt-1">
                                {new Date(verificationStatus.verification.phone_verified_at).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          )}

                          {verificationStatus.verification.verified_at && (
                            <div className="p-4 bg-gray-50/50 rounded-lg border border-gray-200/50">
                              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Date de vérification</label>
                              <p className="text-sm font-semibold text-gray-900 mt-1">
                                {new Date(verificationStatus.verification.verified_at).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          )}

                          <div className="p-4 bg-gray-50/50 rounded-lg border border-gray-200/50">
                            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Assurance</label>
                            <div className="flex items-center gap-2 mt-1">
                              {verificationStatus.verification.has_insurance ? (
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

                          {verificationStatus.verification.security_deposit !== null && verificationStatus.verification.security_deposit !== undefined && (
                            <div className="p-4 bg-gray-50/50 rounded-lg border border-gray-200/50">
                              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Dépôt de garantie</label>
                              <p className="text-sm font-semibold text-gray-900 mt-1">
                                {verificationStatus.verification.security_deposit.toFixed(2)} €
                              </p>
                            </div>
                          )}

                          {verificationStatus.verification.reputation_score !== undefined && verificationStatus.verification.reputation_score !== null && (
                            <div className="p-4 bg-gray-50/50 rounded-lg border border-gray-200/50">
                              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Score de réputation</label>
                              <p className="text-sm font-semibold text-gray-900 mt-1">
                                {verificationStatus.verification.reputation_score.toFixed(2)}
                              </p>
                            </div>
                          )}

                          {verificationStatus.verification.admin_notes && (
                            <div className="p-4 bg-gray-50/50 rounded-lg border border-gray-200/50 md:col-span-2 lg:col-span-3">
                              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Notes administrateur</label>
                              <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
                                {verificationStatus.verification.admin_notes}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

              </>
            )}

            {/* Dialog pour soumettre un document */}
            <DocumentVerificationModal
              open={isDocumentModalOpen}
              onOpenChange={setIsDocumentModalOpen}
              onSubmit={handleDocumentSubmit}
              defaultDocumentType={defaultDocumentType}
              isLoading={submitDocument.isPending}
            />
          </TabsContent>
        )}

      </Tabs>
    </div>
  );
}
