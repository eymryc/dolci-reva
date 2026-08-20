"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Coffee,
  Loader2,
  Calendar,
  FolderTree,
  List,
} from "lucide-react";
import { toast } from "sonner";
import { AddButton } from "@/components/admin/shared/AddButton";
import { usePermissions } from "@/hooks/use-permissions";
import { useAuth } from "@/context/AuthContext";
import {
  useNightlifeVenues,
  useDeleteNightlifeVenue,
  useAllNightlifeVenueProductCategories,
  useAllNightlifeVenueProducts,
  useDeleteNightlifeVenueProductCategory,
  useDeleteNightlifeVenueProduct,
  useCreateNightlifeVenueProductCategory,
  useUpdateNightlifeVenueProductCategory,
  useCreateNightlifeVenueProduct,
  useUpdateNightlifeVenueProduct,
  type NightlifeVenue,
  type NightlifeVenueProductCategory,
  type NightlifeVenueProduct,
  type NightlifeVenueProductCategoryFormData,
  type NightlifeVenueProductFormData,
} from "@/hooks/use-nightlife-venues";
import {
  useBookings,
  useDeleteBooking,
  useCancelBooking,
  type Booking,
} from "@/hooks/use-bookings";
import { LoungeTable } from "@/components/admin/lounges/LoungeTable";
import { LoungeProductCategoryTable } from "@/components/admin/lounges/LoungeProductCategoryTable";
import { LoungeProductTable } from "@/components/admin/lounges/LoungeProductTable";
import { BookingTable } from "@/components/admin/bookings/BookingTable";
import { DeleteConfirmationDialog } from "@/components/admin/shared/DeleteConfirmationDialog";
import { LoungeProductCategoryModal } from "@/components/admin/lounges/LoungeProductCategoryModal";
import { LoungeProductModal } from "@/components/admin/lounges/LoungeProductModal";
import { HostPageHeader } from "@/components/admin/host/HostPageHeader";
import { OwnerEstablishmentGallery } from "@/components/admin/host/OwnerEstablishmentGallery";
import { HostShell } from "@/components/admin/host/HostShell";
import type { EstablishmentCardData } from "@/components/admin/host/EstablishmentCard";
import { useBackofficePath } from "@/hooks/use-host-view";

function toLoungeCard(
  lounge: NightlifeVenue,
  path: (p: string) => string
): EstablishmentCardData {
  return {
    id: lounge.id,
    name: lounge.name,
    href: path(`/lounges/${lounge.id}`),
    imageUrl: lounge.main_image_url || lounge.main_image_thumb_url,
    location: [lounge.city, lounge.country].filter(Boolean).join(", "),
    status: lounge.is_active ? "available" : "inactive",
    statusLabel: lounge.is_active ? "Actif" : "Inactif",
  };
}

