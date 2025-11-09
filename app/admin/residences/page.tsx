"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Home,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import { useAuth } from "@/context/AuthContext";
import {
  useBookings,
  useCreateBooking,
  useUpdateBooking,
  useCancelBooking,
  useDeleteBooking,
  type Booking,
  type BookingFormData,
} from "@/hooks/use-bookings";
import {
  useResidences,
  useDeleteResidence,
  type Residence,
} from "@/hooks/use-residences";
import { BookingTable } from "@/components/admin/bookings/BookingTable";
import { BookingModal } from "@/components/admin/bookings/BookingModal";
import { ResidenceTable } from "@/components/admin/residences/ResidenceTable";
import { DeleteConfirmationDialog } from "@/components/admin/shared/DeleteConfirmationDialog";

export default function ResidencesPage() {
  const router = useRouter();
  const { isAnyAdmin, isOwner } = usePermissions();
  const { user } = useAuth();
  
  // Vérifier le statut de vérification pour les propriétaires
  // Utiliser directement user.verification_status depuis le contexte d'authentification
  const verificationStatus = user?.verification_status?.trim().toUpperCase();
  const isOwnerVerified = verificationStatus === "APPROVED";
  const isOwnerApproved = isOwner() 
    ? isOwnerVerified
    : true; // Les admins peuvent toujours ajouter des résidences
  
  // Bookings - TanStack Query
  const { 
    data: bookingsResponse, 
    isLoading: isLoadingBookings,
    refetch: refetchBookings,
    isRefetching: isRefetchingBookings,
  } = useBookings(1);
  const bookings = bookingsResponse?.data || [];
  const createBookingMutation = useCreateBooking();
  const updateBookingMutation = useUpdateBooking();
  const cancelBookingMutation = useCancelBooking();
  const deleteBookingMutation = useDeleteBooking();

  // Bookings State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isBookingCancelDialogOpen, setIsBookingCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [isBookingDeleteDialogOpen, setIsBookingDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);

  // Residences - TanStack Query
  const { 
    data: residences = [], 
    isLoading: isLoadingResidences,
    refetch: refetchResidences,
    isRefetching: isRefetchingResidences,
  } = useResidences();
  const deleteResidenceMutation = useDeleteResidence();

  // Residences State
  const [isResidenceDeleteDialogOpen, setIsResidenceDeleteDialogOpen] = useState(false);
  const [residenceToDelete, setResidenceToDelete] = useState<Residence | null>(null);

  // Booking Handlers
  const handleCreateBooking = () => {
    setEditingBooking(null);
    setIsBookingModalOpen(true);
  };

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

  const handleSubmitBooking = (data: BookingFormData) => {
    if (editingBooking) {
      updateBookingMutation.mutate(
        { id: editingBooking.id, data },
        {
          onSuccess: () => {
            setIsBookingModalOpen(false);
            setEditingBooking(null);
          },
        }
      );
    } else {
      createBookingMutation.mutate(data, {
        onSuccess: () => {
          setIsBookingModalOpen(false);
        },
      });
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

  // Residence Handlers
  const handleCreateResidence = () => {
    router.push("/admin/residences/new");
  };

  const handleEditResidence = (residence: Residence) => {
    router.push(`/admin/residences/${residence.id}/edit`);
  };

  const handleDeleteResidence = (residence: Residence) => {
    setResidenceToDelete(residence);
    setIsResidenceDeleteDialogOpen(true);
  };

  const handleConfirmResidenceDelete = () => {
    if (residenceToDelete) {
      deleteResidenceMutation.mutate(residenceToDelete.id, {
        onSuccess: () => {
          setIsResidenceDeleteDialogOpen(false);
          setResidenceToDelete(null);
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
              Résidences
            </h1>
          </div>
          <p className="text-gray-500 text-sm ml-14">
            {isAnyAdmin() 
              ? "Gérez les réservations et les résidences" 
              : isOwner() 
                ? "Gérez vos réservations et vos résidences"
                : "Gérez vos réservations et résidences"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
        <Tabs defaultValue="bookings" className="w-full">
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
                value="residences"
                className="data-[state=active]:bg-[#f08400]/10 data-[state=active]:text-[#f08400] text-gray-600 rounded-none px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-center relative border-b-2 border-transparent data-[state=active]:!border-[#f08400] hover:text-gray-900 hover:bg-gray-50 data-[state=active]:border-b-2"
              >
                <Home className="w-4 h-4 mr-2" />
                Résidence
              </TabsTrigger>
            </TabsList>
            <div className="absolute bottom-0 left-0 right-0 border-b-2 border-gray-300"></div>
          </div>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            {/* Bookings Table */}
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

            {/* Booking Modal */}
            <BookingModal
              open={isBookingModalOpen}
              onOpenChange={setIsBookingModalOpen}
              onSubmit={handleSubmitBooking}
              booking={editingBooking}
              isLoading={createBookingMutation.isPending || updateBookingMutation.isPending}
            />

            {/* Cancel Confirmation Dialog */}
            <DeleteConfirmationDialog
              open={isBookingCancelDialogOpen}
              onOpenChange={setIsBookingCancelDialogOpen}
              onConfirm={handleConfirmBookingCancel}
              title="Annuler la réservation"
              description="Êtes-vous sûr de vouloir annuler cette réservation ? Cette action peut être réversible."
              itemName={bookingToCancel?.booking_reference || `Réservation #${bookingToCancel?.id}`}
              isLoading={cancelBookingMutation.isPending}
            />

            {/* Delete Confirmation Dialog */}
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

          {/* Residences Tab */}
          <TabsContent value="residences" className="space-y-6">
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
                      Votre compte doit être vérifié et approuvé avant de pouvoir ajouter une résidence. 
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

            {/* Residences Table */}
            {isLoadingResidences ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 animate-spin text-[#f08400] mb-4" />
                <p className="text-gray-500 text-sm">Chargement des résidences...</p>
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
                  <Button
                    onClick={handleCreateResidence}
                    className="bg-[#f08400] hover:bg-[#d87200] text-white shadow-lg h-12 hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoadingResidences || (isOwner() && !isOwnerApproved)}
                    title={isOwner() && !isOwnerApproved ? "Votre compte doit être vérifié pour ajouter une résidence" : undefined}
                  >
                    {isLoadingResidences ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Ajouter une résidence
                  </Button>
                }
              />
            )}

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
              open={isResidenceDeleteDialogOpen}
              onOpenChange={setIsResidenceDeleteDialogOpen}
              onConfirm={handleConfirmResidenceDelete}
              title="Supprimer la résidence"
              description="Êtes-vous sûr de vouloir supprimer cette résidence ? Cette action ne peut pas être annulée."
              itemName={residenceToDelete?.name}
              isLoading={deleteResidenceMutation.isPending}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

