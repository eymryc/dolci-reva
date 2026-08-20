"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  Compass,
  CreditCard,
  Hotel,
  Loader2,
  MapPin,
  RefreshCw,
  UtensilsCrossed,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  useBookings,
  useCancelBooking,
  type Booking,
} from "@/hooks/use-bookings";
import { usePermissions } from "@/hooks/use-permissions";
import { useVisits } from "@/hooks/use-visits";
import { BookingTripCard } from "@/components/customer/BookingTripCard";
import { CustomerPageHeader } from "@/components/customer/CustomerPageHeader";
import { CustomerCreditBanner } from "@/components/customer/CustomerCreditBanner";
import { BookingCancelSettlementDialog } from "@/components/customer/BookingCancelSettlementDialog";
import { Button } from "@/components/ui/button";
import {
  formatBookingDate,
  getBookableTitle,
  getNextUpcomingBooking,
  isUpcomingBooking,
} from "@/lib/customer-booking";
import { cn } from "@/lib/utils";

function daysUntil(dateIso: string): number | null {
  const start = new Date(dateIso);
  if (Number.isNaN(start.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  return Math.ceil((start.getTime() - today.getTime()) / 86_400_000);
}

const EXPLORE = [
  { href: "/residences", label: "Résidences", icon: Building2 },
  { href: "/hotels", label: "Hôtels", icon: Hotel },
  { href: "/restaurants", label: "Restaurants", icon: UtensilsCrossed },
  { href: "/night-clubs", label: "Nightlife", icon: Compass },
] as const;

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const { isCustomer } = usePermissions();
  const {
    data: bookingsResponse,
    isLoading: isLoadingBookings,
    refetch,
    isRefetching,
  } = useBookings(1);
  const { data: visitsData, isLoading: isLoadingVisits } = useVisits(1);
  const cancelBookingMutation = useCancelBooking();
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

  // Stabilize reference: `|| []` creates a new array each render when data is undefined
  const bookings = useMemo(
    () => bookingsResponse?.data ?? [],
    [bookingsResponse?.data]
  );
  const visits = visitsData?.data || [];
  const nextTrip = getNextUpcomingBooking(bookings);
  const upcoming = useMemo(
    () => bookings.filter(isUpcomingBooking),
    [bookings]
  );
  const unpaid = useMemo(
    () =>
      upcoming.filter(
        (b) =>
          b.payment_status === "EN_ATTENTE" || b.payment_status === "ECHEC"
      ),
    [upcoming]
  );
  const days = nextTrip ? daysUntil(nextTrip.start_date) : null;

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
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,_rgba(240,132,0,0.14),_transparent_55%)]"
      />

      <div className="relative mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <CustomerPageHeader
          dark
          eyebrow="Espace client"
          title={`Bonjour${user?.first_name ? `, ${user.first_name}` : ""}`}
          description="Votre prochain départ, vos paiements et vos explorations — en un coup d’œil."
          actions={
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-none border-white/20 bg-transparent text-white hover:bg-white/10"
                onClick={() => refetch()}
                disabled={isRefetching}
              >
                <RefreshCw
                  className={cn("mr-2 h-4 w-4", isRefetching && "animate-spin")}
                />
                Actualiser
              </Button>
              <Link href="/residences">
                <Button className="rounded-none bg-[#f08400] px-5 font-semibold text-white hover:bg-[#d97400]">
                  Explorer
                  <ArrowUpRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            </div>
          }
          className="mb-8"
        />

        <CustomerCreditBanner className="mb-6" />

        {/* Snapshot */}
        <section className="mb-8 grid grid-cols-2 gap-px overflow-hidden border border-[#12100c]/08 bg-[#12100c]/08 sm:grid-cols-4">
          {[
            {
              label: "À venir",
              value: String(upcoming.length),
              hint: "réservations",
            },
            {
              label: "À régler",
              value: String(unpaid.length),
              hint: unpaid.length ? "action requise" : "tout est à jour",
              accent: unpaid.length > 0,
            },
            {
              label: "Visites",
              value: String(visits.length),
              hint: "hébergement",
            },
            {
              label: "Prochain",
              value:
                days == null
                  ? "—"
                  : days <= 0
                    ? "Aujourd’hui"
                    : `${days} j`,
              hint: nextTrip ? getBookableTitle(nextTrip) : "aucun séjour",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[#faf8f5] px-4 py-4 sm:px-5 sm:py-5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#12100c]/40">
                {stat.label}
              </p>
              <p
                className={cn(
                  "mt-1 text-2xl font-bold tracking-tight sm:text-3xl",
                  stat.accent ? "text-[#f08400]" : "text-[#12100c]"
                )}
              >
                {isLoadingBookings && stat.label !== "Visites" ? (
                  <Loader2 className="h-6 w-6 animate-spin text-[#f08400]" />
                ) : (
                  stat.value
                )}
              </p>
              <p className="mt-1 truncate text-xs text-[#12100c]/45">
                {stat.hint}
              </p>
            </div>
          ))}
        </section>

        {/* Unpaid alert */}
        {unpaid.length > 0 ? (
          <section className="mb-8 border border-[#f08400]/35 bg-[#fff4e6] px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center bg-[#f08400] text-white">
                  <CreditCard className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-bold text-[#12100c]">
                    {unpaid.length} réservation
                    {unpaid.length > 1 ? "s" : ""} en attente de paiement
                  </p>
                  <p className="text-sm text-[#12100c]/60">
                    Réglez maintenant pour confirmer votre place — l’annulation
                    auto libère l’inventaire après le délai.
                  </p>
                </div>
              </div>
              <Link href={`/customer/bookings/${unpaid[0].id}?checkout=1`}>
                <Button className="h-11 w-full rounded-none bg-[#f08400] font-semibold hover:bg-[#d97400] sm:w-auto">
                  Payer maintenant
                </Button>
              </Link>
            </div>
          </section>
        ) : null}

        {/* Next trip */}
        <section className="mb-12">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f08400]">
                Prochain séjour
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#12100c]">
                {nextTrip
                  ? days != null && days > 0
                    ? `Dans ${days} jour${days > 1 ? "s" : ""}`
                    : days === 0
                      ? "C’est aujourd’hui"
                      : "Déjà commencé"
                  : "Rien de prévu"}
              </h2>
              {nextTrip ? (
                <p className="mt-1 text-sm text-[#12100c]/50">
                  {formatBookingDate(nextTrip.start_date)} →{" "}
                  {formatBookingDate(nextTrip.end_date)}
                </p>
              ) : null}
            </div>
            <Link
              href="/customer/bookings"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#f08400] hover:underline"
            >
              Toutes les réservations
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoadingBookings ? (
            <div className="flex flex-col items-center justify-center border border-[#12100c]/08 bg-white/80 py-20 backdrop-blur-sm">
              <Loader2 className="mb-3 h-10 w-10 animate-spin text-[#f08400]" />
              <p className="text-sm text-[#12100c]/50">
                Chargement de votre séjour…
              </p>
            </div>
          ) : nextTrip ? (
            <BookingTripCard
              booking={nextTrip}
              featured
              onCancel={setBookingToCancel}
            />
          ) : (
            <div className="relative overflow-hidden border border-[#12100c]/08 bg-white px-6 py-14 text-center sm:px-10">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 bg-[#f08400]/10 blur-2xl"
              />
              <CalendarDays className="relative mx-auto mb-4 h-11 w-11 text-[#f08400]" />
              <h3 className="relative text-xl font-bold text-[#12100c]">
                Aucun séjour à venir
              </h3>
              <p className="relative mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#12100c]/55">
                Planifiez votre prochaine escapade — résidences, hôtels, tables
                ou nightlife.
              </p>
              <div className="relative mt-7 flex flex-wrap justify-center gap-2">
                {EXPLORE.map(({ href, label }) => (
                  <Link key={href} href={href}>
                    <Button
                      variant="outline"
                      className="rounded-none border-[#12100c]/12"
                    >
                      {label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Explore + account */}
        <section className="mb-12 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f08400]">
              Continuer à explorer
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {EXPLORE.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex flex-col items-start border border-[#12100c]/08 bg-white p-4 transition-colors hover:border-[#f08400]/40 hover:bg-[#fff4e8]/40"
                >
                  <span className="mb-3 flex h-9 w-9 items-center justify-center bg-[#fff4e8] text-[#f08400] transition-colors group-hover:bg-[#f08400] group-hover:text-white">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-bold text-[#12100c]">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f08400]">
              Compte
            </p>
            <div className="space-y-2">
              <Link
                href="/customer/bookings"
                className="flex items-center justify-between border border-[#12100c]/08 bg-white px-4 py-3.5 transition-colors hover:border-[#f08400]/35"
              >
                <span className="flex items-center gap-3">
                  <CalendarDays className="h-4 w-4 text-[#f08400]" />
                  <span className="text-sm font-semibold text-[#12100c]">
                    Mes réservations
                  </span>
                </span>
                <ArrowUpRight className="h-4 w-4 text-[#12100c]/35" />
              </Link>
              <Link
                href="/customer/profile"
                className="flex items-center justify-between border border-[#12100c]/08 bg-white px-4 py-3.5 transition-colors hover:border-[#f08400]/35"
              >
                <span className="flex items-center gap-3">
                  <UserRound className="h-4 w-4 text-[#f08400]" />
                  <span className="text-sm font-semibold text-[#12100c]">
                    Mon profil
                  </span>
                </span>
                <ArrowUpRight className="h-4 w-4 text-[#12100c]/35" />
              </Link>
              <Link
                href="/se-loger"
                className="flex items-center justify-between border border-[#12100c]/08 bg-white px-4 py-3.5 transition-colors hover:border-[#f08400]/35"
              >
                <span className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-[#f08400]" />
                  <span className="text-sm font-semibold text-[#12100c]">
                    Se loger
                  </span>
                </span>
                <ArrowUpRight className="h-4 w-4 text-[#12100c]/35" />
              </Link>
            </div>
          </div>
        </section>

        {/* Visits */}
        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f08400]">
                Hébergement
              </p>
              <h2 className="mt-1 text-xl font-bold text-[#12100c]">
                Visites planifiées
              </h2>
            </div>
            <Link
              href="/se-loger"
              className="text-sm font-semibold text-[#f08400] hover:underline"
            >
              Catalogue
            </Link>
          </div>

          {isLoadingVisits ? (
            <div className="flex justify-center border border-[#12100c]/08 bg-white py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#f08400]" />
            </div>
          ) : visits.length === 0 ? (
            <div className="border border-[#12100c]/08 bg-white px-5 py-10 text-center">
              <Building2 className="mx-auto mb-3 h-10 w-10 text-[#12100c]/25" />
              <p className="text-sm text-[#12100c]/55">
                Aucune visite d&apos;hébergement pour le moment.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[#12100c]/06 border border-[#12100c]/08 bg-white">
              {visits.slice(0, 4).map((visit) => (
                <li
                  key={visit.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-[#12100c]">
                      {visit.dwelling
                        ? [visit.dwelling.address, visit.dwelling.city]
                            .filter(Boolean)
                            .join(", ")
                        : `Visite ${visit.visit_reference}`}
                    </p>
                    <p className="mt-0.5 text-sm text-[#12100c]/50">
                      {formatBookingDate(visit.scheduled_at)}
                    </p>
                  </div>
                  <span className="border border-[#f08400]/35 bg-[#fff4e8] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#c45f00]">
                    {visit.status_label || visit.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

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
