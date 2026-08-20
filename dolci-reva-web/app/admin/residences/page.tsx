"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar, Home, Loader2 } from "lucide-react";
import { AddButton } from "@/components/admin/shared/AddButton";
import { usePermissions } from "@/hooks/use-permissions";
import { useAuth } from "@/context/AuthContext";
import {
  useBookings,
  useCancelBooking,
  useDeleteBooking,
  type Booking,
} from "@/hooks/use-bookings";
import {
  useResidences,
  useDeleteResidence,
  type Residence,
} from "@/hooks/use-residences";
import { BookingTable } from "@/components/admin/bookings/BookingTable";
import { ResidenceTable } from "@/components/admin/residences/ResidenceTable";
import { DeleteConfirmationDialog } from "@/components/admin/shared/DeleteConfirmationDialog";
import { HostPageHeader } from "@/components/admin/host/HostPageHeader";
import { OwnerEstablishmentGallery } from "@/components/admin/host/OwnerEstablishmentGallery";
import { HostShell } from "@/components/admin/host/HostShell";
import type { EstablishmentCardData } from "@/components/admin/host/EstablishmentCard";
import { useBackofficePath } from "@/hooks/use-host-view";

function toCard(
  residence: Residence,
  path: (p: string) => string
): EstablishmentCardData {
  const available = residence.is_available && residence.is_active;
  const priceNum = Number(residence.price);
  const priceFormatted = Number.isNaN(priceNum)
    ? String(residence.price)
    : priceNum.toLocaleString("fr-FR", {
        maximumFractionDigits: 0,
      });

  return {
    id: residence.id,
    name: residence.name,
    href: path(`/residences/${residence.id}`),
    imageUrl: residence.main_image_url || residence.main_image_thumb_url,
    location: [residence.city, residence.country].filter(Boolean).join(", "),
    description: residence.description || null,
    priceCaption: "Par nuit",
    priceLabel: `${priceFormatted} FCFA`,
    meta: `${residence.max_guests} voyageur${residence.max_guests > 1 ? "s" : ""}`,
    status: !residence.is_active ? "inactive" : available ? "available" : "unavailable",
    statusLabel: !residence.is_active
      ? "Inactive"
      : available
        ? "Disponible"
        : "Indisponible",
  };
}

