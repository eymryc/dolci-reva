"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import HeroSection from "@/components/sections/HeroSection";
import EstablishmentListCard from "@/components/cards/EstablishmentListCard";
import ListingFilters, {
  EMPTY_LISTING_FILTERS,
  buildListingApiFilters,
  uniqueCitiesFrom,
  type ListingFilterValues,
} from "@/components/filters/ListingFilters";
import { usePublicBars } from "@/hooks/use-bars";
import { Wine } from "lucide-react";
import { ListingEmptyState, ListingErrorState } from "@/components/ui/ListingEmptyState";
import { flattenFeatureOptions } from "@/lib/features";

export default function BarsPage() {
  const [filterValues, setFilterValues] = useState<ListingFilterValues>(EMPTY_LISTING_FILTERS);
  const filters = useMemo(() => buildListingApiFilters(filterValues), [filterValues]);
  const { data: allItems } = usePublicBars({});
  const { data: bars = [], isLoading, error } = usePublicBars(filters);
  const cities = useMemo(() => uniqueCitiesFrom(allItems), [allItems]);

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <HeroSection
        title={<>Nos <span className="text-white/90">Bars</span></>}
        subtitle="Découvrez les meilleurs bars de Côte d'Ivoire pour des moments conviviaux et festifs."
        backgroundImage="/media/slide/slide2.jpg"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,360px)_1fr] gap-6 lg:gap-8">
          
          <div>
            <ListingFilters
              values={filterValues}
              onChange={setFilterValues}
              cities={cities}
              resultCount={bars.length}
            />
          </div>


          <div>
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden h-56 border border-gray-100">
                    <div className="flex h-full">
                      <div className="w-2/5 bg-gradient-to-br from-gray-200 to-gray-300" />
                      <div className="flex-1 p-6 space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <ListingErrorState
                description="Une erreur s'est produite lors du chargement. Veuillez réessayer."
                onRetry={() => window.location.reload()}
              />
            ) : bars.length === 0 ? (
              <ListingEmptyState
                title="Aucun bar trouvé"
                description="Aucun bar ne correspond à vos critères. Essayez d'élargir la recherche ou de réinitialiser les filtres."
                onReset={() => setFilterValues(EMPTY_LISTING_FILTERS)}
                icon={Wine}
              />
            ) : (
              <div className="space-y-4">
                {bars.map((bar) => {
                  const badges = [
                    ...(bar.outdoor_seating ? ["Terrasse"] : []),
                    ...(bar.parking ? ["Parking"] : []),
                    ...flattenFeatureOptions(bar.feature_categories)
                      .slice(0, 2)
                      .map((o) => o.name),
                  ];
                  return (
                    <EstablishmentListCard
                      key={bar.id}
                      id={bar.id}
                      href={`/bars/${bar.id}`}
                      image={
                        bar.main_image_url ||
                        bar.main_image_thumb_url ||
                        "/media/hotels/hotel1.jpg"
                      }
                      name={bar.name}
                      title={bar.name}
                      location={`${bar.city}, ${bar.country}`}
                      city={bar.city}
                      country={bar.country}
                      address={bar.address}
                      description={bar.description || undefined}
                      badges={badges}
                      ctaLabel="Réserver →"
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
