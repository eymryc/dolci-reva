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
import { usePublicRestaurants } from "@/hooks/use-restaurants";
import { UtensilsCrossed } from "lucide-react";
import { ListingEmptyState, ListingErrorState } from "@/components/ui/ListingEmptyState";
import { flattenFeatureOptions } from "@/lib/features";

export default function RestaurantsPage() {
  const [filterValues, setFilterValues] = useState<ListingFilterValues>(EMPTY_LISTING_FILTERS);
  const filters = useMemo(() => buildListingApiFilters(filterValues), [filterValues]);
  const { data: allItems } = usePublicRestaurants({});
  const { data: restaurants = [], isLoading, error } = usePublicRestaurants(filters);
  const cities = useMemo(() => uniqueCitiesFrom(allItems), [allItems]);

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <HeroSection
        title={<>Nos <span className="text-white/90">Restaurants</span></>}
        subtitle="Savourez des expériences culinaires uniques dans les meilleurs restaurants de Côte d'Ivoire."
        backgroundImage="/media/slide/slide2.jpg"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,360px)_1fr] gap-6 lg:gap-8">
          {/* Sidebar Filtres */}
          
          <div>
            <ListingFilters
              values={filterValues}
              onChange={setFilterValues}
              cities={cities}
              resultCount={restaurants.length}
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
                        <div className="h-4 bg-gray-200 rounded w-full" />
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
            ) : restaurants.length === 0 ? (
              <ListingEmptyState
                title="Aucun restaurant trouvé"
                description="Aucun restaurant ne correspond à vos critères. Essayez d'élargir la recherche ou de réinitialiser les filtres."
                onReset={() => setFilterValues(EMPTY_LISTING_FILTERS)}
                icon={UtensilsCrossed}
              />
            ) : (
              <div className="space-y-4">
                {restaurants.map((restaurant) => (
                  <EstablishmentListCard
                    key={restaurant.id}
                    id={restaurant.id}
                    href={`/restaurants/${restaurant.id}`}
                    image={
                      restaurant.main_image_url ||
                      restaurant.main_image_thumb_url ||
                      "/media/hotels/hotel1.jpg"
                    }
                    name={restaurant.name}
                    title={restaurant.name}
                    location={`${restaurant.city}, ${restaurant.country}`}
                    city={restaurant.city}
                    country={restaurant.country}
                    address={restaurant.address}
                    description={restaurant.description || undefined}
                    badges={flattenFeatureOptions(restaurant.feature_categories)
                      .slice(0, 4)
                      .map((o) => o.name)}
                    ctaLabel="Réserver une table →"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
