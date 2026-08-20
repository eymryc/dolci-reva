"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Bed,
  Edit2,
  Loader2,
  Plus,
  Trash2,
  Users,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useHotel,
  useHotelRooms,
  useDeleteHotelRoom,
  type HotelRoom,
} from "@/hooks/use-hotels";
import { HostEstablishmentDossier } from "@/components/admin/host/HostEstablishmentDossier";
import { DeleteConfirmationDialog } from "@/components/admin/shared/DeleteConfirmationDialog";
import { ActiveStatusBadge } from "@/components/admin/shared/ActiveStatusBadge";
import { useBackofficePath } from "@/hooks/use-host-view";

const TYPE_LABELS: Record<string, string> = {
  SINGLE: "Simple",
  DOUBLE: "Double",
  TWIN: "Jumelle",
  TRIPLE: "Triple",
  QUAD: "Quadruple",
  FAMILY: "Familiale",
};

const STANDING_LABELS: Record<string, string> = {
  STANDARD: "Standard",
  SUPERIEUR: "Supérieur",
  DELUXE: "Deluxe",
  EXECUTIVE: "Executive",
  SUITE: "Suite",
  SUITE_JUNIOR: "Suite Junior",
  SUITE_EXECUTIVE: "Suite Executive",
  SUITE_PRESIDENTIELLE: "Suite Présidentielle",
};

function formatPrice(price: string | number) {
  const n = Number(price);
  if (Number.isNaN(n)) return String(price);
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(n);
}

function roomTitle(room: HotelRoom) {
  return (
    room.display_name ||
    room.name ||
    (room.room_number ? `Chambre ${room.room_number}` : `Chambre #${room.id}`)
  );
}

