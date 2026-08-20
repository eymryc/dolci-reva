/** Durées de créneau hospitality (alignées sur config/booking.php API). */

export const HOSPITALITY_SLOT_MINUTES = {
  restaurant: 120,
  lounge: 120,
  bar: 120,
  night_club: 360,
} as const;

export type HospitalityVertical = keyof typeof HOSPITALITY_SLOT_MINUTES;

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

export function slotEndFor(
  start: Date,
  vertical: HospitalityVertical
): Date {
  return addMinutes(start, HOSPITALITY_SLOT_MINUTES[vertical]);
}

export function formatBookingDateTime(date: Date): string {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${mo}-${d} ${h}:${mi}:00`;
}

export function formatSlotDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function formatSlotTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function formatDurationLabel(minutes: number): string {
  if (minutes % 60 === 0) {
    const h = minutes / 60;
    return `${h} h`;
  }
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
}

export function formatTimeRange(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };
  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  const startStr = start.toLocaleTimeString("fr-FR", opts);
  if (sameDay) {
    return `${startStr} – ${end.toLocaleTimeString("fr-FR", opts)}`;
  }
  return `${start.toLocaleString("fr-FR", {
    ...opts,
    day: "numeric",
    month: "short",
  })} – ${end.toLocaleString("fr-FR", {
    ...opts,
    day: "numeric",
    month: "short",
  })}`;
}
