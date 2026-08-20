"use client";

import Link from "next/link";
import { CalendarDays, Users, Ban, Trash2, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Booking } from "@/types/entities/booking.types";
import { guestsLabel } from "@/lib/customer-booking";
import { useBackofficePath } from "@/hooks/use-host-view";

const STATUS_META: Record<string, { label: string; className: string; dot: string }> = {
  CONFIRME: {
    label: "Confirmée",
    className: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  EN_ATTENTE: {
    label: "En attente",
    className: "text-amber-700",
    dot: "bg-amber-400",
  },
  ANNULE: {
    label: "Annulée",
    className: "text-red-600",
    dot: "bg-red-500",
  },
  COMPLETE: {
    label: "Terminée",
    className: "text-slate-600",
    dot: "bg-slate-400",
  },
};

function formatMoney(value: string | number) {
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatRange(start?: string, end?: string) {
  if (!start) return "—";
  const s = new Date(start).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
  if (!end) return s;
  const e = new Date(end).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${s} → ${e}`;
}

interface HostBookingListProps {
  bookings: Booking[];
  onCancel?: (booking: Booking) => void;
  onDelete?: (booking: Booking) => void;
}

export function HostBookingList({ bookings, onCancel, onDelete }: HostBookingListProps) {
  const bo = useBackofficePath();

  if (bookings.length === 0) {
    return (
      <div className="relative overflow-hidden border border-dashed border-slate-200/90 bg-white px-6 py-20 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(240,132,0,0.04),_transparent_55%)]"
        />
        <CalendarDays className="relative mx-auto h-8 w-8 text-slate-300" />
        <p className="relative mt-5 text-lg font-semibold tracking-tight text-slate-900">
          Aucune réservation
        </p>
        <p className="relative mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
          Les prochaines réservations apparaîtront ici dès qu&apos;un voyageur réserve.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {bookings.map((booking, index) => {
        const meta = STATUS_META[booking.status] || {
          label: booking.status,
          className: "text-slate-600",
          dot: "bg-slate-300",
        };
        const guest = booking.customer
          ? `${booking.customer.first_name} ${booking.customer.last_name}`.trim()
          : "Client";
        const detailHref = bo(`/bookings/${booking.id}`);

        return (
          <li
            key={booking.id}
            className="group animate-in fade-in-0 slide-in-from-bottom-2 border border-slate-200/80 bg-white fill-mode-both duration-500 transition-colors hover:border-slate-300"
            style={{ animationDelay: `${Math.min(index, 10) * 35}ms` }}
          >
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <Link href={detailHref} className="block min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    {booking.booking_reference || `#${booking.id}`}
                  </p>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-[11px] font-semibold",
                      meta.className
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5", meta.dot)} />
                    {meta.label}
                  </span>
                </div>
                <h3 className="mt-2 truncate text-[17px] font-semibold tracking-tight text-slate-900 group-hover:text-[#f08400]">
                  {guest}
                </h3>
                <p className="mt-0.5 truncate text-sm text-slate-500">
                  {booking.bookable?.name || "Établissement"}
                </p>
                <div className="mt-3.5 flex flex-wrap gap-x-5 gap-y-1.5 text-[12px] text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 opacity-50" />
                    {formatRange(booking.start_date, booking.end_date)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 opacity-50" />
                    {guestsLabel(booking)}
                  </span>
                </div>
              </Link>

              <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end">
                <p className="text-xl font-semibold tracking-tight text-slate-900">
                  {formatMoney(booking.total_price)}
                </p>
                <div className="flex gap-2">
                  <Link href={detailHref}>
                    <Button
                      size="sm"
                      className="h-9 rounded-none bg-[#12100c] text-xs text-white hover:bg-[#f08400]"
                    >
                      Voir
                      <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  {onCancel &&
                  booking.status !== "ANNULE" &&
                  booking.status !== "COMPLETE" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCancel(booking)}
                      className="h-9 rounded-none border-slate-200 text-xs"
                    >
                      <Ban className="mr-1.5 h-3.5 w-3.5" />
                      Annuler
                    </Button>
                  ) : null}
                  {onDelete ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(booking)}
                      className="h-9 rounded-none border-red-100 text-xs text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Supprimer
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
