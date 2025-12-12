"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { usePermissions } from "@/hooks/use-permissions";
import { useAuth } from "@/context/AuthContext";
import {
  Building2,
  Sparkles,
  DollarSign,
  Loader2,
} from "lucide-react";
import { AddButton } from "@/components/admin/shared/AddButton";
import {
  useBusinessTypes,
  useCreateBusinessType,
  useUpdateBusinessType,
  useDeleteBusinessType,
  type BusinessType,
  type BusinessTypeFormData,
} from "@/hooks/use-business-types";
import {
  useAmenities,
  useCreateAmenity,
  useUpdateAmenity,
  useDeleteAmenity,
  type Amenity,
  type AmenityFormData,
} from "@/hooks/use-amenities";
import {
  useCommissions,
  useCreateCommission,
  useUpdateCommission,
  useDeleteCommission,
  type Commission,
  type CommissionFormData,
} from "@/hooks/use-commissions";
import { BusinessTypeTable } from "@/components/admin/business-types/BusinessTypeTable";
import { BusinessTypeModal } from "@/components/admin/business-types/BusinessTypeModal";
import { AmenityTable } from "@/components/admin/amenities/AmenityTable";
import { AmenityModal } from "@/components/admin/amenities/AmenityModal";
import { CommissionTable } from "@/components/admin/commissions/CommissionTable";
import { CommissionModal } from "@/components/admin/commissions/CommissionModal";
import { DeleteConfirmationDialog } from "@/components/admin/shared/DeleteConfirmationDialog";

