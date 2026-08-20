"use client";

import type { ComponentType } from "react";
import {
  Search,
  MapPin,
  Home,
  ArrowUpDown,
  RotateCcw,
  Star,
  Users,
  BedDouble,
  Building2,
  Hammer,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type ListingFilterValues = {
  search: string;
  city: string;
  type: string;
  standing: string;
  starRating: string;
  structureType: string;
  constructionType: string;
  priceRange: string;
  minGuests: string;
  minBedrooms: string;
  minRooms: string;
  availableOnly: boolean;
  orderPrice: "" | "asc" | "desc";
};

export type ListingFilterOption = {
  value: string;
  label: string;
};

export type ListingFiltersProps = {
  values: ListingFilterValues;
  onChange: (next: ListingFilterValues) => void;
  cities?: string[];
  types?: ListingFilterOption[];
  standings?: ListingFilterOption[];
  priceRanges?: ListingFilterOption[];
  showType?: boolean;
  showStanding?: boolean;
  showStarRating?: boolean;
  showStructureType?: boolean;
  showConstructionType?: boolean;
  showPriceRange?: boolean;
  showGuests?: boolean;
  showBedrooms?: boolean;
  showRooms?: boolean;
  showAvailableOnly?: boolean;
  showPriceSort?: boolean;
  priceSortLabel?: string;
  className?: string;
  sticky?: boolean;
  resultCount?: number;
};

export const RESIDENCE_TYPES: ListingFilterOption[] = [
  { value: "all", label: "Tous les types" },
  { value: "STUDIO", label: "Studio" },
  { value: "APPARTEMENT", label: "Appartement" },
  { value: "VILLA", label: "Villa" },
  { value: "PENTHOUSE", label: "Penthouse" },
  { value: "DUPLEX", label: "Duplex" },
  { value: "TRIPLEX", label: "Triplex" },
];

export const DWELLING_TYPES: ListingFilterOption[] = [
  { value: "all", label: "Tous les types" },
  { value: "STUDIO", label: "Studio" },
  { value: "APPARTEMENT", label: "Appartement" },
  { value: "VILLA", label: "Villa" },
  { value: "MAISON", label: "Maison" },
  { value: "DUPLEX", label: "Duplex" },
  { value: "TRIPLEX", label: "Triplex" },
];

export const STANDING_OPTIONS: ListingFilterOption[] = [
  { value: "all", label: "Tous les standings" },
  { value: "STANDARD", label: "Standard" },
  { value: "SUPERIEUR", label: "Supérieur" },
  { value: "DELUXE", label: "Deluxe" },
  { value: "EXECUTIVE", label: "Executive" },
  { value: "SUITE", label: "Suite" },
  { value: "SUITE_JUNIOR", label: "Suite junior" },
  { value: "SUITE_EXECUTIVE", label: "Suite executive" },
  { value: "SUITE_PRESIDENTIELLE", label: "Suite présidentielle" },
];

export const STRUCTURE_OPTIONS: ListingFilterOption[] = [
  { value: "all", label: "Toutes structures" },
  { value: "MAISON_BASSE", label: "Maison basse" },
  { value: "IMMEUBLE", label: "Immeuble" },
];

export const CONSTRUCTION_OPTIONS: ListingFilterOption[] = [
  { value: "all", label: "Toutes constructions" },
  { value: "NOUVELLE_CONSTRUCTION", label: "Neuve" },
  { value: "ANCIENNE", label: "Ancienne" },
];

/** Nightly budget presets (residences) */
export const RESIDENCE_PRICE_RANGES: ListingFilterOption[] = [
  { value: "all", label: "Tous les budgets" },
  { value: "0-30000", label: "Moins de 30 000" },
  { value: "30000-75000", label: "30 000 – 75 000" },
  { value: "75000-150000", label: "75 000 – 150 000" },
  { value: "150000-", label: "Plus de 150 000" },
];

/** Monthly rent presets (dwellings) */
export const DWELLING_PRICE_RANGES: ListingFilterOption[] = [
  { value: "all", label: "Tous les loyers" },
  { value: "0-100000", label: "Moins de 100 000" },
  { value: "100000-250000", label: "100 000 – 250 000" },
  { value: "250000-500000", label: "250 000 – 500 000" },
  { value: "500000-", label: "Plus de 500 000" },
];

const GUEST_OPTIONS: ListingFilterOption[] = [
  { value: "all", label: "Tous" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "4", label: "4+" },
  { value: "6", label: "6+" },
  { value: "8", label: "8+" },
];

const BEDROOM_OPTIONS: ListingFilterOption[] = [
  { value: "all", label: "Toutes" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
];

const ROOM_OPTIONS: ListingFilterOption[] = [
  { value: "all", label: "Toutes" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
];

const STAR_OPTIONS: ListingFilterOption[] = [
  { value: "all", label: "Toutes" },
  { value: "3", label: "3 étoiles" },
  { value: "4", label: "4 étoiles" },
  { value: "5", label: "5 étoiles" },
];

const fieldClass =
  "h-11 rounded-none border border-[#12100c]/12 bg-[#faf8f5] text-sm text-[#12100c] transition-all hover:bg-white focus:border-[#f08400] focus:ring-2 focus:ring-[#f08400]/15 sm:h-12";

function FilterSelect({
  label,
  value,
  onChange,
  options,
  icon: Icon,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: ListingFilterOption[];
  icon?: ComponentType<{ className?: string }>;
  placeholder?: string;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5c574f]">
        {label}
      </label>
      <Select value={value || "all"} onValueChange={onChange}>
        <SelectTrigger className={cn(fieldClass, "w-full")}>
          <div className="flex min-w-0 items-center gap-2">
            {Icon ? <Icon className="h-4 w-4 shrink-0 text-[#f08400]" /> : null}
            <SelectValue placeholder={placeholder || label} />
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-none">
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function ListingFilters({
  values,
  onChange,
  cities = [],
  types = RESIDENCE_TYPES,
  standings = STANDING_OPTIONS,
  priceRanges = RESIDENCE_PRICE_RANGES,
  showType = false,
  showStanding = false,
  showStarRating = false,
  showStructureType = false,
  showConstructionType = false,
  showPriceRange = false,
  showGuests = false,
  showBedrooms = false,
  showRooms = false,
  showAvailableOnly = false,
  showPriceSort = false,
  priceSortLabel = "Trier par prix",
  className,
  sticky = true,
  resultCount,
}: ListingFiltersProps) {
  const hasActiveFilters = Boolean(
    values.search.trim() ||
      values.city ||
      (values.type && values.type !== "all") ||
      (values.standing && values.standing !== "all") ||
      (values.starRating && values.starRating !== "all") ||
      (values.structureType && values.structureType !== "all") ||
      (values.constructionType && values.constructionType !== "all") ||
      (values.priceRange && values.priceRange !== "all") ||
      (values.minGuests && values.minGuests !== "all") ||
      (values.minBedrooms && values.minBedrooms !== "all") ||
      (values.minRooms && values.minRooms !== "all") ||
      values.availableOnly ||
      values.orderPrice
  );

  const patch = (partial: Partial<ListingFilterValues>) => {
    onChange({ ...values, ...partial });
  };

  const reset = () => onChange({ ...EMPTY_LISTING_FILTERS });

  const cityOptions: ListingFilterOption[] = [
    { value: "all", label: "Toutes les villes" },
    ...cities.map((c) => ({ value: c, label: c })),
  ];

  return (
    <aside
      className={cn(
        "overflow-hidden border border-[#12100c]/08 bg-white",
        sticky && "lg:sticky lg:top-24",
        className
      )}
    >
      <div className="border-b border-[#12100c]/08 bg-[#12100c] px-5 py-4 sm:px-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#ffb347]">
          Affiner
        </p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <h3 className="text-lg font-bold tracking-tight text-white sm:text-xl">
            Filtres
          </h3>
          {typeof resultCount === "number" && (
            <span className="text-xs text-white/55">
              {resultCount} résultat{resultCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      <div className="max-h-[70vh] space-y-4 overflow-y-auto p-4 sm:space-y-5 sm:p-6 lg:max-h-[calc(100vh-8rem)]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5c574f]" />
          <Input
            placeholder="Rechercher…"
            value={values.search}
            onChange={(e) => patch({ search: e.target.value })}
            className={cn(fieldClass, "pl-9")}
          />
        </div>

        <div
          className={cn(
            "grid gap-3 sm:gap-4",
            showType ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
          )}
        >
          <FilterSelect
            label="Ville"
            value={values.city || "all"}
            onChange={(v) => patch({ city: v === "all" ? "" : v })}
            options={cityOptions}
            icon={MapPin}
          />
          {showType && (
            <FilterSelect
              label="Type"
              value={values.type || "all"}
              onChange={(v) => patch({ type: v })}
              options={types}
              icon={Home}
            />
          )}
        </div>

        {(showStanding || showStarRating) && (
          <div
            className={cn(
              "grid gap-3 sm:gap-4",
              showStanding && showStarRating
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1"
            )}
          >
            {showStanding && (
              <FilterSelect
                label="Standing"
                value={values.standing || "all"}
                onChange={(v) => patch({ standing: v })}
                options={standings}
                icon={BadgeCheck}
              />
            )}
            {showStarRating && (
              <FilterSelect
                label="Étoiles"
                value={values.starRating || "all"}
                onChange={(v) => patch({ starRating: v })}
                options={STAR_OPTIONS}
                icon={Star}
              />
            )}
          </div>
        )}

        {(showStructureType || showConstructionType) && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {showStructureType && (
              <FilterSelect
                label="Structure"
                value={values.structureType || "all"}
                onChange={(v) => patch({ structureType: v })}
                options={STRUCTURE_OPTIONS}
                icon={Building2}
              />
            )}
            {showConstructionType && (
              <FilterSelect
                label="Construction"
                value={values.constructionType || "all"}
                onChange={(v) => patch({ constructionType: v })}
                options={CONSTRUCTION_OPTIONS}
                icon={Hammer}
              />
            )}
          </div>
        )}

        {showPriceRange && (
          <FilterSelect
            label="Budget"
            value={values.priceRange || "all"}
            onChange={(v) => patch({ priceRange: v })}
            options={priceRanges}
            icon={ArrowUpDown}
          />
        )}

        {(showGuests || showBedrooms || showRooms) && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {showGuests && (
              <FilterSelect
                label="Personnes"
                value={values.minGuests || "all"}
                onChange={(v) => patch({ minGuests: v })}
                options={GUEST_OPTIONS}
                icon={Users}
              />
            )}
            {showBedrooms && (
              <FilterSelect
                label="Chambres"
                value={values.minBedrooms || "all"}
                onChange={(v) => patch({ minBedrooms: v })}
                options={BEDROOM_OPTIONS}
                icon={BedDouble}
              />
            )}
            {showRooms && (
              <FilterSelect
                label="Pièces"
                value={values.minRooms || "all"}
                onChange={(v) => patch({ minRooms: v })}
                options={ROOM_OPTIONS}
                icon={BedDouble}
              />
            )}
          </div>
        )}

        {showPriceSort && (
          <FilterSelect
            label={priceSortLabel}
            value={values.orderPrice || "none"}
            onChange={(v) =>
              patch({
                orderPrice: v === "none" ? "" : (v as "asc" | "desc"),
              })
            }
            options={[
              { value: "none", label: priceSortLabel },
              { value: "asc", label: "Prix croissant" },
              { value: "desc", label: "Prix décroissant" },
            ]}
            icon={ArrowUpDown}
          />
        )}

        {showAvailableOnly && (
          <label className="flex cursor-pointer items-center gap-3 border border-[#12100c]/08 bg-[#faf8f5] px-3 py-3 transition-colors hover:border-[#f08400]/35">
            <input
              type="checkbox"
              checked={values.availableOnly}
              onChange={(e) => patch({ availableOnly: e.target.checked })}
              className="h-4 w-4 accent-[#f08400]"
            />
            <span className="text-sm font-medium text-[#12100c]">
              Disponibles uniquement
            </span>
          </label>
        )}

        {hasActiveFilters && (
          <Button
            type="button"
            variant="outline"
            onClick={reset}
            className="h-11 w-full rounded-none border border-[#12100c]/15 text-sm font-semibold uppercase tracking-[0.12em] text-[#12100c] hover:border-[#f08400] hover:bg-[#fff4e8] hover:text-[#c96d00] sm:h-12"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Réinitialiser
          </Button>
        )}
      </div>

      <div className="h-0.5 bg-gradient-to-r from-[#f08400] to-[#ffb347]" />
    </aside>
  );
}

function parsePriceRange(range: string): { min?: string; max?: string } {
  if (!range || range === "all") return {};
  const [min, max] = range.split("-");
  return {
    min: min || undefined,
    max: max || undefined,
  };
}

export function buildListingApiFilters(values: ListingFilterValues): Record<
  string,
  string | boolean
> {
  const filters: Record<string, string | boolean> = {};
  const { min, max } = parsePriceRange(values.priceRange);

  if (values.search.trim()) filters.search = values.search.trim();
  if (values.city.trim()) filters.city = values.city.trim();
  if (values.type && values.type !== "all") filters.type = values.type;
  if (values.standing && values.standing !== "all")
    filters.standing = values.standing;
  if (values.starRating && values.starRating !== "all")
    filters.star_rating = values.starRating;
  if (values.structureType && values.structureType !== "all")
    filters.structure_type = values.structureType;
  if (values.constructionType && values.constructionType !== "all")
    filters.construction_type = values.constructionType;
  if (min) filters.min_price = min;
  if (max) filters.max_price = max;
  if (values.minGuests && values.minGuests !== "all")
    filters.min_guests = values.minGuests;
  if (values.minBedrooms && values.minBedrooms !== "all")
    filters.min_bedrooms = values.minBedrooms;
  if (values.minRooms && values.minRooms !== "all")
    filters.min_rooms = values.minRooms;
  if (values.availableOnly) filters.is_available = true;
  if (values.orderPrice) filters.order_price = values.orderPrice;

  return filters;
}

export function uniqueCitiesFrom<T extends { city?: string | null }>(
  items: T[] | undefined
): string[] {
  if (!items?.length) return [];
  return Array.from(
    new Set(items.map((item) => item.city).filter(Boolean) as string[])
  ).sort((a, b) => a.localeCompare(b, "fr"));
}

export const EMPTY_LISTING_FILTERS: ListingFilterValues = {
  search: "",
  city: "",
  type: "all",
  standing: "all",
  starRating: "all",
  structureType: "all",
  constructionType: "all",
  priceRange: "all",
  minGuests: "all",
  minBedrooms: "all",
  minRooms: "all",
  availableOnly: false,
  orderPrice: "",
};
