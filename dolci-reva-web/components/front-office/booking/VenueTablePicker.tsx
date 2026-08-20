"use client";

import { Loader2, Users, Armchair } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { VenueTable } from "@/hooks/use-venue-tables";
import { UnitAvailabilityBadge } from "@/components/front-office/UnitAvailabilityBadge";

function formatMoney(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return "";
  return Math.round(n).toLocaleString("fr-FR");
}

export function VenueTablePicker({
  tables,
  selectedIds,
  onToggle,
  isLoading,
  isError = false,
  label = "Choisir une table",
  emptyMessage = "Aucune table disponible pour ce créneau. Essayez une autre horaire.",
  errorMessage = "Impossible de charger les tables. Réessayez dans un instant.",
  hint = "Sélectionnez au moins une table pour confirmer votre réservation.",
}: {
  tables: VenueTable[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  isLoading?: boolean;
  isError?: boolean;
  label?: string;
  emptyMessage?: string;
  errorMessage?: string;
  hint?: string;
}) {
  return (
    <div>
      <Label className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-gray-700">
        <Armchair className="h-4 w-4" />
        {label}
      </Label>
      <p className="mb-2 text-xs text-gray-500">{hint}</p>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 border border-gray-200 bg-gray-50 py-6 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin text-[#f08400]" />
          Recherche des tables…
        </div>
      ) : isError ? (
        <div className="border border-dashed border-red-300 bg-red-50 px-3 py-4 text-sm text-red-800">
          {errorMessage}
        </div>
      ) : tables.length === 0 ? (
        <div className="border border-dashed border-amber-300 bg-amber-50 px-3 py-4 text-sm text-amber-800">
          {emptyMessage}
        </div>
      ) : (
        <ul className="max-h-56 space-y-2 overflow-y-auto">
          {tables.map((table) => {
            const selected = selectedIds.includes(table.id);
            const minSpend = formatMoney(table.minimum_spend);
            return (
              <li key={table.id}>
                <button
                  type="button"
                  onClick={() => onToggle(table.id)}
                  className={cn(
                    "w-full border px-3 py-2.5 text-left transition-colors",
                    selected
                      ? "border-[#f08400] bg-[#fff4e8] ring-1 ring-[#f08400]"
                      : "border-gray-200 bg-white hover:border-[#f08400]/40"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {table.display_name ||
                          `Table ${table.table_number}`}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {[
                          table.location_description || table.location,
                          table.type_description || table.table_type,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      {table.availability ? (
                        <div className="mt-2">
                          <UnitAvailabilityBadge
                            availability={table.availability}
                            compact
                          />
                        </div>
                      ) : null}
                    </div>
                    <div className="shrink-0 text-right text-xs text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {table.capacity}
                      </span>
                      {minSpend ? (
                        <p className="mt-1 font-semibold text-[#f08400]">
                          Min. {minSpend} FCFA
                        </p>
                      ) : null}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
