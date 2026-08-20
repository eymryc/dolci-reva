"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  CalendarDays,
  CreditCard,
  MapPin,
  Users,
} from "lucide-react";
import type { Booking } from "@/types/entities/booking.types";
import {
  bookableTypeLabel,
  formatBookingDateRange,
  formatMoney,
  getBookableImage,
  getBookableLocation,
  getBookableTitle,
  getBookingUnitLabel,
  guestsLabel,
} from "@/lib/customer-booking";
import { BookingStatusBadge, PaymentStatusBadge } from "./BookingStatusBadge";
import { BookingCancelDeadline } from "./BookingCancelDeadline";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BookingTripCard({
  booking,
  featured,
  onCancel,
}: {
  booking: Booking;
  featured?: boolean;
  onCancel?: (booking: Booking) => void;
}) {
  const image = getBookableImage(booking);
  const title = getBookableTitle(booking);
  const location = getBookableLocation(booking);
  const typeLabel = bookableTypeLabel(booking.bookable_type, booking.bookable);
  const unitLabel = getBookingUnitLabel(booking);
  const needsPayment =
    booking.payment_status === "EN_ATTENTE" ||
    booking.payment_status === "ECHEC";
  const canCancel =
    booking.status !== "ANNULE" &&
    booking.status !== "COMPLETE" &&
    !!onCancel;

  return (
    <article
      className={cn(
        "group relative grid overflow-hidden border border-[#12100c]/08 bg-white transition-[transform,box-shadow,border-color] duration-500",
        "hover:-translate-y-0.5 hover:border-[#f08400]/35 hover:shadow-[0_28px_60px_-36px_rgba(18,16,12,0.55)]",
        "md:grid-cols-[minmax(11rem,38%)_1fr]",
        featured && "border-[#f08400]/40 ring-1 ring-[#f08400]/20"
      )}
    >
      {/* Media */}
      <div className="relative aspect-[16/11] overflow-hidden bg-[#12100c]/05 md:aspect-auto md:min-h-[220px]">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            unoptimized
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 40vw"
          />
        ) : (
          <div className="flex h-full min-h-[180px] items-center justify-center bg-[radial-gradient(ellipse_at_top,_#fff4e8,_#faf8f5_55%)]">
            <span className="text-sm font-semibold tracking-wide text-[#f08400]">
              {typeLabel}
            </span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#12100c]/55 via-[#12100c]/10 to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-[#12100c]/25" />
        <span className="absolute left-3 top-3 bg-[#12100c] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
          {typeLabel}
        </span>
        {needsPayment ? (
          <span className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-[#f08400] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            <CreditCard className="h-3 w-3" />
            À régler
          </span>
        ) : null}
      </div>

      {/* Body */}
      <div className="flex flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-bold tracking-tight text-[#12100c] transition-colors group-hover:text-[#f08400]">
              {title}
            </h3>
            {unitLabel ? (
              <p className="mt-1 text-sm font-medium text-[#f08400]">
                {unitLabel}
              </p>
            ) : null}
            {location ? (
              <p className="mt-2 flex items-start gap-1.5 text-sm leading-snug text-[#12100c]/55">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f08400]" />
                <span className="line-clamp-2">{location}</span>
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap justify-end gap-1.5">
            <BookingStatusBadge status={booking.status} />
            <PaymentStatusBadge status={booking.payment_status} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 border-y border-[#12100c]/06 py-4 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#12100c]/08 bg-[#faf8f5] text-[#f08400]">
              <CalendarDays className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#12100c]/40">
                Dates
              </p>
              <p className="text-sm font-medium text-[#12100c]/80">
                {formatBookingDateRange(booking.start_date, booking.end_date)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#12100c]/08 bg-[#faf8f5] text-[#f08400]">
              <Users className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#12100c]/40">
                Groupe
              </p>
              <p className="text-sm font-medium text-[#12100c]/80">
                {guestsLabel(booking)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <BookingCancelDeadline booking={booking} compact />
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#12100c]/40">
              Total
            </p>
            <p className="mt-0.5 text-2xl font-bold tracking-tight text-[#f08400]">
              {formatMoney(booking.total_price)}
              <span className="ml-1 text-sm font-semibold text-[#12100c]/45">
                FCFA
              </span>
            </p>
            <p className="mt-1 font-mono text-[11px] tracking-wide text-[#12100c]/35">
              {booking.booking_reference}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canCancel ? (
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-none border-[#d96b6b]/50 bg-[#fdf0f0] px-3 text-xs font-semibold text-[#b42318] hover:bg-[#f8d7d7] hover:text-[#8f1b12]"
                onClick={() => onCancel?.(booking)}
              >
                Annuler
              </Button>
            ) : null}
            <Link href={`/customer/bookings/${booking.id}${needsPayment ? "?checkout=1" : ""}`}>
              <Button
                className={cn(
                  "h-11 rounded-none px-5 font-semibold transition-all",
                  needsPayment
                    ? "bg-[#f08400] text-white hover:bg-[#d97400]"
                    : "bg-[#12100c] text-white hover:bg-[#f08400]"
                )}
              >
                {needsPayment ? (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Payer
                  </>
                ) : (
                  <>
                    Voir
                    <ArrowUpRight className="ml-1.5 h-4 w-4" />
                  </>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
