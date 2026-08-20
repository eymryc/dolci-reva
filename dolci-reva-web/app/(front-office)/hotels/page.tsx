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
import { usePublicHotels } from "@/hooks/use-hotels";
import { Building2 } from "lucide-react";
import { ListingEmptyState, ListingErrorState } from "@/components/ui/ListingEmptyState";
import { flattenFeatureOptions } from "@/lib/features";

export default function HotelsPage() {
  const [filterValues, setFilterValues] = useState<ListingFilterValues>(EMPTY_LISTING_FILTERS);
  const filters = useMemo(() => buildListingApiFilters(filterValues), [filterValues]);
  const { data: allItems } = usePublicHotels({});
  const { data: hotels = [], isLoading, error } = usePublicHotels(filters);
  const cities = useMemo(() => uniqueCitiesFrom(allItems), [allItems]);

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <HeroSection
        title={
          <>
            Nos <span className="text-white/90">Hôtels</span>
          </>
        }
        subtitle="Découvrez une sélection d'hôtels de qualité en Côte d'Ivoire. Réservez la chambre idéale pour votre séjour."
        backgroundImage="/media/slide/slide1.jpg"
      />

      <div className="container mx-auto px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(280px,360px)_1fr] lg:gap-8">
          
          <div>
            <ListingFilters
              values={filterValues}
              onChange={setFilterValues}
              cities={cities}
              showStarRating
              resultCount={hotels.length}
            />
          </div>


          <div>
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card
                    key={i}
                    className="h-56 overflow-hidden border border-gray-100"
                  >
                    <div className="flex h-full">
                      <div className="w-2/5 bg-gradient-to-br from-gray-200 to-gray-300" />
                      <div className="flex-1 space-y-4 p-6">
                        <div className="h-4 w-3/4 rounded bg-gray-200" />
                        <div className="h-4 w-1/2 rounded bg-gray-200" />
                        <div className="h-4 w-full rounded bg-gray-200" />
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
            ) : hotels.length === 0 ? (
              <ListingEmptyState
                title="Aucun hôtel trouvé"
                description="Aucun hôtel ne correspond à vos critères. Essayez d'élargir la recherche ou de réinitialiser les filtres."
                onReset={() => setFilterValues(EMPTY_LISTING_FILTERS)}
                icon={Building2}
              />
            ) : (
              <div className="space-y-4">
                {hotels.map((hotel) => {
                  const images = [
                    ...(hotel.all_images?.map((img) => img.url) || []),
                    ...(hotel.gallery_images?.map((img) =>
                      typeof img === "string" ? img : img.url
                    ) || []),
                  ].filter(Boolean) as string[];

                  return (
                    <EstablishmentListCard
                      key={hotel.id}
                      id={hotel.id}
                      href={`/hotels/${hotel.id}`}
                      image={
                        hotel.main_image_url ||
                        hotel.main_image_thumb_url ||
                        "/media/hotels/hotel1.jpg"
                      }
                      images={images}
                      name={hotel.name}
                      title={hotel.name}
                      location={`${hotel.city}, ${hotel.country}`}
                      city={hotel.city}
                      country={hotel.country}
                      address={hotel.address}
                      description={hotel.description || undefined}
                      badges={[
                        ...(hotel.star_rating
                          ? [`${hotel.star_rating} étoiles`]
                          : []),
                        ...flattenFeatureOptions(hotel.feature_categories)
                          .slice(0, 3)
                          .map((o) => o.name),
                      ]}
                      footerMeta={
                        hotel.rooms_count != null
                          ? `${hotel.rooms_count} chambre${
                              hotel.rooms_count > 1 ? "s" : ""
                            }`
                          : undefined
                      }
                      ctaLabel="Voir les chambres →"
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
