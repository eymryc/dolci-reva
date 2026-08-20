"use client";

import { Check } from "lucide-react";
import { useFeatureCategories } from "@/hooks/use-feature-categories";
import { LucideIconByName } from "@/components/ui/LucideIconByName";
import { cn } from "@/lib/utils";

interface FeatureOptionsPickerProps {
  /** Ex: "RESIDENCE", "HOTEL", "HOTEL_ROOM", "RESTAURANT", "LOUNGE" — cf. App\Enums\EstablishmentType côté API. */
  establishmentType: string;
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  error?: string;
}

/**
 * Sélecteur d'équipements groupés par catégorie — style success cards espace hôte.
 */
export function FeatureOptionsPicker({
  establishmentType,
  selectedIds,
  onChange,
  error,
}: FeatureOptionsPickerProps) {
  const { data: categories = [], isLoading } = useFeatureCategories(establishmentType);

  const toggle = (optionId: number) => {
    onChange(
      selectedIds.includes(optionId)
        ? selectedIds.filter((id) => id !== optionId)
        : [...selectedIds, optionId]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center border border-[#f08400]/20 bg-[#fffaf5] py-10">
        <p className="text-sm text-slate-500">Chargement des équipements…</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center border border-dashed border-[#f08400]/25 bg-[#fffaf5] py-10">
        <p className="text-sm text-slate-500">
          Aucun équipement disponible pour ce type d&apos;établissement.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border border-[#f08400]/20 bg-gradient-to-r from-[#fff4e8] to-white px-4 py-3">
        <p className="text-sm text-slate-600">
          Sélectionnez les commodités proposées dans votre établissement.
        </p>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#f08400]">
          {selectedIds.length} sélectionné{selectedIds.length > 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-5">
        {categories.map((category) => (
          <div
            key={category.id}
            className="border border-[#f08400]/15 bg-white px-4 py-4 sm:px-5"
          >
            <h4 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f08400]">
              <LucideIconByName name={category.icon} className="h-3.5 w-3.5" />
              {category.name}
            </h4>
            <div className="flex flex-wrap gap-2">
              {category.options.map((option) => {
                const isSelected = selectedIds.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggle(option.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 border px-3 py-2 text-xs font-medium transition-all duration-200",
                      "rounded-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f08400]/30",
                      isSelected
                        ? "border-[#f08400] bg-[#fff4e8] text-[#c96d00] shadow-[0_6px_16px_-10px_rgba(240,132,0,0.7)]"
                        : "border-slate-200 bg-white text-slate-700 hover:border-[#f08400]/35 hover:bg-[#fffaf5]"
                    )}
                  >
                    {isSelected ? (
                      <span className="flex h-4 w-4 items-center justify-center bg-[#f08400] text-white">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    ) : null}
                    <span>{option.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {error ? (
        <p className="flex items-center gap-1 text-sm text-red-500">
          <span>•</span>
          {error}
        </p>
      ) : null}
    </div>
  );
}
