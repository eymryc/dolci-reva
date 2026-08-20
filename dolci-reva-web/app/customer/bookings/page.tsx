"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Compass,
  Loader2,
  RefreshCw,
  Ticket,
} from "lucide-react";
import {
  useBookings,
  useCancelBooking,
  type Booking,
} from "@/hooks/use-bookings";
import { usePermissions } from "@/hooks/use-permissions";
import { BookingTripCard } from "@/components/customer/BookingTripCard";
import { CustomerPageHeader } from "@/components/customer/CustomerPageHeader";
import { CustomerCreditBanner } from "@/components/customer/CustomerCreditBanner";
import { BookingCancelSettlementDialog } from "@/components/customer/BookingCancelSettlementDialog";
import { Button } from "@/components/ui/button";
import {
  filterBookings,
  type BookingListFilter,
} from "@/lib/customer-booking";
import { cn } from "@/lib/utils";

const FILTERS: { id: BookingListFilter; label: string }[] = [
  { id: "upcoming", label: "À venir" },
  { id: "past", label: "Passées" },
  { id: "cancelled", label: "Annulées" },
  { id: "all", label: "Tous" },
];

export default function CustomerBookingsPage() {
  const { isCustomer } = usePermissions();
  const [filter, setFilter] = useState<BookingListFilter>("upcoming");
  const {
    data: bookingsResponse,
    isLoading,
    refetch,
    isRefetching,
  } = useBookings(1);
  const cancelBookingMutation = useCancelBooking();

  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

  // Stabilize reference: `|| []` creates a new array each render when data is undefined
  const bookings = useMemo(
    () => bookingsResponse?.data ?? [],
    [bookingsResponse?.data]
  );
  const filtered = useMemo(
    () => filterBookings(bookings, filter),
    [bookings, filter]
  );
  const counts = useMemo(
    () => ({
      upcoming: filterBookings(bookings, "upcoming").length,
      past: filterBookings(bookings, "past").length,
      cancelled: filterBookings(bookings, "cancelled").length,
      all: bookings.length,
    }),
    [bookings]
  );

  if (!isCustomer()) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="mb-4 text-3xl font-bold text-[#12100c]">Accès refusé</h1>
        <p className="text-[#12100c]/60">
          Vous devez être connecté en tant que client pour accéder à cette page.
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[70vh]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,_rgba(240,132,0,0.12),_transparent_60%)]"
      />

      <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <CustomerPageHeader
          eyebrow="Compte"
          title="Mes réservations"
          description="Vos séjours, tables et soirées — à venir, passés ou à régler."
          actions={
            <Button
              type="button"
              variant="outline"
              className="rounded-none border-[#12100c]/12 bg-white/80 backdrop-blur-sm"
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              <RefreshCw
                className={cn("mr-2 h-4 w-4", isRefetching && "animate-spin")}
              />
              Actualiser
            </Button>
          }
        />

        <CustomerCreditBanner className="mb-6" />

        {/* Filters */}
        <div className="mb-8 border-b border-[#12100c]/08">
          <div className="-mb-px flex gap-1 overflow-x-auto">
            {FILTERS.map(({ id, label }) => {
              const active = filter === id;
              const count = counts[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilter(id)}
                  className={cn(
                    "relative flex shrink-0 items-center gap-2 px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] transition-colors",
                    active
                      ? "text-[#f08400]"
                      : "text-[#12100c]/45 hover:text-[#12100c]"
                  )}
                >
                  {label}
                  <span
                    className={cn(
                      "min-w-[1.25rem] px-1.5 py-0.5 text-center text-[10px] font-bold tabular-nums",
                      active
                        ? "bg-[#f08400] text-white"
                        : "bg-[#12100c]/06 text-[#12100c]/50"
                    )}
                  >
                    {count}
                  </span>
                  {active ? (
                    <span className="absolute inset-x-2 bottom-0 h-0.5 bg-[#f08400]" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center border border-[#12100c]/06 bg-white/70 py-24 backdrop-blur-sm">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-[#f08400]" />
            <p className="text-sm text-[#12100c]/50">
              Chargement de vos réservations…
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="relative overflow-hidden border border-[#12100c]/08 bg-white px-6 py-16 text-center sm:px-10">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#f08400]/10 blur-2xl"
            />
            <div className="relative mx-auto flex h-14 w-14 items-center justify-center border border-[#f08400]/25 bg-[#fff4e8] text-[#f08400]">
              <Ticket className="h-6 w-6" />
            </div>
            <h3 className="relative mt-5 text-xl font-bold text-[#12100c]">
              {filter === "upcoming"
                ? "Aucun séjour à venir"
                : "Rien pour ce filtre"}
            </h3>
            <p className="relative mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#12100c]/55">
              {filter === "upcoming"
                ? "Planifiez votre prochaine escapade — résidences, hôtels, tables ou nightlife."
                : "Changez de filtre ou explorez le catalogue Dolci Rêva."}
            </p>
            <Link href="/residences" className="relative mt-7 inline-block">
              <Button className="h-11 rounded-none bg-[#f08400] px-6 font-semibold hover:bg-[#d97400]">
                <Compass className="mr-2 h-4 w-4" />
                Explorer le catalogue
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#12100c]/40">
              {filtered.length} réservation{filtered.length > 1 ? "s" : ""}
            </p>
            <div className="space-y-4">
              {filtered.map((booking, index) => (
                <div
                  key={booking.id}
                  className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
                  style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
                >
                  <BookingTripCard
                    booking={booking}
                    featured={
                      filter === "upcoming" &&
                      index === 0 &&
                      (booking.payment_status === "EN_ATTENTE" ||
                        booking.payment_status === "ECHEC")
                    }
                    onCancel={setBookingToCancel}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {bookingToCancel ? (
          <BookingCancelSettlementDialog
            open={!!bookingToCancel}
            onOpenChange={(open) => !open && setBookingToCancel(null)}
            booking={bookingToCancel}
            isLoading={cancelBookingMutation.isPending}
            onConfirm={(settlement) => {
              cancelBookingMutation.mutate(
                { id: bookingToCancel.id, settlement },
                { onSuccess: () => setBookingToCancel(null) }
              );
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
