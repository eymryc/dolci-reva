"use client"

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import HebergementCard from '@/components/cards/HebergementCard';
import HeroSection from '@/components/sections/HeroSection';
import ListingFilters, {
  EMPTY_LISTING_FILTERS,
  buildListingApiFilters,
  uniqueCitiesFrom,
  DWELLING_TYPES,
  DWELLING_PRICE_RANGES,
  type ListingFilterValues,
} from '@/components/filters/ListingFilters';
import { usePublicDwellings, type GalleryImage } from '@/hooks/use-dwellings';
import { Search } from "lucide-react";
import { ListingEmptyState, ListingErrorState } from '@/components/ui/ListingEmptyState';

export default function SeLogerPage() {
  const [filterValues, setFilterValues] = useState<ListingFilterValues>(EMPTY_LISTING_FILTERS);
  const filters = useMemo(() => buildListingApiFilters(filterValues), [filterValues]);
  const { data: allDwellings } = usePublicDwellings({});
  const { data: dwellingsData, isLoading, error } = usePublicDwellings(filters);
  const cities = useMemo(() => uniqueCitiesFrom(allDwellings), [allDwellings]);

  // Mapper les hébergements de l'API vers le format attendu par HebergementCard
   const dwellings = useMemo(() => {
      if (!dwellingsData) return [];

      return dwellingsData.map((dwelling) => {
         // Préparer les images pour le carousel - utiliser all_images qui contient toutes les images
         const images: string[] = [];
         if (dwelling.all_images && dwelling.all_images.length > 0) {
            dwelling.all_images.forEach((img: GalleryImage) => {
               if (img.url && !images.includes(img.url)) {
                  images.push(img.url);
               }
            });
         } else if (dwelling.main_image_url) {
            // Fallback sur main_image si all_images n'est pas disponible
            images.push(dwelling.main_image_url);
            if (dwelling.gallery_images && dwelling.gallery_images.length > 0) {
               dwelling.gallery_images.forEach((img: GalleryImage) => {
                  if (img.url && !images.includes(img.url)) {
                     images.push(img.url);
                  }
               });
            }
         }

         return {
            id: dwelling.id,
            name: dwelling.description || `Hébergement ${dwelling.id}`,
            location: `${dwelling.city}, ${dwelling.country}`,
            address: dwelling.address || undefined,
            area: undefined, // Pas dans l'API
            guests: undefined, // Pas dans l'API
            bedrooms: dwelling.rooms || undefined, // Utiliser rooms de l'API (compatibilité)
            rooms: dwelling.rooms || undefined,
            bathrooms: dwelling.bathrooms || undefined,
            living_room: dwelling.living_room || undefined,
            amenities: [], // Pas dans l'API
            rating: undefined, // Pas dans l'API
            reviews: 0, // Pas dans l'API
            price: dwelling.rent,
            image: dwelling.main_image_url || dwelling.main_image_thumb_url || "/media/hotels/hotel1.jpg",
            images: images.length > 0 ? images : undefined,
            type: dwelling.type || undefined,
            structureType: dwelling.structure_type || undefined,
            structureTypeLabel: dwelling.structure_type_label || undefined,
            constructionType: dwelling.construction_type || undefined,
            constructionTypeLabel: dwelling.construction_type_label || undefined,
            pieceNumber: dwelling.piece_number || undefined,
              rentAdvanceAmountNumber: dwelling.rent_advance_amount_number || undefined,
              securityDepositMonthNumber: dwelling.security_deposit_month_number || undefined,
              agencyFeesMonthNumber: dwelling.agency_fees_month_number || undefined,
              visitePrice: dwelling.visite_price || undefined,
            };
      });
   }, [dwellingsData]);

   return (
      <div className="min-h-screen bg-[#faf8f5]">
         {/* Hero Section */}
         <HeroSection
           title={
             <>
               Trouvez votre <span className="text-white/90">logement idéal</span>
             </>
           }
           subtitle="Découvrez une large sélection d'hébergements pour votre séjour. Du studio moderne à la villa spacieuse, trouvez le logement qui vous correspond."
           backgroundImage="/media/slide/slide3.jpg"
         />

      {/* Main Content with Filters and Cards */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(300px,400px)_1fr] gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar Filtres - Left */}
          <div>
            <ListingFilters
              values={filterValues}
              onChange={setFilterValues}
              cities={cities}
              types={DWELLING_TYPES}
              priceRanges={DWELLING_PRICE_RANGES}
              showType
              showStructureType
              showConstructionType
              showPriceRange
              showRooms
              showAvailableOnly
              showPriceSort
              priceSortLabel="Trier par loyer"
              resultCount={dwellingsData?.length ?? 0}
            />
          </div>

          {/* Cards Section - Right */}
          <div>
            {/* Liste des hébergements */}
            {isLoading ? (
              <div className="space-y-4 sm:space-y-6 animate-fade-in">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <Card key={idx} className="overflow-hidden animate-pulse h-48 sm:h-56 md:h-64 border border-gray-100">
                    <div className="flex flex-col sm:flex-row h-full">
                      <div className="w-full sm:w-2/5 h-32 sm:h-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
                      <div className="flex-1 p-4 sm:p-6 space-y-3 sm:space-y-4">
                        <div className="h-3 sm:h-4 bg-gray-200 rounded-none w-3/4"></div>
                        <div className="h-3 sm:h-4 bg-gray-200 rounded-none w-1/2"></div>
                        <div className="h-3 sm:h-4 bg-gray-200 rounded-none w-full"></div>
                        <div className="flex gap-2 mt-3 sm:mt-4">
                          <div className="h-5 w-5 sm:h-6 sm:w-6 bg-gray-200 rounded"></div>
                          <div className="h-5 w-5 sm:h-6 sm:w-6 bg-gray-200 rounded"></div>
                          <div className="h-5 w-5 sm:h-6 sm:w-6 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <ListingErrorState
                description="Une erreur s'est produite lors du chargement des hébergements. Veuillez réessayer."
                onRetry={() => window.location.reload()}
              />
            ) : dwellings.length === 0 ? (
              <ListingEmptyState
                title="Aucun résultat trouvé"
                description="Aucun hébergement ne correspond à vos critères. Essayez d'élargir la recherche ou de réinitialiser les filtres."
                onReset={() => setFilterValues(EMPTY_LISTING_FILTERS)}
                icon={Search}
              />
            ) : (
              <div className="space-y-4 sm:space-y-6 animate-fade-in">
                {dwellings.map((dwelling, index) => (
                  <div
                    key={dwelling.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <HebergementCard
                      id={dwelling.id}
                      image={dwelling.image}
                      name={dwelling.name}
                      location={dwelling.location}
                      address={dwelling.address}
                      bedrooms={dwelling.bedrooms}
                      rooms={dwelling.rooms}
                      bathrooms={dwelling.bathrooms}
                      living_room={dwelling.living_room}
                      amenities={dwelling.amenities}
                      rating={dwelling.rating}
                      reviews={dwelling.reviews}
                      price={dwelling.price}
                      images={dwelling.images}
                      type={dwelling.type}
                      structureType={dwelling.structureType}
                      structureTypeLabel={dwelling.structureTypeLabel}
                      constructionType={dwelling.constructionType}
                      constructionTypeLabel={dwelling.constructionTypeLabel}
                      pieceNumber={dwelling.pieceNumber}
                      rentAdvanceAmountNumber={dwelling.rentAdvanceAmountNumber}
                      securityDepositMonthNumber={dwelling.securityDepositMonthNumber}
                      agencyFeesMonthNumber={dwelling.agencyFeesMonthNumber}
                      visitePrice={dwelling.visitePrice}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

