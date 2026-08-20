"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Ban,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  UserRound,
  Users,
} from "lucide-react";
import {
  useBooking,
  useCancelBooking,
  useConfirmBooking,
} from "@/hooks/use-bookings";
import { useBackofficePath } from "@/hooks/use-host-view";
import { HostShell } from "@/components/admin/host/HostShell";
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/customer/BookingStatusBadge";
import { BookingCancelDeadline } from "@/components/customer/BookingCancelDeadline";
import { DeleteConfirmationDialog } from "@/components/admin/shared/DeleteConfirmationDialog";
import { Button } from "@/components/ui/button";
import {
  bookableTypeLabel,
  formatBookingDate,
  formatMoney,
  getBookableLocation,
  getBookableTitle,
  getBookingUnitLabel,
  guestsLabel,
} from "@/lib/customer-booking";
import { useState } from "react";

export default function OwnerBookingDetailPage() {
  const params = useParams();
  const bookingId = params?.id ? parseInt(params.id as string, 10) : 0;
  const bo = useBackofficePath();
  const { data: booking, isLoading, error } = useBooking(bookingId);
  const confirmMutation = useConfirmBooking();
  const cancelMutation = useCancelBooking();
  const [cancelOpen, setCancelOpen] = useState(false);

  if (isLoading) {
    return (
      <HostShell>
        <div className="flex min-h-[40vh] flex-col items-center justify-center">
          <Loader2 className="mb-3 h-10 w-10 animate-spin text-[#f08400]" />
          <p className="text-sm text-slate-500">Chargement de la réservation…</p>
        </div>
      </HostShell>
    );
  }

  if (error || !booking) {
    return (
      <HostShell>
        <div className="mx-auto max-w-lg border border-slate-200 bg-white px-6 py-12 text-center">
          <h1 className="text-xl font-bold text-slate-900">Introuvable</h1>
          <p className="mt-2 text-sm text-slate-500">
            Impossible de charger les détails de cette réservation.
          </p>
          <Link href={bo("/bookings")} className="mt-6 inline-block">
            <Button className="rounded-none bg-[#f08400] hover:bg-[#d97400]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux réservations
            </Button>
          </Link>
        </div>
      </HostShell>
    );
  }

  const title = getBookableTitle(booking);
  const location = getBookableLocation(booking);
  const typeLabel = bookableTypeLabel(booking.bookable_type, booking.bookable);
  const unitLabel = getBookingUnitLabel(booking);
  const guestName = booking.customer
    ? `${booking.customer.first_name || ""} ${booking.customer.last_name || ""}`.trim()
    : "Client";
  const canConfirm = booking.status === "EN_ATTENTE";
  const canCancel =
    booking.status !== "ANNULE" && booking.status !== "COMPLETE";

  return (
    <HostShell>
      <div className="mx-auto w-full max-w-4xl">
        <Link
          href={bo("/bookings")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#f08400]"
        >
          <ArrowLeft className="h-4 w-4" />
          Réservations
        </Link>

        <header className="mb-8 border border-[#f08400]/20 bg-gradient-to-br from-[#fff4e8] via-white to-white px-5 py-6 sm:px-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f08400]">
                {typeLabel} · {booking.booking_reference}
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {title}
              </h1>
              {unitLabel ? (
                <p className="mt-1 text-sm font-medium text-[#f08400]">
                  {unitLabel}
                </p>
              ) : null}
              {location ? (
                <p className="mt-2 flex items-start gap-1.5 text-sm text-slate-500">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f08400]" />
                  {location}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <BookingStatusBadge status={booking.status} />
              <PaymentStatusBadge status={booking.payment_status} />
            </div>
          </div>
        </header>

        <div className="mb-6">
          <BookingCancelDeadline booking={booking} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="border border-slate-200 bg-white p-5">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Client
            </p>
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center bg-[#fff4e8] text-[#f08400]">
                <UserRound className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-slate-900">{guestName || "—"}</p>
                {booking.customer?.email ? (
                  <p className="mt-0.5 text-sm text-slate-500">
                    {booking.customer.email}
                  </p>
                ) : null}
                {booking.customer?.phone ? (
                  <p className="text-sm text-slate-500">
                    {booking.customer.phone}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="border border-slate-200 bg-white p-5">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Paiement
            </p>
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center bg-[#fff4e8] text-[#f08400]">
                <CreditCard className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-bold text-[#f08400]">
                  {formatMoney(booking.total_price)}{" "}
                  <span className="text-sm font-semibold text-slate-400">
                    FCFA
                  </span>
                </p>
                {booking.owner_amount != null ? (
                  <p className="mt-1 text-xs text-slate-500">
                    Votre part : {formatMoney(booking.owner_amount)} FCFA
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="border border-slate-200 bg-white p-5">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Dates
            </p>
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-[#f08400]" />
              <div>
                <p className="font-semibold text-slate-900">
                  {formatBookingDate(booking.start_date)} →{" "}
                  {formatBookingDate(booking.end_date)}
                </p>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 bg-white p-5">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Groupe
            </p>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-[#f08400]" />
              <p className="font-semibold text-slate-900">
                {guestsLabel(booking)}
              </p>
            </div>
          </div>
        </div>

        {booking.notes ? (
          <div className="mt-4 border border-slate-200 bg-white p-5">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Notes
            </p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
              {booking.notes}
            </p>
          </div>
        ) : null}

        {booking.cancellation_policy?.summary ? (
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            {booking.cancellation_policy.summary}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-2">
          {canConfirm ? (
            <Button
              type="button"
              className="h-11 rounded-none bg-[#f08400] px-5 font-semibold hover:bg-[#d97400]"
              disabled={confirmMutation.isPending}
              onClick={() => confirmMutation.mutate({ id: booking.id })}
            >
              {confirmMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Confirmer la réservation
            </Button>
          ) : null}
          {canCancel ? (
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-none border-[#d96b6b]/50 bg-[#fdf0f0] px-5 font-semibold text-[#b42318] hover:bg-[#f8d7d7]"
              onClick={() => setCancelOpen(true)}
            >
              <Ban className="mr-2 h-4 w-4" />
              Annuler
            </Button>
          ) : null}
          <Link href={bo("/bookings")}>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-none border-slate-200"
            >
              Retour
            </Button>
          </Link>
        </div>
      </div>

      <DeleteConfirmationDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={() => {
          cancelMutation.mutate(
            { id: booking.id },
            { onSuccess: () => setCancelOpen(false) }
          );
        }}
        title="Annuler la réservation"
        description="Êtes-vous sûr de vouloir annuler cette réservation ?"
        itemName={booking.booking_reference}
        isLoading={cancelMutation.isPending}
      />
    </HostShell>
  );
}