export default function ResidencesPage() {
  const router = useRouter();
  const { isOwner, isAnyAdmin } = usePermissions();
  const { user } = useAuth();
  const isHostView = isOwner() && !isAnyAdmin();
  const bo = useBackofficePath();

  const verificationStatus = user?.verification_status?.trim().toUpperCase();
  const isOwnerVerified = verificationStatus === "APPROVED";
  const isOwnerApproved = isOwner() ? isOwnerVerified : true;

  const [search, setSearch] = useState("");

  const {
    data: bookingsResponse,
    isLoading: isLoadingBookings,
    refetch: refetchBookings,
    isRefetching: isRefetchingBookings,
  } = useBookings(1);
  const bookings = bookingsResponse?.data || [];
  const cancelBookingMutation = useCancelBooking();
  const deleteBookingMutation = useDeleteBooking();

  const [isBookingCancelDialogOpen, setIsBookingCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [isBookingDeleteDialogOpen, setIsBookingDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);

  const {
    data: residences = [],
    isLoading: isLoadingResidences,
    refetch: refetchResidences,
    isRefetching: isRefetchingResidences,
  } = useResidences();
  const deleteResidenceMutation = useDeleteResidence();

  const [isResidenceDeleteDialogOpen, setIsResidenceDeleteDialogOpen] = useState(false);
  const [residenceToDelete, setResidenceToDelete] = useState<Residence | null>(null);

  const filteredCards = useMemo(() => {
    const q = search.trim().toLowerCase();
    return residences
      .filter((r) => {
        if (!q) return true;
        return (
          r.name.toLowerCase().includes(q) ||
          r.city?.toLowerCase().includes(q) ||
          r.address?.toLowerCase().includes(q)
        );
      })
      .map((r) => toCard(r, bo));
  }, [residences, search, bo]);

  const handleCreateResidence = () => router.push(bo("/residences/new"));
  const handleEditResidence = (residence: Residence) =>
    router.push(bo(`/residences/${residence.id}/edit`));
  const handleDeleteResidence = (residence: Residence) => {
    setResidenceToDelete(residence);
    setIsResidenceDeleteDialogOpen(true);
  };

  const deleteDialog = (
    <DeleteConfirmationDialog
      open={isResidenceDeleteDialogOpen}
      onOpenChange={setIsResidenceDeleteDialogOpen}
      onConfirm={() => {
        if (!residenceToDelete) return;
        deleteResidenceMutation.mutate(residenceToDelete.id, {
          onSuccess: () => {
            setIsResidenceDeleteDialogOpen(false);
            setResidenceToDelete(null);
          },
        });
      }}
      title="Supprimer la résidence"
      description="Êtes-vous sûr de vouloir supprimer cette résidence ? Cette action ne peut pas être annulée."
      itemName={residenceToDelete?.name}
      isLoading={deleteResidenceMutation.isPending}
    />
  );

  if (isHostView) {
    return (
      <HostShell>
        <div className="mx-auto w-full max-w-6xl">
          <HostPageHeader
            eyebrow="Espace hôte"
            title="Résidences"
            description="Gérez vos logements à la nuit — ouvrez une fiche pour le détail."
            count={filteredCards.length}
            countLabel={{ singular: "résidence", plural: "résidences" }}
            actionLabel="Ajouter une résidence"
            onAction={handleCreateResidence}
            actionDisabled={isLoadingResidences || !isOwnerApproved}
            actionTitle={
              !isOwnerApproved
                ? "Votre compte doit être vérifié pour ajouter une résidence"
                : undefined
            }
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Rechercher une résidence…"
          />

          <div className="mt-8">
            <OwnerEstablishmentGallery
              items={filteredCards}
              isLoading={isLoadingResidences}
              emptyTitle="Votre première résidence vous attend"
              emptyDescription="Ajoutez un logement pour commencer à recevoir des Personnes sur Dolci Rêva."
              onEdit={(id) => router.push(bo(`/residences/${id}/edit`))}
              onDelete={(id) => {
                const r = residences.find((x) => x.id === id);
                if (r) handleDeleteResidence(r);
              }}
            />
          </div>
        </div>
        {deleteDialog}
      </HostShell>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-gray-200/50 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
        <Tabs defaultValue="bookings" className="w-full">
          <div className="relative mb-6 pb-4">
            <TabsList className="inline-flex h-auto gap-0 bg-transparent p-0">
              <TabsTrigger
                value="bookings"
                className="relative flex items-center justify-center rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:!border-[#f08400] data-[state=active]:bg-[#f08400]/10 data-[state=active]:text-[#f08400]"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Réservations
              </TabsTrigger>
              <TabsTrigger
                value="residences"
                className="relative flex items-center justify-center rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:!border-[#f08400] data-[state=active]:bg-[#f08400]/10 data-[state=active]:text-[#f08400]"
              >
                <Home className="mr-2 h-4 w-4" />
                Résidence
              </TabsTrigger>
            </TabsList>
            <div className="absolute bottom-0 left-0 right-0 border-b-2 border-gray-300" />
          </div>

          <TabsContent value="bookings" className="space-y-6">
            {isLoadingBookings ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="mb-4 h-12 w-12 animate-spin text-[#f08400]" />
                <p className="text-sm text-gray-500">Chargement des réservations...</p>
              </div>
            ) : (
              <BookingTable
                data={bookings}
                onCancel={(booking) => {
                  setBookingToCancel(booking);
                  setIsBookingCancelDialogOpen(true);
                }}
                onDelete={(booking) => {
                  setBookingToDelete(booking);
                  setIsBookingDeleteDialogOpen(true);
                }}
                isLoading={deleteBookingMutation.isPending || cancelBookingMutation.isPending}
                onRefresh={() => refetchBookings()}
                isRefreshing={isRefetchingBookings}
              />
            )}

            <DeleteConfirmationDialog
              open={isBookingCancelDialogOpen}
              onOpenChange={setIsBookingCancelDialogOpen}
              onConfirm={() => {
                if (!bookingToCancel) return;
                cancelBookingMutation.mutate(
                  { id: bookingToCancel.id },
                  {
                    onSuccess: () => {
                      setIsBookingCancelDialogOpen(false);
                      setBookingToCancel(null);
                    },
                  }
                );
              }}
              title="Annuler la réservation"
              description="Êtes-vous sûr de vouloir annuler cette réservation ? Cette action peut être réversible."
              itemName={
                bookingToCancel?.booking_reference || `Réservation #${bookingToCancel?.id}`
              }
              isLoading={cancelBookingMutation.isPending}
            />

            <DeleteConfirmationDialog
              open={isBookingDeleteDialogOpen}
              onOpenChange={setIsBookingDeleteDialogOpen}
              onConfirm={() => {
                if (!bookingToDelete) return;
                deleteBookingMutation.mutate(bookingToDelete.id, {
                  onSuccess: () => {
                    setIsBookingDeleteDialogOpen(false);
                    setBookingToDelete(null);
                  },
                });
              }}
              title="Supprimer la réservation"
              description="Êtes-vous sûr de vouloir supprimer cette réservation ? Cette action ne peut pas être annulée."
              itemName={
                bookingToDelete?.booking_reference || `Réservation #${bookingToDelete?.id}`
              }
              isLoading={deleteBookingMutation.isPending}
            />
          </TabsContent>

          <TabsContent value="residences" className="space-y-6">
            {isLoadingResidences ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="mb-4 h-12 w-12 animate-spin text-[#f08400]" />
                <p className="text-sm text-gray-500">Chargement des résidences...</p>
              </div>
            ) : (
              <ResidenceTable
                data={residences}
                onEdit={handleEditResidence}
                onDelete={handleDeleteResidence}
                isLoading={deleteResidenceMutation.isPending}
                onRefresh={() => refetchResidences()}
                isRefreshing={isRefetchingResidences}
                addButton={
                  <AddButton
                    onClick={handleCreateResidence}
                    label="Ajouter une résidence"
                    isLoading={isLoadingResidences}
                    disabled={isLoadingResidences || (isOwner() && !isOwnerApproved)}
                    title={
                      isOwner() && !isOwnerApproved
                        ? "Votre compte doit être vérifié pour ajouter une résidence"
                        : undefined
                    }
                  />
                }
              />
            )}
            {deleteDialog}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
