"use client";

import { Users } from "lucide-react";
import { UnitAvailabilityBadge } from "@/components/front-office/UnitAvailabilityBadge";
import type { UnitAvailability } from "@/components/front-office/UnitAvailabilityBadge";
import { cn } from "@/lib/utils";

export type VenueUnitRow = {
  id: number;
  title: string;
  meta?: string | null;
  capacity?: number | null;
  availability?: UnitAvailability | null;
};

/**
 * Liste lecture seule des unités (tables / zones) avec état + délai de libération.
 */
export function VenueUnitsAvailabilityList({
  title,
  units,
  emptyMessage = "Aucune unité configurée.",
  className,
}: {
  title: string;
  units: VenueUnitRow[];
  emptyMessage?: string;
  className?: string;
}) {
  const active = units.filter(Boolean);

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#12100c]/45">
        {title}
      </h3>
      {active.length === 0 ? (
        <p className="text-sm text-[#12100c]/50">{emptyMessage}</p>
      ) : (
        <ul className="space-y-2">
          {active.map((unit) => (
            <li
              key={unit.id}
              className="flex flex-wrap items-start justify-between gap-3 border border-[#12100c]/08 bg-white px-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-semibold text-[#12100c]">{unit.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#12100c]/50">
                  {unit.capacity != null ? (
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {unit.capacity} pers.
                    </span>
                  ) : null}
                  {unit.meta ? <span>{unit.meta}</span> : null}
                </div>
              </div>
              <UnitAvailabilityBadge
                availability={unit.availability}
                compact
                className="shrink-0"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
