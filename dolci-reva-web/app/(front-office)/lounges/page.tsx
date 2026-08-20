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
import { usePublicLounges } from "@/hooks/use-lounges";
import { Sofa } from "lucide-react";
import { ListingEmptyState, ListingErrorState } from "@/components/ui/ListingEmptyState";
import { flattenFeatureOptions } from "@/lib/features";

export default function LoungesPage() {
  const [filterValues, setFilterValues] = useState<ListingFilterValues>(EMPTY_LISTING_FILTERS);
  const filters = useMemo(() => buildListingApiFilters(filterValues), [filterValues]);
  const { data: allItems } = usePublicLounges({});
  const { data: lounges = [], isLoading, error } = usePublicLounges(filters);
  const cities = useMemo(() => uniqueCitiesFrom(allItems), [allItems]);

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <HeroSection
        title={<>Nos <span className="text-white/90">Lounges</span></>}
        subtitle="Vivez des moments de détente et de convivialité dans les lounges les plus exclusifs de Côte d'Ivoire."
        backgroundImage="/media/slide/slide3.jpg"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,360px)_1fr] gap-6 lg:gap-8">
          
          <div>
            <ListingFilters
              values={filterValues}
              onChange={setFilterValues}
              cities={cities}
              resultCount={lounges.length}
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
            ) : lounges.length === 0 ? (
              <ListingEmptyState
                title="Aucun lounge trouvé"
                description="Aucun lounge ne correspond à vos critères. Essayez d'élargir la recherche ou de réinitialiser les filtres."
                onReset={() => setFilterValues(EMPTY_LISTING_FILTERS)}
                icon={Sofa}
              />
            ) : (
              <div className="space-y-4">
                {lounges.map((lounge) => {
                  const badges = [
                    ...(lounge.outdoor_seating ? ["Terrasse"] : []),
                    ...(lounge.smoking_area ? ["Espace fumeurs"] : []),
                    ...(lounge.parking ? ["Parking"] : []),
                    ...flattenFeatureOptions(lounge.feature_categories)
                      .slice(0, 2)
                      .map((o) => o.name),
                  ];
                  return (
                    <EstablishmentListCard
                      key={lounge.id}
                      id={lounge.id}
                      href={`/lounges/${lounge.id}`}
                      image={
                        lounge.main_image_url ||
                        lounge.main_image_thumb_url ||
                        "/media/hotels/hotel1.jpg"
                      }
                      name={lounge.name}
                      title={lounge.name}
                      location={`${lounge.city}, ${lounge.country}`}
                      city={lounge.city}
                      country={lounge.country}
                      address={lounge.address}
                      description={lounge.description || undefined}
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
