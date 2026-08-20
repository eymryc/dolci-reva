"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Calendar,
  Building2,
  Bed,
  Loader2,
} from "lucide-react";
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
  useHotels,
  useDeleteHotel,
  type Hotel,
} from "@/hooks/use-hotels";
import {
  useAllHotelRooms,
  useDeleteHotelRoom,
  type HotelRoom,
} from "@/hooks/use-hotels";
import { BookingTable } from "@/components/admin/bookings/BookingTable";
import { HotelTable } from "@/components/admin/hotels/HotelTable";
import { RoomTable } from "@/components/admin/hotels/RoomTable";
import { DeleteConfirmationDialog } from "@/components/admin/shared/DeleteConfirmationDialog";
import { HostPageHeader } from "@/components/admin/host/HostPageHeader";
import { OwnerEstablishmentGallery } from "@/components/admin/host/OwnerEstablishmentGallery";
import { HostShell } from "@/components/admin/host/HostShell";
import type { EstablishmentCardData } from "@/components/admin/host/EstablishmentCard";
import { useBackofficePath } from "@/hooks/use-host-view";

function toHotelCard(
  hotel: Hotel,
  path: (p: string) => string
): EstablishmentCardData {
  return {
    id: hotel.id,
    name: hotel.name,
    href: path(`/hotels/${hotel.id}`),
    imageUrl: hotel.main_image_url || hotel.main_image_thumb_url,
    location: [hotel.city, hotel.country].filter(Boolean).join(", "),
    description: hotel.description || null,
    meta:
      hotel.star_rating != null
        ? `${hotel.star_rating}★${
            hotel.rooms_count != null
              ? ` · ${hotel.rooms_count} chambre${hotel.rooms_count > 1 ? "s" : ""}`
              : ""
          }`
        : hotel.rooms_count != null
          ? `${hotel.rooms_count} chambre${hotel.rooms_count > 1 ? "s" : ""}`
          : undefined,
    status: hotel.is_active ? "available" : "inactive",
    statusLabel: hotel.is_active ? "Actif" : "Inactif",
  };
}

