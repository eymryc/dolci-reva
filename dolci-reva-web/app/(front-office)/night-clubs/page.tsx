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
import { usePublicNightClubs } from "@/hooks/use-nightlife-venues";
import { Music2 } from "lucide-react";
import { ListingEmptyState, ListingErrorState } from "@/components/ui/ListingEmptyState";
import { flattenFeatureOptions } from "@/lib/features";

export default function NightClubsPage() {
  const [filterValues, setFilterValues] = useState<ListingFilterValues>(EMPTY_LISTING_FILTERS);
  const filters = useMemo(() => buildListingApiFilters(filterValues), [filterValues]);
  const { data: allItems } = usePublicNightClubs({});
  const { data: nightClubs = [], isLoading, error } = usePublicNightClubs(filters);
  const cities = useMemo(() => uniqueCitiesFrom(allItems), [allItems]);

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <HeroSection
        title={<>Nos <span className="text-white/90">Night-Clubs</span></>}
        subtitle="Plongez dans les meilleures soirées de Côte d'Ivoire. Réservez votre espace VIP dès maintenant."
        backgroundImage="/media/slide/slide1.jpg"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,360px)_1fr] gap-6 lg:gap-8">
          
          <div>
            <ListingFilters
              values={filterValues}
              onChange={setFilterValues}
              cities={cities}
              resultCount={nightClubs.length}
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
            ) : nightClubs.length === 0 ? (
              <ListingEmptyState
                title="Aucun night-club trouvé"
                description="Aucun night-club ne correspond à vos critères. Essayez d'élargir la recherche ou de réinitialiser les filtres."
                onReset={() => setFilterValues(EMPTY_LISTING_FILTERS)}
                icon={Music2}
              />
            ) : (
              <div className="space-y-4">
                {nightClubs.map((club) => {
                  const badges = [
                    ...(club.age_restriction
                      ? [`${club.age_restriction}+ ans`]
                      : []),
                    ...(club.outdoor_seating ? ["Terrasse"] : []),
                    ...(club.parking ? ["Parking"] : []),
                    ...flattenFeatureOptions(club.feature_categories)
                      .slice(0, 2)
                      .map((a) => a.name),
                  ];
                  return (
                    <EstablishmentListCard
                      key={club.id}
                      id={club.id}
                      href={`/night-clubs/${club.id}`}
                      image={
                        club.main_image_url ||
                        club.main_image_thumb_url ||
                        "/media/hotels/hotel1.jpg"
                      }
                      name={club.name}
                      title={club.name}
                      location={`${club.city}, ${club.country}`}
                      city={club.city}
                      country={club.country}
                      address={club.address}
                      description={club.description || undefined}
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
