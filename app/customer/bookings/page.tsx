"use client";

import React, { useState } from "react";
import { 
  Loader2,
  Plus
} from "lucide-react";
import { useBookings } from "@/hooks/use-bookings";
import { usePermissions } from "@/hooks/use-permissions";
import { BookingTable } from "@/components/admin/bookings/BookingTable";
import { BookingModal } from "@/components/admin/bookings/BookingModal";
import { DeleteConfirmationDialog } from "@/components/admin/shared/DeleteConfirmationDialog";
import { Button } from "@/components/ui/button";
import type { Booking, BookingFormData } from "@/hooks/use-bookings";
import {
  useCreateBooking,
  useUpdateBooking,
  useCancelBooking,
  useDeleteBooking,
} from "@/hooks/use-bookings";

export default function CustomerBookingsPage() {
  const { isCustomer } = usePermissions();
  
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

  if (!isCustomer()) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Accès refusé</h1>
        <p className="text-gray-600">Vous devez être connecté en tant que client pour accéder à cette page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Bookings Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
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
            canCancel={true}
            canDelete={false}
            viewMode="customer"
            addButton={
              <Button
                onClick={handleCreateBooking}
                className="bg-theme-primary hover:bg-theme-primary/90 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle réservation
              </Button>
            }
          />
        )}
      </div>

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
    </div>
  );
}

