"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Calendar, 
  Loader2,
  ArrowLeft,
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      {/* Header */}
      <div className="mb-8">
        <Link href="/customer/dashboard">
          <Button variant="ghost" className="mb-4 hover:bg-theme-primary/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au tableau de bord
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-theme-primary/10 rounded-xl">
                <Calendar className="w-6 h-6 text-theme-primary" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">
                Mes réservations
              </h1>
            </div>
            <p className="text-gray-500 text-sm ml-14">
              Gérez toutes vos réservations en un seul endroit
            </p>
          </div>
          <Button
            onClick={handleCreateBooking}
            className="bg-theme-primary hover:bg-theme-primary/90 text-white shadow-lg h-12"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle réservation
          </Button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
        {isLoadingBookings ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 animate-spin text-theme-primary mb-4" />
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

