"use client";

import React, { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  useBookings,
  useCancelBooking,
  useDeleteBooking,
  type Booking,
} from "@/hooks/use-bookings";
import { DeleteConfirmationDialog } from "@/components/admin/shared/DeleteConfirmationDialog";
import { HostShell } from "@/components/admin/host/HostShell";
import { HostBookingList } from "@/components/admin/host/HostBookingList";

type FilterKey = "all" | "EN_ATTENTE" | "CONFIRME" | "ANNULE" | "COMPLETE";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "EN_ATTENTE", label: "À confirmer" },
  { key: "CONFIRME", label: "Confirmées" },
  { key: "COMPLETE", label: "Terminées" },
  { key: "ANNULE", label: "Annulées" },
];

export default function OwnerBookingsPage() {
  const { data: bookingsResponse, isLoading } = useBookings(1);
  const cancelBookingMutation = useCancelBooking();
  const deleteBookingMutation = useDeleteBooking();

  const [filter, setFilter] = useState<FilterKey>("all");
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);

  // Stabilize reference: `|| []` creates a new array each render when data is undefined
  const bookings = useMemo(
    () => bookingsResponse?.data ?? [],
    [bookingsResponse?.data]
  );

  const filtered = useMemo(() => {
    if (filter === "all") return bookings;
    return bookings.filter((b) => b.status === filter);
  }, [bookings, filter]);

  return (
    <HostShell>
      <div className="mx-auto w-full max-w-6xl">
        <header className="relative mb-8 overflow-hidden border border-[#f08400]/25 bg-gradient-to-br from-[#fff4e8] via-[#fffaf5] to-white px-5 py-6 sm:px-7 sm:py-7">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-[#f08400]/15 blur-2xl"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#f08400] to-[#ffb347]"
          />
          <p className="relative text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f08400]">
            Activité · {filtered.length} réservation{filtered.length > 1 ? "s" : ""}
          </p>
          <h1 className="relative mt-2 text-[1.85rem] font-semibold leading-[1.1] tracking-tight text-slate-900 sm:text-[2.35rem]">
            Réservations
          </h1>
          <p className="relative mt-2.5 max-w-xl text-[15px] leading-relaxed text-slate-500">
            Suivez les séjours à venir, confirmez ou annulez en un geste.
          </p>
        </header>

        <div className="mb-6 flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`border px-4 py-2.5 text-xs font-semibold tracking-wide transition-all duration-200 ${
                filter === f.key
                  ? "border-[#f08400] bg-[#f08400] text-white"
                  : "border-[#f08400]/20 bg-white text-slate-500 hover:border-[#f08400]/40 hover:bg-[#fffaf5] hover:text-slate-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#f08400]" />
            <p className="text-sm text-slate-500">Chargement des réservations…</p>
          </div>
        ) : (
          <HostBookingList
            bookings={filtered}
            onCancel={(booking) => {
              setBookingToCancel(booking);
              setIsCancelOpen(true);
            }}
            onDelete={(booking) => {
              setBookingToDelete(booking);
              setIsDeleteOpen(true);
            }}
          />
        )}
      </div>

      <DeleteConfirmationDialog
        open={isCancelOpen}
        onOpenChange={setIsCancelOpen}
        onConfirm={() => {
          if (!bookingToCancel) return;
          cancelBookingMutation.mutate(
            { id: bookingToCancel.id },
            {
              onSuccess: () => {
                setIsCancelOpen(false);
                setBookingToCancel(null);
              },
            }
          );
        }}
        title="Annuler la réservation"
        description="Êtes-vous sûr de vouloir annuler cette réservation ?"
        itemName={
          bookingToCancel?.booking_reference || `Réservation #${bookingToCancel?.id}`
        }
        isLoading={cancelBookingMutation.isPending}
      />

      <DeleteConfirmationDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={() => {
          if (!bookingToDelete) return;
          deleteBookingMutation.mutate(bookingToDelete.id, {
            onSuccess: () => {
              setIsDeleteOpen(false);
              setBookingToDelete(null);
            },
          });
        }}
        title="Supprimer la réservation"
        description="Cette action est définitive."
        itemName={
          bookingToDelete?.booking_reference || `Réservation #${bookingToDelete?.id}`
        }
        isLoading={deleteBookingMutation.isPending}
      />
    </HostShell>
  );
}
