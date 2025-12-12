"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Home,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { AddButton } from "@/components/admin/shared/AddButton";
import { usePermissions } from "@/hooks/use-permissions";
import { useAuth } from "@/context/AuthContext";
import {
  useDwellings,
  useDeleteDwelling,
  type Dwelling,
} from "@/hooks/use-dwellings";
import {
  useVisits,
} from "@/hooks/use-visits";
import { DwellingTable } from "@/components/admin/hebergements/DwellingTable";
import { VisitTable } from "@/components/admin/hebergements/VisitTable";
import { DeleteConfirmationDialog } from "@/components/admin/shared/DeleteConfirmationDialog";

export default function HebergementsPage() {
  const router = useRouter();
  const { isOwner } = usePermissions();
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

  // Visits - TanStack Query
  const [visitsPage] = useState(1);
  const { 
    data: visitsData,
    isLoading: isLoadingVisits,
    refetch: refetchVisits,
    isRefetching: isRefetchingVisits,
  } = useVisits(visitsPage);
  const visits = visitsData?.data || [];

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
      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
        <Tabs defaultValue="visits" className="w-full">
          <div className="relative mb-6 pb-4">
            <TabsList className="inline-flex h-auto bg-transparent p-0 gap-0">
              <TabsTrigger
                value="visits"
                className="data-[state=active]:bg-[#f08400]/10 data-[state=active]:text-[#f08400] text-gray-600 rounded-none px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-center relative border-b-2 border-transparent data-[state=active]:!border-[#f08400] hover:text-gray-900 hover:bg-gray-50 data-[state=active]:border-b-2"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Visites
              </TabsTrigger>
              <TabsTrigger
                value="hebergements"
                className="data-[state=active]:bg-[#f08400]/10 data-[state=active]:text-[#f08400] text-gray-600 rounded-none px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-center relative border-b-2 border-transparent data-[state=active]:!border-[#f08400] hover:text-gray-900 hover:bg-gray-50 data-[state=active]:border-b-2"
              >
                <Home className="w-4 h-4 mr-2" />
                Hébergement
              </TabsTrigger>
            </TabsList>
            <div className="absolute bottom-0 left-0 right-0 border-b-2 border-gray-300"></div>
          </div>

          {/* Visits Tab */}
          <TabsContent value="visits" className="space-y-6">
            {/* Visits Table */}
            {isLoadingVisits ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 animate-spin text-[#f08400] mb-4" />
                <p className="text-gray-500 text-sm">Chargement des visites...</p>
              </div>
            ) : (
              <VisitTable
                data={visits}
                isLoading={isLoadingVisits}
                onRefresh={() => refetchVisits()}
                isRefreshing={isRefetchingVisits}
              />
            )}
          </TabsContent>

          {/* Hébergements Tab */}
          <TabsContent value="hebergements" className="space-y-6">
        {/* Alerte pour les propriétaires non vérifiés */}
        {isOwner() && !isOwnerApproved && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
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
              <AddButton
                onClick={handleCreateDwelling}
                label="Ajouter un hébergement"
                isLoading={isLoadingDwellings}
                disabled={isLoadingDwellings || (isOwner() && !isOwnerApproved)}
                title={isOwner() && !isOwnerApproved ? "Votre compte doit être vérifié pour ajouter un hébergement" : undefined}
              />
            }
          />
        )}

            {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDwellingDeleteDialogOpen}
        onOpenChange={setIsDwellingDeleteDialogOpen}
        onConfirm={handleConfirmDwellingDelete}
        title="Supprimer l'hébergement"
        description="Êtes-vous sûr de vouloir supprimer cet hébergement ? Cette action ne peut pas être annulée."
        itemName={dwellingToDelete?.description || `Hébergement #${dwellingToDelete?.id}`}
        isLoading={deleteDwellingMutation.isPending}
      />
          </TabsContent>
        </Tabs>
      </div>

    </div>
  );
}