export default function LoungesPage() {
  const bo = useBackofficePath();
  const router = useRouter();
  const { isOwner, isAnyAdmin } = usePermissions();
  const { user } = useAuth();
  const isHostView = isOwner() && !isAnyAdmin();

  const verificationStatus = user?.verification_status?.trim().toUpperCase();
  const isOwnerVerified = verificationStatus === "APPROVED";
  const isOwnerApproved = isOwner() ? isOwnerVerified : true;

  const [search, setSearch] = useState("");

  // Lounges - TanStack Query
  const { 
    data: lounges = [], 
    isLoading: isLoadingLounges,
    refetch: refetchLounges,
    isRefetching: isRefetchingLounges,
  } = useNightlifeVenues();
  const deleteLoungeMutation = useDeleteNightlifeVenue();

  // Lounges State
  const [isLoungeDeleteDialogOpen, setIsLoungeDeleteDialogOpen] = useState(false);
  const [loungeToDelete, setLoungeToDelete] = useState<NightlifeVenue | null>(null);

  const filteredCards = useMemo(() => {
    const q = search.trim().toLowerCase();
    return lounges
      .filter((l) => {
        if (!q) return true;
        return (
          l.name.toLowerCase().includes(q) ||
          l.city?.toLowerCase().includes(q) ||
          l.address?.toLowerCase().includes(q)
        );
      })
      .map((l) => toLoungeCard(l, bo));
  }, [lounges, search, bo]);

  // Bookings - TanStack Query
  const { 
    data: bookingsResponse, 
    isLoading: isLoadingBookings,
    refetch: refetchBookings,
    isRefetching: isRefetchingBookings,
  } = useBookings(1);
  const bookings = bookingsResponse?.data || [];
  const deleteBookingMutation = useDeleteBooking();
  const cancelBookingMutation = useCancelBooking();

  // Bookings State
  const [isBookingDeleteDialogOpen, setIsBookingDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [isBookingCancelDialogOpen, setIsBookingCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

  // Lounge Product Categories - TanStack Query
  const { 
    data: venueProductCategories = [], 
    isLoading: isLoadingVenueProductCategories,
    refetch: refetchVenueProductCategories,
    isRefetching: isRefetchingVenueProductCategories,
  } = useAllNightlifeVenueProductCategories();
  const createVenueProductCategoryMutation = useCreateNightlifeVenueProductCategory();
  const updateVenueProductCategoryMutation = useUpdateNightlifeVenueProductCategory();
  const deleteVenueProductCategoryMutation = useDeleteNightlifeVenueProductCategory();

  // Menu Categories State
  const [isLoungeProductCategoryModalOpen, setIsLoungeProductCategoryModalOpen] = useState(false);
  const [editingVenueProductCategory, setEditingVenueProductCategory] = useState<NightlifeVenueProductCategory | null>(null);
  const [isLoungeProductCategoryDeleteDialogOpen, setIsLoungeProductCategoryDeleteDialogOpen] = useState(false);
  const [venueProductCategoryToDelete, setVenueProductCategoryToDelete] = useState<NightlifeVenueProductCategory | null>(null);

  // Menu Items - TanStack Query
  const { 
    data: venueProducts = [], 
    isLoading: isLoadingVenueProducts,
    refetch: refetchVenueProducts,
    isRefetching: isRefetchingVenueProducts,
  } = useAllNightlifeVenueProducts();
  const createVenueProductMutation = useCreateNightlifeVenueProduct();
  const updateVenueProductMutation = useUpdateNightlifeVenueProduct();
  const deleteVenueProductMutation = useDeleteNightlifeVenueProduct();

  // Menu Items State
  const [isVenueProductModalOpen, setIsVenueProductModalOpen] = useState(false);
  const [editingVenueProduct, setEditingVenueProduct] = useState<NightlifeVenueProduct | null>(null);
  const [isVenueProductDeleteDialogOpen, setIsVenueProductDeleteDialogOpen] = useState(false);
  const [venueProductToDelete, setVenueProductToDelete] = useState<NightlifeVenueProduct | null>(null);

  // Lounge Handlers
  const handleCreateLounge = () => {
    router.push(bo("/lounges/new"));
  };

  const handleEditLounge = (lounge: NightlifeVenue) => {
    router.push(bo(`/lounges/${lounge.id}/edit`));
  };

  const handleDeleteLounge = (lounge: NightlifeVenue) => {
    setLoungeToDelete(lounge);
    setIsLoungeDeleteDialogOpen(true);
  };

  const handleConfirmLoungeDelete = () => {
    if (loungeToDelete) {
      deleteLoungeMutation.mutate(loungeToDelete.id, {
        onSuccess: () => {
          setIsLoungeDeleteDialogOpen(false);
          setLoungeToDelete(null);
        },
      });
    }
  };

  if (isHostView) {
    return (
      <HostShell>
        <div className="mx-auto w-full max-w-6xl">
          <HostPageHeader
            eyebrow="Espace hôte"
            title="Lounges"
            description="Gérez vos espaces lounge — ouvrez une fiche pour le détail."
            count={filteredCards.length}
            countLabel={{ singular: "lounge", plural: "lounges" }}
            actionLabel="Ajouter un lounge"
            onAction={handleCreateLounge}
            actionDisabled={isLoadingLounges || !isOwnerApproved}
            actionTitle={
              !isOwnerApproved
                ? "Votre compte doit être vérifié pour ajouter un lounge"
                : undefined
            }
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Rechercher un lounge…"
          />

          <div className="mt-8">
            <OwnerEstablishmentGallery
              items={filteredCards}
              isLoading={isLoadingLounges}
              emptyTitle="Votre premier lounge vous attend"
              emptyDescription="Ajoutez un espace pour commencer à recevoir vos clients sur Dolci Rêva."
              onEdit={(id) => router.push(bo(`/lounges/${id}/edit`))}
              onDelete={(id) => {
                const l = lounges.find((x) => x.id === id);
                if (l) handleDeleteLounge(l);
              }}
            />
          </div>
        </div>
        <DeleteConfirmationDialog
          open={isLoungeDeleteDialogOpen}
          onOpenChange={setIsLoungeDeleteDialogOpen}
          onConfirm={handleConfirmLoungeDelete}
          title="Supprimer le lounge"
          description="Êtes-vous sûr de vouloir supprimer ce lounge ? Cette action ne peut pas être annulée."
          itemName={loungeToDelete?.name}
          isLoading={deleteLoungeMutation.isPending}
        />
      </HostShell>
    );
  }

  // Booking Handlers
  const handleCancelBooking = (booking: Booking) => {
    setBookingToCancel(booking);
    setIsBookingCancelDialogOpen(true);
  };

  const handleConfirmBookingCancel = () => {
    if (bookingToCancel) {
      cancelBookingMutation.mutate(
        { id: bookingToCancel.id },
        {
          onSuccess: () => {
            setIsBookingCancelDialogOpen(false);
            setBookingToCancel(null);
          },
        }
      );
    }
  };

  const handleDeleteBooking = (booking: Booking) => {
    setBookingToDelete(booking);
    setIsBookingDeleteDialogOpen(true);
  };

  const handleConfirmBookingDelete = () => {
    if (bookingToDelete) {
      deleteBookingMutation.mutate(bookingToDelete.id, {
        onSuccess: () => {
          setIsBookingDeleteDialogOpen(false);
          setBookingToDelete(null);
        },
      });
    }
  };

  // Menu Category Handlers
  const handleCreateLoungeProductCategory = () => {
    setEditingVenueProductCategory(null);
    setIsLoungeProductCategoryModalOpen(true);
  };

  const handleEditLoungeProductCategory = (category: NightlifeVenueProductCategory) => {
    setEditingVenueProductCategory(category);
    setIsLoungeProductCategoryModalOpen(true);
  };

  const handleSubmitLoungeProductCategory = (data: NightlifeVenueProductCategoryFormData) => {
    if (editingVenueProductCategory) {
      // Pour la mise à jour, utiliser en priorité venue_id (fallback lounge_id pour compat)
      const venueId = editingVenueProductCategory.venue_id ?? editingVenueProductCategory.lounge_id;
      if (!venueId) {
        toast.error("Impossible de déterminer l'espace pour la mise à jour");
        return;
      }
      updateVenueProductCategoryMutation.mutate(
        {
          loungeId: venueId,
          categoryId: editingVenueProductCategory.id,
          data,
        },
        {
          onSuccess: () => {
            setIsLoungeProductCategoryModalOpen(false);
            setEditingVenueProductCategory(null);
          },
        }
      );
    } else {
      // Pour la création, utiliser le premier lounge de l'utilisateur
      if (!lounges || lounges.length === 0) {
        toast.error("Vous devez d'abord créer un espace");
        return;
      }
      const firstVenueId = lounges[0].id;
      createVenueProductCategoryMutation.mutate(
        {
          loungeId: firstVenueId,
          data,
        },
        {
          onSuccess: () => {
            setIsLoungeProductCategoryModalOpen(false);
          },
        }
      );
    }
  };

  const handleDeleteLoungeProductCategory = (category: NightlifeVenueProductCategory) => {
    setVenueProductCategoryToDelete(category);
    setIsLoungeProductCategoryDeleteDialogOpen(true);
  };

  const handleConfirmLoungeProductCategoryDelete = () => {
    if (venueProductCategoryToDelete) {
      const venueId = venueProductCategoryToDelete.venue_id ?? venueProductCategoryToDelete.lounge_id;
      if (!venueId) {
        toast.error("Impossible de déterminer l'espace pour cette catégorie.");
        return;
      }
      deleteVenueProductCategoryMutation.mutate(
        {
          loungeId: venueId,
          categoryId: venueProductCategoryToDelete.id,
        },
        {
          onSuccess: () => {
            setIsLoungeProductCategoryDeleteDialogOpen(false);
            setVenueProductCategoryToDelete(null);
          },
        }
      );
    }
  };

  // Menu Item Handlers
  const handleCreateVenueProduct = () => {
    setEditingVenueProduct(null);
    setIsVenueProductModalOpen(true);
  };

  const handleEditVenueProduct = (item: NightlifeVenueProduct) => {
    setEditingVenueProduct(item);
    setIsVenueProductModalOpen(true);
  };

  const handleSubmitVenueProduct = (data: NightlifeVenueProductFormData, images?: { mainImage?: File | null; galleryImages?: File[] }) => {
    if (editingVenueProduct) {
      updateVenueProductMutation.mutate(
        {
          loungeId: editingVenueProduct.lounge_id,
          productId: editingVenueProduct.id,
          data,
          images,
        },
        {
          onSuccess: () => {
            setIsVenueProductModalOpen(false);
            setEditingVenueProduct(null);
          },
        }
      );
    } else {
      createVenueProductMutation.mutate(
        {
          loungeId: data.lounge_id,
          data,
          images,
        },
        {
          onSuccess: () => {
            setIsVenueProductModalOpen(false);
          },
        }
      );
    }
  };

  const handleDeleteVenueProduct = (item: NightlifeVenueProduct) => {
    setVenueProductToDelete(item);
    setIsVenueProductDeleteDialogOpen(true);
  };

  const handleConfirmVenueProductDelete = () => {
    if (venueProductToDelete) {
      deleteVenueProductMutation.mutate(
        {
          loungeId: venueProductToDelete.lounge_id,
          productId: venueProductToDelete.id,
        },
        {
          onSuccess: () => {
            setIsVenueProductDeleteDialogOpen(false);
            setVenueProductToDelete(null);
          },
        }
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
        <Tabs defaultValue="lounges" className="w-full">
          <div className="relative mb-6 pb-4">
            <TabsList className="inline-flex h-auto bg-transparent p-0 gap-0">
              <TabsTrigger
                value="bookings"
                className="data-[state=active]:bg-[#f08400]/10 data-[state=active]:text-[#f08400] text-gray-600 rounded-none px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-center relative border-b-2 border-transparent data-[state=active]:!border-[#f08400] hover:text-gray-900 hover:bg-gray-50 data-[state=active]:border-b-2"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Réservations
              </TabsTrigger>
              <TabsTrigger
                value="lounges"
                className="data-[state=active]:bg-[#f08400]/10 data-[state=active]:text-[#f08400] text-gray-600 rounded-none px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-center relative border-b-2 border-transparent data-[state=active]:!border-[#f08400] hover:text-gray-900 hover:bg-gray-50 data-[state=active]:border-b-2"
              >
                <Coffee className="w-4 h-4 mr-2" />
                nightlife
              </TabsTrigger>
              <TabsTrigger
                value="categories"
                className="data-[state=active]:bg-[#f08400]/10 data-[state=active]:text-[#f08400] text-gray-600 rounded-none px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-center relative border-b-2 border-transparent data-[state=active]:!border-[#f08400] hover:text-gray-900 hover:bg-gray-50 data-[state=active]:border-b-2"
              >
                <FolderTree className="w-4 h-4 mr-2" />
                Catégories
              </TabsTrigger>
              <TabsTrigger
                value="items"
                className="data-[state=active]:bg-[#f08400]/10 data-[state=active]:text-[#f08400] text-gray-600 rounded-none px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-center relative border-b-2 border-transparent data-[state=active]:!border-[#f08400] hover:text-gray-900 hover:bg-gray-50 data-[state=active]:border-b-2"
              >
                <List className="w-4 h-4 mr-2" />
                Items
              </TabsTrigger>
            </TabsList>
            <div className="absolute bottom-0 left-0 right-0 border-b-2 border-gray-300"></div>
          </div>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            {isLoadingBookings ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 animate-spin text-[#f08400] mb-4" />
                <p className="text-gray-500 text-sm">Chargement des réservations...</p>
              </div>
            ) : (
              <BookingTable
                data={bookings}
                onCancel={handleCancelBooking}
                onDelete={handleDeleteBooking}
                isLoading={deleteBookingMutation.isPending || cancelBookingMutation.isPending}
                onRefresh={() => refetchBookings()}
                isRefreshing={isRefetchingBookings}
              />
            )}

            <DeleteConfirmationDialog
              open={isBookingCancelDialogOpen}
              onOpenChange={setIsBookingCancelDialogOpen}
              onConfirm={handleConfirmBookingCancel}
              title="Annuler la réservation"
              description="Êtes-vous sûr de vouloir annuler cette réservation ? Cette action peut être réversible."
              itemName={bookingToCancel?.booking_reference || `Réservation #${bookingToCancel?.id}`}
              isLoading={cancelBookingMutation.isPending}
            />

            <DeleteConfirmationDialog
              open={isBookingDeleteDialogOpen}
              onOpenChange={setIsBookingDeleteDialogOpen}
              onConfirm={handleConfirmBookingDelete}
              title="Supprimer la réservation"
              description="Êtes-vous sûr de vouloir supprimer cette réservation ? Cette action ne peut pas être annulée."
              itemName={bookingToDelete?.booking_reference || `Réservation #${bookingToDelete?.id}`}
              isLoading={deleteBookingMutation.isPending}
            />
          </TabsContent>

          {/* Lounges Tab */}
          <TabsContent value="lounges" className="space-y-6">
            {isLoadingLounges ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 animate-spin text-[#f08400] mb-4" />
                <p className="text-gray-500 text-sm">Chargement des espaces...</p>
              </div>
            ) : (
              <LoungeTable
                data={lounges}
                onEdit={handleEditLounge}
                onDelete={handleDeleteLounge}
                isLoading={deleteLoungeMutation.isPending}
                addButton={
                  isOwnerApproved ? (
                    <AddButton
                      onClick={handleCreateLounge}
                      label="Ajouter mon espace"
                    />
                  ) : null
                }
                onRefresh={() => refetchLounges()}
                isRefreshing={isRefetchingLounges}
              />
            )}

            <DeleteConfirmationDialog
              open={isLoungeDeleteDialogOpen}
              onOpenChange={setIsLoungeDeleteDialogOpen}
              onConfirm={handleConfirmLoungeDelete}
              title="Supprimer l'espace"
              description="Êtes-vous sûr de vouloir supprimer cet espace ? Cette action ne peut pas être annulée."
              itemName={loungeToDelete?.name || `Espace #${loungeToDelete?.id}`}
              isLoading={deleteLoungeMutation.isPending}
            />
          </TabsContent>

          {/* Nightlife Venue Product Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            {isLoadingVenueProductCategories ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 animate-spin text-[#f08400] mb-4" />
                <p className="text-gray-500 text-sm">Chargement des catégories de produits...</p>
              </div>
            ) : (
              <LoungeProductCategoryTable
                data={venueProductCategories}
                onEdit={handleEditLoungeProductCategory}
                onDelete={handleDeleteLoungeProductCategory}
                isLoading={deleteVenueProductCategoryMutation.isPending || updateVenueProductCategoryMutation.isPending}
                onRefresh={() => refetchVenueProductCategories()}
                isRefreshing={isRefetchingVenueProductCategories}
                addButton={
                  isOwnerApproved ? (
                    <AddButton
                      onClick={handleCreateLoungeProductCategory}
                      label="Ajouter une catégorie de produit"
                      isLoading={isLoadingVenueProductCategories}
                      disabled={isLoadingVenueProductCategories}
                    />
                  ) : null
                }
              />
            )}

            {/* Menu Category Modal */}
            <LoungeProductCategoryModal
              open={isLoungeProductCategoryModalOpen}
              onOpenChange={setIsLoungeProductCategoryModalOpen}
              onSubmit={handleSubmitLoungeProductCategory}
              category={editingVenueProductCategory}
              isLoading={createVenueProductCategoryMutation.isPending || updateVenueProductCategoryMutation.isPending}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
              open={isLoungeProductCategoryDeleteDialogOpen}
              onOpenChange={setIsLoungeProductCategoryDeleteDialogOpen}
              onConfirm={handleConfirmLoungeProductCategoryDelete}
              title="Supprimer la catégorie de produit"
              description="Êtes-vous sûr de vouloir supprimer cette catégorie de produit ? Cette action ne peut pas être annulée."
              itemName={venueProductCategoryToDelete?.name || `Catégorie #${venueProductCategoryToDelete?.id}`}
              isLoading={deleteVenueProductCategoryMutation.isPending}
            />
          </TabsContent>

          {/* Nightlife Venue Products Tab */}
          <TabsContent value="items" className="space-y-6">
            {isLoadingVenueProducts ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 animate-spin text-[#f08400] mb-4" />
                <p className="text-gray-500 text-sm">Chargement des produits...</p>
              </div>
            ) : (
              <LoungeProductTable
                data={venueProducts}
                onEdit={handleEditVenueProduct}
                onDelete={handleDeleteVenueProduct}
                isLoading={deleteVenueProductMutation.isPending || updateVenueProductMutation.isPending}
                onRefresh={() => refetchVenueProducts()}
                isRefreshing={isRefetchingVenueProducts}
                addButton={
                  isOwnerApproved ? (
                    <AddButton
                      onClick={handleCreateVenueProduct}
                      label="Ajouter un produit"
                      isLoading={isLoadingVenueProducts}
                      disabled={isLoadingVenueProducts}
                    />
                  ) : null
                }
              />
            )}

            {/* Menu Item Modal */}
            <LoungeProductModal
              open={isVenueProductModalOpen}
              onOpenChange={setIsVenueProductModalOpen}
              onSubmit={handleSubmitVenueProduct}
              item={editingVenueProduct}
              isLoading={createVenueProductMutation.isPending || updateVenueProductMutation.isPending}
              loungeProductCategories={venueProductCategories}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
              open={isVenueProductDeleteDialogOpen}
              onOpenChange={setIsVenueProductDeleteDialogOpen}
              onConfirm={handleConfirmVenueProductDelete}
              title="Supprimer le produit"
              description="Êtes-vous sûr de vouloir supprimer ce produit ? Cette action ne peut pas être annulée."
              itemName={venueProductToDelete?.name || `Produit #${venueProductToDelete?.id}`}
              isLoading={deleteVenueProductMutation.isPending}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

