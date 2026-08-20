import type { Booking } from "@/types/entities/booking.types";

export function toMoneyInt(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0;
  const n =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? Math.round(n) : 0;
}

export function formatMoney(value: string | number | null | undefined): string {
  return toMoneyInt(value).toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function formatBookingDate(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatBookingDateRange(start: string, end: string): string {
  return `${formatBookingDate(start)} → ${formatBookingDate(end)}`;
}

/** Normalize morph type: App\Models\Hotel → hotel */
export function resolveBookableKind(bookableType?: string | null): string {
  if (!bookableType) return "lieu";
  const raw = bookableType.includes("\\")
    ? bookableType.split("\\").pop() || bookableType
    : bookableType;
  return raw.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
}

export function bookableTypeLabel(
  bookableType?: string | null,
  bookable?: { venue_type?: string | null } | null
): string {
  const venueType = bookable?.venue_type?.toUpperCase();
  if (venueType === "BAR") return "Bar";
  if (venueType === "LOUNGE") return "Lounge";

  const kind = resolveBookableKind(bookableType);
  const labels: Record<string, string> = {
    hotel: "Hôtel",
    residence: "Résidence",
    restaurant: "Restaurant",
    lounge: "Lounge",
    bar: "Bar",
    nightclub: "Night-club",
    night_club: "Night-club",
    dwelling: "Hébergement",
  };
  return labels[kind] || "Établissement";
}

export function bookableBrowseHref(
  bookableType?: string | null,
  bookable?: { venue_type?: string | null } | null
): string {
  if (bookable?.venue_type?.toUpperCase() === "BAR") return "/bars";

  const kind = resolveBookableKind(bookableType);
  const map: Record<string, string> = {
    hotel: "/hotels",
    residence: "/residences",
    restaurant: "/restaurants",
    lounge: "/lounges",
    bar: "/bars",
    nightclub: "/night-clubs",
    night_club: "/night-clubs",
    dwelling: "/se-loger",
  };
  return map[kind] || "/";
}

export function isStayBooking(booking: Booking): boolean {
  const kind = resolveBookableKind(booking.bookable_type);
  return kind === "hotel" || kind === "residence";
}

export function guestsLabel(booking: Booking): string {
  const n = booking.guests;
  if (isStayBooking(booking)) {
    return `${n} voyageur${n > 1 ? "s" : ""}`;
  }
  return `${n} convive${n > 1 ? "s" : ""}`;
}

export function getBookingUnitLabel(booking: Booking): string | null {
  if (booking.hotel_room) {
    const room = booking.hotel_room;
    const parts = [
      room.name || (room.room_number ? `Chambre ${room.room_number}` : null),
      room.type,
    ].filter(Boolean);
    return parts.join(" · ") || null;
  }

  if (booking.restaurant_tables?.length) {
    return booking.restaurant_tables
      .map((t) => `Table ${t.table_number}`)
      .join(", ");
  }

  if (booking.lounge_tables?.length) {
    return booking.lounge_tables
      .map((t) => `Table ${t.table_number}`)
      .join(", ");
  }

  if (booking.night_club_areas?.length) {
    return booking.night_club_areas.map((a) => a.area_name).join(", ");
  }

  return null;
}

export function getBookableImage(booking: Booking): string | null {
  const room = booking.hotel_room as
    | (Booking["hotel_room"] & {
        main_image_url?: string | null;
        main_image_thumb_url?: string | null;
      })
    | null
    | undefined;

  const fromRoom = room?.main_image_url || room?.main_image_thumb_url || null;
  if (fromRoom) return absoluteMediaUrl(fromRoom);

  const b = booking.bookable as Booking["bookable"] & {
    main_image_url?: string | null;
    main_image_thumb_url?: string | null;
    gallery_images?: Array<{ url?: string; thumb_url?: string }>;
    all_images?: Array<{ url?: string; thumb_url?: string }>;
  };

  const fromBookable =
    b?.main_image_url ||
    b?.main_image_thumb_url ||
    b?.gallery_images?.[0]?.url ||
    b?.gallery_images?.[0]?.thumb_url ||
    b?.all_images?.[0]?.url ||
    null;

  return fromBookable ? absoluteMediaUrl(fromBookable) : null;
}

/** Assure une URL absolue pour next/image (API locale /storage/…). */
function absoluteMediaUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  const laravel = process.env.LARAVEL_API_URL || "";
  const laravelHost = laravel.match(/^https?:\/\/([^/]+)/)?.[1];
  let host =
    process.env.NEXT_PUBLIC_API_HOSTNAME ||
    laravelHost ||
    "dolci-reva.com";

  // Local Docker / artisan : garder le port de LARAVEL_API_URL si présent
  if (
    laravelHost?.includes(":") &&
    (host === "127.0.0.1" || host === "localhost")
  ) {
    host = laravelHost;
  }

  const protocol =
    host.includes("127.0.0.1") || host.includes("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;
  if (url.startsWith("/")) return `${origin}${url}`;
  return `${origin}/${url}`;
}

export function getBookableTitle(booking: Booking): string {
  return booking.bookable?.name || `Réservation ${booking.booking_reference}`;
}

export function getBookableLocation(booking: Booking): string {
  const parts = [
    booking.bookable?.address,
    booking.bookable?.city,
    booking.bookable?.country,
  ].filter(Boolean);
  return parts.join(", ");
}

export function isUpcomingBooking(booking: Booking): boolean {
  if (booking.status === "ANNULE") return false;
  const end = new Date(booking.end_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return end >= today;
}

export function isPastBooking(booking: Booking): boolean {
  if (booking.status === "ANNULE") return false;
  const end = new Date(booking.end_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return end < today;
}

export function getNextUpcomingBooking(bookings: Booking[]): Booking | null {
  const upcoming = bookings
    .filter(isUpcomingBooking)
    .sort(
      (a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );
  return upcoming[0] || null;
}

export type BookingListFilter = "all" | "upcoming" | "past" | "cancelled";

export function filterBookings(
  bookings: Booking[],
  filter: BookingListFilter
): Booking[] {
  switch (filter) {
    case "upcoming":
      return bookings.filter(isUpcomingBooking);
    case "past":
      return bookings.filter(isPastBooking);
    case "cancelled":
      return bookings.filter((b) => b.status === "ANNULE");
    default:
      return bookings;
  }
}
