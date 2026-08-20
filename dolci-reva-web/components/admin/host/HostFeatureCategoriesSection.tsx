"use client";

import { Check } from "lucide-react";
import { LucideIconByName } from "@/components/ui/LucideIconByName";

export type HostFeatureCategory = {
  id: number | string;
  name: string;
  icon?: string | null;
  options?: Array<{ id: number | string; name: string }>;
};

interface HostFeatureCategoriesSectionProps {
  categories: HostFeatureCategory[];
}

/** Présentation dossier propriétaire : grille de catégories + options en pastilles. */
export function HostFeatureCategoriesSection({
  categories,
}: HostFeatureCategoriesSectionProps) {
  const totalOptions = categories.reduce(
    (sum, cat) => sum + (cat.options?.length ?? 0),
    0
  );

  if (categories.length === 0) return null;

  return (
    <section className="overflow-hidden border border-[#f08400]/18 bg-white">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#f08400]/12 bg-gradient-to-r from-[#fff7ef] via-[#fffaf5] to-white px-5 py-4 sm:px-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f08400]">
            Équipements
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Ce que les voyageurs verront sur la fiche publique
          </p>
        </div>
        <p className="text-[12px] font-medium text-slate-400">
          <span className="font-semibold text-[#c96d00]">{totalOptions}</span>
          {" · "}
          {categories.length} catégorie{categories.length > 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-px bg-[#f08400]/10 sm:grid-cols-2">
        {categories.map((cat) => {
          const options = cat.options || [];
          return (
            <article
              key={cat.id}
              className="flex flex-col bg-white p-5 transition-colors hover:bg-[#fffaf5]/80 sm:p-6"
            >
              <header className="mb-4 flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#f08400]/20 bg-gradient-to-br from-[#fff4e8] to-white text-[#f08400]">
                  <LucideIconByName name={cat.icon} className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <h3 className="truncate text-[15px] font-semibold tracking-tight text-[#12100c]">
                    {cat.name}
                  </h3>
                  <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
                    {options.length} option{options.length > 1 ? "s" : ""}
                  </p>
                </div>
              </header>

              <ul className="flex flex-wrap gap-x-4 gap-y-2">
                {options.map((opt) => (
                  <li
                    key={opt.id}
                    className="inline-flex max-w-full items-center gap-1.5 text-[13px] leading-snug text-[#3d352c]"
                  >
                    <Check
                      className="h-3.5 w-3.5 shrink-0 text-[#f08400]"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                    <span className="truncate">{opt.name}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
        {/* Case vide (nombre impair) : fond blanc pour éviter le halo orange */}
        {categories.length % 2 === 1 ? (
          <div className="hidden bg-white sm:block" aria-hidden />
        ) : null}
      </div>
    </section>
  );
}
