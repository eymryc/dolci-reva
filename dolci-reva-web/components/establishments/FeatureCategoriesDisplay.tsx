"use client";

import { Card } from "@/components/ui/card";
import { LucideIconByName } from "@/components/ui/LucideIconByName";
import type { FeatureCategory } from "@/types/common";

interface FeatureCategoriesDisplayProps {
  categories?: FeatureCategory[] | null;
  title?: string;
}

/**
 * Affichage public des commodités groupées par catégorie, avec icône lucide.
 */
export function FeatureCategoriesDisplay({
  categories,
  title = "Commodités",
}: FeatureCategoriesDisplayProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <Card className="rounded-none border border-[#12100c]/08 bg-white p-6 shadow-none">
      <h2 className="mb-5 text-xl font-bold text-[#12100c]">{title}</h2>
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category.id}>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#f08400]">
              <span className="flex h-7 w-7 items-center justify-center bg-[#f08400]/10">
                <LucideIconByName name={category.icon} className="h-3.5 w-3.5 text-[#f08400]" />
              </span>
              {category.name}
            </h3>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {category.options.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center gap-2.5 text-sm text-[#4a4136]"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f08400]/10">
                    <LucideIconByName
                      name={category.icon}
                      className="h-3 w-3 text-[#f08400]"
                    />
                  </span>
                  <span>{option.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
