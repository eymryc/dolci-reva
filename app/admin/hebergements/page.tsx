"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Home,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import { useAuth } from "@/context/AuthContext";
import {
  useDwellings,
  useDeleteDwelling,
  type Dwelling,
} from "@/hooks/use-dwellings";
import { DwellingTable } from "@/components/admin/hebergements/DwellingTable";
import { DeleteConfirmationDialog } from "@/components/admin/shared/DeleteConfirmationDialog";

export default function HebergementsPage() {
  const router = useRouter();
  const { isAnyAdmin, isOwner } = usePermissions();
  const { user } = useAuth();
  
  // Vérifier le statut de vérification pour les propriétaires
  // Utiliser directement user.verification_status depuis le contexte d'authentification
  const verificationStatus = user?.verification_status?.trim().toUpperCase();
  const isOwnerVerified = verificationStatus === "APPROVED";
  const isOwnerApproved = isOwner() 
    ? isOwnerVerified
    : true; // Les admins peuvent toujours ajouter des hébergements
  
  // Dwellings - TanStack Query
  const { 
    data: dwellings = [], 
    isLoading: isLoadingDwellings,
    refetch: refetchDwellings,
    isRefetching: isRefetchingDwellings,
  } = useDwellings();
  const deleteDwellingMutation = useDeleteDwelling();

  // Dwellings State
  const [isDwellingDeleteDialogOpen, setIsDwellingDeleteDialogOpen] = useState(false);
  const [dwellingToDelete, setDwellingToDelete] = useState<Dwelling | null>(null);

  // Dwelling Handlers
  const handleCreateDwelling = () => {
    router.push("/admin/hebergements/new");
  };

  const handleEditDwelling = (dwelling: Dwelling) => {
    router.push(`/admin/hebergements/${dwelling.id}/edit`);
  };

  const handleDeleteDwelling = (dwelling: Dwelling) => {
    setDwellingToDelete(dwelling);
    setIsDwellingDeleteDialogOpen(true);
  };

  const handleConfirmDwellingDelete = () => {
    if (dwellingToDelete) {
      deleteDwellingMutation.mutate(dwellingToDelete.id, {
        onSuccess: () => {
          setIsDwellingDeleteDialogOpen(false);
          setDwellingToDelete(null);
        },
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#f08400] rounded-xl shadow-lg">
              <Home className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-[#101828]">
              Hébergement
            </h1>
          </div>
          <p className="text-gray-500 text-sm ml-14">
            {isAnyAdmin() 
              ? "Gérez les hébergements" 
              : isOwner() 
                ? "Gérez vos hébergements"
                : "Gérez vos hébergements"}
          </p>
        </div>
      </div>

      {/* Hébergement Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
        {/* Alerte pour les propriétaires non vérifiés */}
        {isOwner() && !isOwnerApproved && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                  Vérification requise
                </h3>
                <p className="text-sm text-yellow-700">
                  Votre compte doit être vérifié et approuvé avant de pouvoir ajouter un hébergement. 
                  Veuillez compléter votre vérification dans votre profil.
                </p>
                <Button
                  variant="link"
                  className="mt-2 p-0 h-auto text-yellow-800 hover:text-yellow-900 underline"
                  onClick={() => router.push("/admin/profile?tab=verification")}
                >
                  Vérifier mon compte
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Hébergement Table */}
        {isLoadingDwellings ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 animate-spin text-[#f08400] mb-4" />
            <p className="text-gray-500 text-sm">Chargement des hébergements...</p>
          </div>
        ) : (
          <DwellingTable
            data={dwellings}
            onEdit={handleEditDwelling}
            onDelete={handleDeleteDwelling}
            isLoading={deleteDwellingMutation.isPending}
            onRefresh={() => refetchDwellings()}
            isRefreshing={isRefetchingDwellings}
            addButton={
              <Button
                onClick={handleCreateDwelling}
                className="bg-[#f08400] hover:bg-[#d87200] text-white shadow-lg h-10 sm:h-12 hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed px-2 sm:px-4"
                disabled={isLoadingDwellings || (isOwner() && !isOwnerApproved)}
                title={isOwner() && !isOwnerApproved ? "Votre compte doit être vérifié pour ajouter un hébergement" : undefined}
              >
                {isLoadingDwellings ? (
                  <Loader2 className="w-4 h-4 sm:mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 sm:mr-2" />
                )}
                <span className="hidden sm:inline">Ajouter un hébergement</span>
              </Button>
            }
          />
        )}
      </div>

      {/* Delete Hébergement Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDwellingDeleteDialogOpen}
        onOpenChange={setIsDwellingDeleteDialogOpen}
        onConfirm={handleConfirmDwellingDelete}
        title="Supprimer l'hébergement"
        description="Êtes-vous sûr de vouloir supprimer cet hébergement ? Cette action ne peut pas être annulée."
        itemName={dwellingToDelete?.description || `Hébergement #${dwellingToDelete?.id}`}
        isLoading={deleteDwellingMutation.isPending}
      />
    </div>
  );
}