export default function SettingsPage() {
  const router = useRouter();
  const { isAnyAdmin } = usePermissions();
  const { loading } = useAuth();

  // Business Types - TanStack Query
  const { 
    data: businessTypes = [], 
    isLoading: isLoadingBusinessTypes,
    refetch: refetchBusinessTypes,
    isRefetching: isRefetchingBusinessTypes,
  } = useBusinessTypes();
  const createMutation = useCreateBusinessType();
  const updateMutation = useUpdateBusinessType();
  const deleteMutation = useDeleteBusinessType();

  // Business Types State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBusinessType, setEditingBusinessType] = useState<BusinessType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [businessTypeToDelete, setBusinessTypeToDelete] = useState<BusinessType | null>(null);

  // Amenities - TanStack Query
  const { 
    data: amenities = [], 
    isLoading: isLoadingAmenities,
    refetch: refetchAmenities,
    isRefetching: isRefetchingAmenities,
  } = useAmenities();
  const createAmenityMutation = useCreateAmenity();
  const updateAmenityMutation = useUpdateAmenity();
  const deleteAmenityMutation = useDeleteAmenity();

  // Amenities State
  const [isAmenityModalOpen, setIsAmenityModalOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [isAmenityDeleteDialogOpen, setIsAmenityDeleteDialogOpen] = useState(false);
  const [amenityToDelete, setAmenityToDelete] = useState<Amenity | null>(null);

  // Commissions - TanStack Query
  const { 
    data: commissions = [], 
    isLoading: isLoadingCommissions,
    refetch: refetchCommissions,
    isRefetching: isRefetchingCommissions,
  } = useCommissions();
  const createCommissionMutation = useCreateCommission();
  const updateCommissionMutation = useUpdateCommission();
  const deleteCommissionMutation = useDeleteCommission();

  // Commissions State
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [editingCommission, setEditingCommission] = useState<Commission | null>(null);
  const [isCommissionDeleteDialogOpen, setIsCommissionDeleteDialogOpen] = useState(false);
  const [commissionToDelete, setCommissionToDelete] = useState<Commission | null>(null);

  // Rediriger si l'utilisateur n'est pas un admin
  useEffect(() => {
    if (!loading && !isAnyAdmin()) {
      router.push("/admin/dashboard");
    }
  }, [loading, isAnyAdmin, router]);

  // Afficher un loader pendant la vérification des permissions
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-12 h-12 border-4 border-[#f08400] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 text-sm">Vérification des permissions...</p>
      </div>
    );
  }

  // Si l'utilisateur n'est pas un admin, ne rien afficher (redirection en cours)
  if (!isAnyAdmin()) {
    return null;
  }

  // Business Type Handlers
  const handleCreateBusinessType = () => {
    setEditingBusinessType(null);
    setIsModalOpen(true);
  };

  const handleEditBusinessType = (businessType: BusinessType) => {
    setEditingBusinessType(businessType);
    setIsModalOpen(true);
  };

  const handleSubmitBusinessType = (data: BusinessTypeFormData) => {
    if (editingBusinessType) {
      updateMutation.mutate(
        { id: editingBusinessType.id, data },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setEditingBusinessType(null);
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          setIsModalOpen(false);
        },
      });
    }
  };

  const handleDeleteBusinessType = (businessType: BusinessType) => {
    setBusinessTypeToDelete(businessType);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (businessTypeToDelete) {
      deleteMutation.mutate(businessTypeToDelete.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setBusinessTypeToDelete(null);
        },
      });
    }
  };

  // Amenity Handlers
  const handleCreateAmenity = () => {
    setEditingAmenity(null);
    setIsAmenityModalOpen(true);
  };

  const handleEditAmenity = (amenity: Amenity) => {
    setEditingAmenity(amenity);
    setIsAmenityModalOpen(true);
  };

  const handleSubmitAmenity = (data: AmenityFormData) => {
    if (editingAmenity) {
      updateAmenityMutation.mutate(
        { id: editingAmenity.id, data },
        {
          onSuccess: () => {
            setIsAmenityModalOpen(false);
            setEditingAmenity(null);
          },
        }
      );
    } else {
      createAmenityMutation.mutate(data, {
        onSuccess: () => {
          setIsAmenityModalOpen(false);
        },
      });
    }
  };

  const handleDeleteAmenity = (amenity: Amenity) => {
    setAmenityToDelete(amenity);
    setIsAmenityDeleteDialogOpen(true);
  };

  const handleConfirmAmenityDelete = () => {
    if (amenityToDelete) {
      deleteAmenityMutation.mutate(amenityToDelete.id, {
        onSuccess: () => {
          setIsAmenityDeleteDialogOpen(false);
          setAmenityToDelete(null);
        },
      });
    }
  };

  // Commission Handlers
  const handleCreateCommission = () => {
    setEditingCommission(null);
    setIsCommissionModalOpen(true);
  };

  const handleEditCommission = (commission: Commission) => {
    setEditingCommission(commission);
    setIsCommissionModalOpen(true);
  };

  const handleSubmitCommission = (data: CommissionFormData) => {
    // console.log(editingCommission);
    if (editingCommission) {
      updateCommissionMutation.mutate(
        { id: editingCommission.id, data },
        {
          onSuccess: () => {
            setIsCommissionModalOpen(false);
            setEditingCommission(null);
          },
        }
      );
    } else {
      createCommissionMutation.mutate(data, {
        onSuccess: () => {
          setIsCommissionModalOpen(false);
        },
      });
    }
  };

  const handleDeleteCommission = (commission: Commission) => {
    setCommissionToDelete(commission);
    setIsCommissionDeleteDialogOpen(true);
  };

  const handleConfirmCommissionDelete = () => {
    if (commissionToDelete) {
      deleteCommissionMutation.mutate(commissionToDelete.id, {
        onSuccess: () => {
          setIsCommissionDeleteDialogOpen(false);
          setCommissionToDelete(null);
        },
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
        <Tabs defaultValue="business-type" className="w-full">
          <div className="relative mb-6 pb-4">
            <TabsList className="inline-flex h-auto bg-transparent p-0 gap-0">
              <TabsTrigger
                value="business-type"
                className="data-[state=active]:bg-[#f08400]/10 data-[state=active]:text-[#f08400] text-gray-600 rounded-none px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-center relative border-b-2 border-transparent data-[state=active]:!border-[#f08400] hover:text-gray-900 hover:bg-gray-50 data-[state=active]:border-b-2"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Business Type
              </TabsTrigger>
              <TabsTrigger
                value="commodity"
                className="data-[state=active]:bg-[#f08400]/10 data-[state=active]:text-[#f08400] text-gray-600 rounded-none px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-center relative border-b-2 border-transparent data-[state=active]:!border-[#f08400] hover:text-gray-900 hover:bg-gray-50 data-[state=active]:border-b-2"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Commodité
              </TabsTrigger>
              <TabsTrigger
                value="commission"
                className="data-[state=active]:bg-[#f08400]/10 data-[state=active]:text-[#f08400] text-gray-600 rounded-none px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-center relative border-b-2 border-transparent data-[state=active]:!border-[#f08400] hover:text-gray-900 hover:bg-gray-50 data-[state=active]:border-b-2"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Commission
              </TabsTrigger>
            </TabsList>
            <div className="absolute bottom-0 left-0 right-0 border-b-2 border-gray-300"></div>
          </div>

          {/* Business Type Tab */}
          <TabsContent value="business-type" className="space-y-6">

            {/* Business Types Table */}
            {isLoadingBusinessTypes ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 animate-spin text-[#f08400] mb-4" />
                <p className="text-gray-500 text-sm">Chargement des types de business...</p>
              </div>
            ) : (
              <BusinessTypeTable
                data={businessTypes}
                onEdit={handleEditBusinessType}
                onDelete={handleDeleteBusinessType}
                isLoading={deleteMutation.isPending || updateMutation.isPending}
                onRefresh={() => refetchBusinessTypes()}
                isRefreshing={isRefetchingBusinessTypes}
                addButton={
                  <AddButton
                    onClick={handleCreateBusinessType}
                    label="Ajouter un type de business"
                    isLoading={isLoadingBusinessTypes}
                    disabled={isLoadingBusinessTypes}
                  />
                }
              />
            )}

            {/* Business Type Modal */}
            <BusinessTypeModal
              open={isModalOpen}
              onOpenChange={setIsModalOpen}
              onSubmit={handleSubmitBusinessType}
              businessType={editingBusinessType}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
              onConfirm={handleConfirmDelete}
              title="Supprimer le type de business"
              description="Êtes-vous sûr de vouloir supprimer ce type de business ? Cette action ne peut pas être annulée."
              itemName={businessTypeToDelete?.name}
              isLoading={deleteMutation.isPending}
            />
          </TabsContent>

          {/* Commodity Tab */}
          <TabsContent value="commodity" className="space-y-6">
            {/* Amenities Table */}
            {isLoadingAmenities ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 animate-spin text-[#f08400] mb-4" />
                <p className="text-gray-500 text-sm">Chargement des commodités...</p>
              </div>
            ) : (
              <AmenityTable
                data={amenities}
                onEdit={handleEditAmenity}
                onDelete={handleDeleteAmenity}
                isLoading={deleteAmenityMutation.isPending || updateAmenityMutation.isPending}
                onRefresh={() => refetchAmenities()}
                isRefreshing={isRefetchingAmenities}
                addButton={
                  <AddButton
                    onClick={handleCreateAmenity}
                    label="Ajouter une commodité"
                    isLoading={isLoadingAmenities}
                    disabled={isLoadingAmenities}
                  />
                }
              />
            )}

            {/* Amenity Modal */}
            <AmenityModal
              open={isAmenityModalOpen}
              onOpenChange={setIsAmenityModalOpen}
              onSubmit={handleSubmitAmenity}
              amenity={editingAmenity}
              isLoading={createAmenityMutation.isPending || updateAmenityMutation.isPending}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
              open={isAmenityDeleteDialogOpen}
              onOpenChange={setIsAmenityDeleteDialogOpen}
              onConfirm={handleConfirmAmenityDelete}
              title="Supprimer la commodité"
              description="Êtes-vous sûr de vouloir supprimer cette commodité ? Cette action ne peut pas être annulée."
              itemName={amenityToDelete?.name}
              isLoading={deleteAmenityMutation.isPending}
            />
          </TabsContent>

          {/* Commission Tab */}
          <TabsContent value="commission" className="space-y-6">
            {/* Commissions Table */}
            {isLoadingCommissions ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 animate-spin text-[#f08400] mb-4" />
                <p className="text-gray-500 text-sm">Chargement des commissions...</p>
              </div>
            ) : (
              <CommissionTable
                data={commissions}
                onEdit={handleEditCommission}
                onDelete={handleDeleteCommission}
                isLoading={deleteCommissionMutation.isPending || updateCommissionMutation.isPending}
                onRefresh={() => refetchCommissions()}
                isRefreshing={isRefetchingCommissions}
                addButton={
                  <AddButton
                    onClick={handleCreateCommission}
                    label="Ajouter une commission"
                    isLoading={isLoadingCommissions}
                    disabled={isLoadingCommissions}
                  />
                }
              />
            )}

            {/* Commission Modal */}
            <CommissionModal
              open={isCommissionModalOpen}
              onOpenChange={setIsCommissionModalOpen}
              onSubmit={handleSubmitCommission}
              commission={editingCommission}
              isLoading={createCommissionMutation.isPending || updateCommissionMutation.isPending}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
              open={isCommissionDeleteDialogOpen}
              onOpenChange={setIsCommissionDeleteDialogOpen}
              onConfirm={handleConfirmCommissionDelete}
              title="Supprimer la commission"
              description="Êtes-vous sûr de vouloir supprimer cette commission ? Cette action ne peut pas être annulée."
              itemName={commissionToDelete ? `${commissionToDelete.commission}%` : undefined}
              isLoading={deleteCommissionMutation.isPending}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
