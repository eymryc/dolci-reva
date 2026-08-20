"use client";

import type { HotelRoom } from "@/types/entities/hotel.types";
import {
  UnitAvailabilityBadge,
  type UnitAvailability,
} from "@/components/front-office/UnitAvailabilityBadge";

/** Compat hôtel : délègue au badge partagé. */
export function HotelRoomAvailabilityBadge({
  room,
  className,
}: {
  room: HotelRoom;
  className?: string;
}) {
  const fallback: UnitAvailability | null = room.availability
    ? room.availability
    : room.is_available === false
      ? {
          status: "blocked",
          label: "Indisponible",
          message: "Chambre temporairement indisponible",
        }
      : null;

  return (
    <UnitAvailabilityBadge availability={fallback} className={className} />
  );
}