export default function HotelsPage() {
  const bo = useBackofficePath();
  const router = useRouter();
  const { isOwner, isAnyAdmin } = usePermissions();
  const { user } = useAuth();
  const isHostView = isOwner() && !isAnyAdmin();

  const verificationStatus = user?.verification_status?.trim().toUpperCase();
  const isOwnerVerified = verificationStatus === "APPROVED";
  const isOwnerApproved = isOwner() ? isOwnerVerified : true;

  const [search, setSearch] = useState("");

  // Bookings - TanStack Query
  const { 
    data: bookingsResponse, 
    isLoading: isLoadingBookings,
    refetch: refetchBookings,
    isRefetching: isRefetchingBookings,
  } = useBookings(1);
  const bookings = bookingsResponse?.data || [];
  const cancelBookingMutation = useCancelBooking();
  const deleteBookingMutation = useDeleteBooking();

  // Bookings State
  const [isBookingCancelDialogOpen, setIsBookingCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [isBookingDeleteDialogOpen, setIsBookingDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);

  // Hotels - TanStack Query
  const { 
    data: hotels = [], 
    isLoading: isLoadingHotels,
    refetch: refetchHotels,
    isRefetching: isRefetchingHotels,
  } = useHotels();
  const deleteHotelMutation = useDeleteHotel();

  // Hotels State
  const [isHotelDeleteDialogOpen, setIsHotelDeleteDialogOpen] = useState(false);
  const [hotelToDelete, setHotelToDelete] = useState<Hotel | null>(null);

  const filteredCards = useMemo(() => {
    const q = search.trim().toLowerCase();
    return hotels
      .filter((h) => {
        if (!q) return true;
        return (
          h.name.toLowerCase().includes(q) ||
          h.city?.toLowerCase().includes(q) ||
          h.address?.toLowerCase().includes(q)
        );
      })
      .map((h) => toHotelCard(h, bo));
  }, [hotels, search, bo]);

  // Rooms - TanStack Query
  const { 
    data: rooms = [], 
    isLoading: isLoadingRooms,
    refetch: refetchRooms,
    isRefetching: isRefetchingRooms,
  } = useAllHotelRooms();
  const deleteRoomMutation = useDeleteHotelRoom();

  // Rooms State
  const [isRoomDeleteDialogOpen, setIsRoomDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<HotelRoom | null>(null);

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

  // Hotel Handlers
  const handleCreateHotel = () => {
    router.push(bo("/hotels/new"));
  };

  const handleEditHotel = (hotel: Hotel) => {
    router.push(bo(`/hotels/${hotel.id}/edit`));
  };

  const handleDeleteHotel = (hotel: Hotel) => {
    setHotelToDelete(hotel);
    setIsHotelDeleteDialogOpen(true);
  };

  const handleConfirmHotelDelete = () => {
    if (hotelToDelete) {
      deleteHotelMutation.mutate(hotelToDelete.id, {
        onSuccess: () => {
          setIsHotelDeleteDialogOpen(false);
          setHotelToDelete(null);
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
            title="Hôtels"
            description="Liste compacte — ouvrez une fiche pour le détail."
            count={filteredCards.length}
            countLabel={{ singular: "hôtel", plural: "hôtels" }}
            actionLabel="Ajouter un hôtel"
            onAction={handleCreateHotel}
            actionDisabled={isLoadingHotels || !isOwnerApproved}
            actionTitle={
              !isOwnerApproved
                ? "Votre compte doit être vérifié pour ajouter un hôtel"
                : undefined
            }
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Rechercher un hôtel…"
          />

          <div className="mt-5">
            <OwnerEstablishmentGallery
              items={filteredCards}
              isLoading={isLoadingHotels}
              emptyTitle="Votre premier hôtel vous attend"
              emptyDescription="Ajoutez un établissement pour commencer à recevoir des Personnes sur Dolci Rêva."
              onEdit={(id) => router.push(bo(`/hotels/${id}/edit`))}
              onDelete={(id) => {
                const h = hotels.find((x) => x.id === id);
                if (h) handleDeleteHotel(h);
              }}
            />
          </div>
        </div>
        <DeleteConfirmationDialog
          open={isHotelDeleteDialogOpen}
          onOpenChange={setIsHotelDeleteDialogOpen}
          onConfirm={handleConfirmHotelDelete}
          title="Supprimer l'hôtel"
          description="Êtes-vous sûr de vouloir supprimer cet hôtel ? Cette action ne peut pas être annulée."
          itemName={hotelToDelete?.name}
          isLoading={deleteHotelMutation.isPending}
        />
      </HostShell>
    );
  }

  // Room Handlers (admin view continues below)
  const handleCreateRoom = () => {
    router.push(bo("/hotels/rooms/new"));
  };

  const handleEditRoom = (room: HotelRoom) => {
    router.push(bo(`/hotels/rooms/${room.id}/edit`));
  };

  const handleDeleteRoom = (room: HotelRoom) => {
    setRoomToDelete(room);
    setIsRoomDeleteDialogOpen(true);
  };

  const handleConfirmRoomDelete = () => {
    if (roomToDelete) {
      deleteRoomMutation.mutate(
        { roomId: roomToDelete.id },
        {
          onSuccess: () => {
            setIsRoomDeleteDialogOpen(false);
            setRoomToDelete(null);
          },
        }
      );
    }
  };

  return (
    <div className="space-y-8">
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
                value="hotels"
                className="data-[state=active]:bg-[#f08400]/10 data-[state=active]:text-[#f08400] text-gray-600 rounded-none px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-center relative border-b-2 border-transparent data-[state=active]:!border-[#f08400] hover:text-gray-900 hover:bg-gray-50 data-[state=active]:border-b-2"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Hôtels
              </TabsTrigger>
              <TabsTrigger
                value="rooms"
                className="data-[state=active]:bg-[#f08400]/10 data-[state=active]:text-[#f08400] text-gray-600 rounded-none px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-center relative border-b-2 border-transparent data-[state=active]:!border-[#f08400] hover:text-gray-900 hover:bg-gray-50 data-[state=active]:border-b-2"
              >
                <Bed className="w-4 h-4 mr-2" />
                Chambres
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

          {/* Hotels Tab */}
          <TabsContent value="hotels" className="space-y-6">
            {isLoadingHotels ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 animate-spin text-[#f08400] mb-4" />
                <p className="text-gray-500 text-sm">Chargement des hôtels...</p>
              </div>
            ) : (
              <HotelTable
                data={hotels}
                onEdit={handleEditHotel}
                onDelete={handleDeleteHotel}
                isLoading={deleteHotelMutation.isPending}
                onRefresh={() => refetchHotels()}
                isRefreshing={isRefetchingHotels}
                addButton={
                  <AddButton
                    onClick={handleCreateHotel}
                    label="Ajouter un hôtel"
                    isLoading={isLoadingHotels}
                    disabled={isLoadingHotels || (isOwner() && !isOwnerApproved)}
                    title={isOwner() && !isOwnerApproved ? "Votre compte doit être vérifié pour ajouter un hôtel" : undefined}
                  />
                }
              />
            )}

            <DeleteConfirmationDialog
              open={isHotelDeleteDialogOpen}
              onOpenChange={setIsHotelDeleteDialogOpen}
              onConfirm={handleConfirmHotelDelete}
              title="Supprimer l'hôtel"
              description="Êtes-vous sûr de vouloir supprimer cet hôtel ? Cette action ne peut pas être annulée."
              itemName={hotelToDelete?.name}
              isLoading={deleteHotelMutation.isPending}
            />
          </TabsContent>

          {/* Rooms Tab */}
          <TabsContent value="rooms" className="space-y-6">
            {isLoadingRooms ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 animate-spin text-[#f08400] mb-4" />
                <p className="text-gray-500 text-sm">Chargement des chambres...</p>
              </div>
            ) : (
              <RoomTable
                data={rooms}
                onEdit={handleEditRoom}
                onDelete={handleDeleteRoom}
                isLoading={deleteRoomMutation.isPending}
                onRefresh={() => refetchRooms()}
                isRefreshing={isRefetchingRooms}
                addButton={
                  <AddButton
                    onClick={handleCreateRoom}
                    label="Ajouter une chambre"
                    isLoading={isLoadingRooms}
                  />
                }
              />
            )}

            <DeleteConfirmationDialog
              open={isRoomDeleteDialogOpen}
              onOpenChange={setIsRoomDeleteDialogOpen}
              onConfirm={handleConfirmRoomDelete}
              title="Supprimer la chambre"
              description="Êtes-vous sûr de vouloir supprimer cette chambre ? Cette action ne peut pas être annulée."
              itemName={roomToDelete?.name ?? undefined}
              isLoading={deleteRoomMutation.isPending}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