export default function HotelDossierPage() {
  const params = useParams();
  const id = Number(params.id);
  const bo = useBackofficePath();
  const { data: hotel, isLoading, error } = useHotel(id);
  const { data: rooms = [], isLoading: isLoadingRooms } = useHotelRooms(id);
  const deleteRoomMutation = useDeleteHotelRoom();

  const [roomToDelete, setRoomToDelete] = useState<HotelRoom | null>(null);

  if (isLoading || error || !hotel) {
    return (
      <HostEstablishmentDossier
        isLoading={isLoading}
        error={Boolean(error) || (!isLoading && !hotel)}
        notFoundLabel="Hôtel introuvable"
        listPath="/hotels"
        listLabel="Retour aux hôtels"
        editPath={`/hotels/${id}/edit`}
        bookableId={id}
        name=""
        location=""
        statusAvailable={false}
      />
    );
  }

  return (
    <>
      <HostEstablishmentDossier
        listPath="/hotels"
        listLabel="Tous les hôtels"
        editPath={`/hotels/${hotel.id}/edit`}
        bookableId={hotel.id}
        name={hotel.name}
        cover={hotel.main_image_url || hotel.main_image_thumb_url}
        location={[hotel.address, hotel.city, hotel.country]
          .filter(Boolean)
          .join(" · ")}
        statusAvailable={hotel.is_active}
        statusLabel={hotel.is_active ? "Actif" : "Inactif"}
        eyebrow={
          hotel.star_rating != null
            ? `${hotel.star_rating} étoile${hotel.star_rating > 1 ? "s" : ""}`
            : "Hôtel"
        }
        description={hotel.description}
        galleryImages={hotel.gallery_images}
        allImages={hotel.all_images}
        featureCategories={hotel.feature_categories}
        stats={[
          {
            label: "Étoiles",
            value: hotel.star_rating != null ? String(hotel.star_rating) : "—",
            hint: hotel.star_rating != null ? "★" : undefined,
          },
          {
            label: "Chambres",
            value: String(rooms.length || hotel.rooms_count || 0),
            hint: "en ligne",
          },
          {
            label: "Ville",
            value: hotel.city || "—",
          },
          {
            label: "Statut",
            value: hotel.is_active ? "Actif" : "Inactif",
          },
        ]}
        sidebarRows={[
          {
            label: "Statut",
            value: hotel.is_active ? "Actif" : "Inactif",
          },
          {
            label: "Chambres",
            value: String(rooms.length || hotel.rooms_count || 0),
          },
        ]}
        extraActions={
          <Button
            variant="outline"
            asChild
            className="h-11 rounded-none border-white/25 bg-white/10 px-4 text-white backdrop-blur-sm hover:bg-white hover:text-slate-900"
          >
            <Link href={bo(`/hotels/rooms/new?hotelId=${hotel.id}`)}>
              <Bed className="mr-2 h-4 w-4" />
              Ajouter une chambre
            </Link>
          </Button>
        }
      >
        <section className="relative overflow-hidden border border-[#f08400]/20 bg-gradient-to-br from-[#fff4e8]/80 via-white to-[#fffaf5] p-5 sm:p-7">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#f08400]/10 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#f08400] via-[#ffb347] to-transparent"
          />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f08400]">
                  Chambres
                </p>
                {!isLoadingRooms && rooms.length > 0 && (
                  <span className="border border-[#f08400]/25 bg-white px-2 py-0.5 text-[11px] font-semibold text-[#f08400]">
                    {rooms.length} chambre{rooms.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                Inventaire de l&apos;hôtel
              </h2>
              <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-slate-500">
                Gérez les chambres proposées à la réservation — photo, tarif et
                disponibilité.
              </p>
            </div>
            <Button
              asChild
              className="h-11 shrink-0 rounded-none bg-[#f08400] px-5 font-semibold text-white shadow-[0_8px_24px_-12px_rgba(240,132,0,0.55)] hover:bg-[#d87200]"
            >
              <Link href={bo(`/hotels/rooms/new?hotelId=${hotel.id}`)}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle chambre
              </Link>
            </Button>
          </div>

          {isLoadingRooms ? (
            <div className="relative mt-8 flex flex-col items-center justify-center border border-dashed border-[#f08400]/20 bg-white/70 py-16">
              <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#f08400]" />
              <p className="text-sm text-slate-500">Chargement des chambres…</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="relative mt-7 border border-dashed border-[#f08400]/30 bg-white/80 px-5 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center border border-[#f08400]/20 bg-[#fff4e8]">
                <Bed className="h-7 w-7 text-[#f08400]" />
              </div>
              <p className="mt-5 text-base font-semibold text-slate-900">
                Aucune chambre pour le moment
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                Un hôtel sans chambres ne peut pas recevoir de réservations.
                Ajoutez votre première offre.
              </p>
              <Button
                asChild
                className="mt-6 h-10 rounded-none bg-[#f08400] text-white hover:bg-[#d87200]"
              >
                <Link href={bo(`/hotels/rooms/new?hotelId=${hotel.id}`)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter la première chambre
                </Link>
              </Button>
            </div>
          ) : (
            <ul className="relative mt-7 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {rooms.map((room) => {
                const imageSrc =
                  room.main_image_url || room.main_image_thumb_url || "";
                const typeLabel = TYPE_LABELS[room.type] || room.type;
                const standingLabel = room.standing
                  ? STANDING_LABELS[room.standing] || room.standing
                  : null;

                return (
                  <li
                    key={room.id}
                    className="group relative flex overflow-hidden border border-[#f08400]/15 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[#f08400]/40 hover:shadow-[0_16px_40px_-28px_rgba(240,132,0,0.55)]"
                  >
                    <div
                      aria-hidden
                      className="absolute inset-y-0 left-0 w-0.5 bg-[#f08400] opacity-0 transition-opacity group-hover:opacity-100"
                    />

                    <div className="relative w-[7.5rem] shrink-0 self-stretch bg-[#fff4e8] sm:w-40">
                      {imageSrc ? (
                        <Image
                          src={imageSrc}
                          alt={roomTitle(room)}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full min-h-[140px] items-center justify-center">
                          <Bed className="h-7 w-7 text-[#f08400]/35" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/35 to-transparent" />
                      {room.room_number ? (
                        <span className="absolute bottom-2 left-2 bg-white/95 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-slate-800">
                          N° {room.room_number}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-semibold tracking-tight text-slate-900 sm:text-base">
                            {roomTitle(room)}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <span className="border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                              {typeLabel}
                            </span>
                            {standingLabel ? (
                              <span className="border border-[#f08400]/20 bg-[#fffaf5] px-2 py-0.5 text-[11px] font-medium text-[#c56a00]">
                                {standingLabel}
                              </span>
                            ) : null}
                            <span className="inline-flex items-center gap-1 border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600">
                              <Users className="h-3 w-3" />
                              {room.max_guests} pers.
                            </span>
                          </div>
                        </div>
                        <ActiveStatusBadge
                          active={room.is_active}
                          activeLabel="Active"
                          inactiveLabel="Inactive"
                        />
                      </div>

                      <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-[#f08400]/10 pt-3">
                        <p className="flex items-baseline gap-1.5">
                          <span className="text-lg font-semibold tracking-tight text-slate-900">
                            {formatPrice(room.price)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                            <Moon className="h-3 w-3" />
                            / nuit
                          </span>
                        </p>
                        <div className="flex items-center gap-1.5">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-none border-slate-200 px-2.5 text-xs hover:border-[#f08400]/40 hover:bg-[#fffaf5]"
                          >
                            <Link href={bo(`/hotels/rooms/${room.id}/edit`)}>
                              <Edit2 className="mr-1.5 h-3 w-3" />
                              Modifier
                            </Link>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 rounded-none px-2.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => setRoomToDelete(room)}
                          >
                            <Trash2 className="mr-1.5 h-3 w-3" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </HostEstablishmentDossier>

      <DeleteConfirmationDialog
        open={!!roomToDelete}
        onOpenChange={(open) => {
          if (!open) setRoomToDelete(null);
        }}
        onConfirm={() => {
          if (!roomToDelete) return;
          deleteRoomMutation.mutate(
            { roomId: roomToDelete.id, hotelId: hotel.id },
            {
              onSuccess: () => setRoomToDelete(null),
            }
          );
        }}
        title="Supprimer la chambre"
        description="Êtes-vous sûr de vouloir supprimer cette chambre ? Cette action ne peut pas être annulée."
        itemName={roomToDelete ? roomTitle(roomToDelete) : undefined}
        isLoading={deleteRoomMutation.isPending}
      />
    </>
  );
}
