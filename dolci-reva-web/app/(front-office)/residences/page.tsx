"use client"

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import ResidenceCard from '@/components/cards/ResidenceCard';
import HeroSection from '@/components/sections/HeroSection';
import ListingFilters, {
  EMPTY_LISTING_FILTERS,
  buildListingApiFilters,
  uniqueCitiesFrom,
  RESIDENCE_TYPES,
  RESIDENCE_PRICE_RANGES,
  type ListingFilterValues,
} from '@/components/filters/ListingFilters';
import { usePublicResidences, type GalleryImage } from '@/hooks/use-residences';
import { Search } from "lucide-react";
import { ListingEmptyState, ListingErrorState } from '@/components/ui/ListingEmptyState';
import { flattenFeatureOptions } from '@/lib/features';

export default function ResidencesPage() {
  const [filterValues, setFilterValues] = useState<ListingFilterValues>(EMPTY_LISTING_FILTERS);

  const filters = useMemo(() => buildListingApiFilters(filterValues), [filterValues]);

  const { data: allResidences } = usePublicResidences({});
  const { data: residencesData, isLoading, error } = usePublicResidences(filters);

  const cities = useMemo(() => uniqueCitiesFrom(allResidences), [allResidences]);

  // Mapper les résidences de l'API vers le format attendu par ResidenceCard
  const residences = useMemo(() => {
    if (!residencesData) return [];

    return residencesData.map((residence) => {
      // Préparer les images pour le carousel - utiliser all_images qui contient toutes les images
      const images: string[] = [];
      if (residence.all_images && residence.all_images.length > 0) {
        residence.all_images.forEach((img: GalleryImage) => {
          if (img.url && !images.includes(img.url)) {
            images.push(img.url);
          }
        });
      } else if (residence.main_image_url) {
        // Fallback sur main_image si all_images n'est pas disponible
        images.push(residence.main_image_url);
        if (residence.gallery_images && residence.gallery_images.length > 0) {
          residence.gallery_images.forEach((img: GalleryImage) => {
            if (img.url && !images.includes(img.url)) {
              images.push(img.url);
            }
          });
        }
      }

      return {
        id: residence.id,
        name: residence.name,
        location: `${residence.city}, ${residence.country}`,
        address: residence.address || undefined,
        city: residence.city,
        country: residence.country,
        type: residence.type,
        standing: residence.standing,
        max_guests: residence.max_guests,
        bedrooms: residence.bedrooms || undefined,
        bathrooms: residence.bathrooms || undefined,
        piece_number: residence.piece_number || undefined,
        amenities: flattenFeatureOptions(residence.feature_categories),
        rating: parseFloat(residence.average_rating) || undefined,
        reviews: residence.rating_count || 0,
        price: parseFloat(residence.price),
        image: residence.main_image_url || residence.main_image_thumb_url || "/media/hotels/hotel1.jpg",
        images: images.length > 0 ? images : undefined,
        description: residence.description || undefined,
        availability_status: residence.availability_status,
        isPopular: residence.has_ratings || residence.rating_count > 0,
      };
    });
  }, [residencesData]);

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Hero Section */}
      <HeroSection
        title={
          <>
            Découvrez nos <span className="text-white/90">Résidences</span>
          </>
        }
        subtitle="Explorez une sélection exclusive de résidences de luxe pour votre séjour en Côte d'Ivoire. Du studio moderne à la villa spacieuse, trouvez la résidence qui vous correspond."
        backgroundImage="/media/slide/slide3.jpg"
      />

      {/* Main Content with Filters and Cards */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(300px,400px)_1fr] gap-4 sm:gap-6 lg:gap-8">
          <div>
            <ListingFilters
              values={filterValues}
              onChange={setFilterValues}
              cities={cities}
              types={RESIDENCE_TYPES}
              priceRanges={RESIDENCE_PRICE_RANGES}
              showType
              showStanding
              showPriceRange
              showGuests
              showBedrooms
              showAvailableOnly
              showPriceSort
              resultCount={residencesData?.length ?? 0}
            />
          </div>

          {/* Cards Section - Right */}
          <div>
            {/* Liste des résidences */}
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
                description="Une erreur s'est produite lors du chargement des résidences. Veuillez réessayer."
                onRetry={() => window.location.reload()}
              />
            ) : residences.length === 0 ? (
              <ListingEmptyState
                title="Aucun résultat trouvé"
                description="Aucune résidence ne correspond à vos critères. Essayez d'élargir la recherche ou de réinitialiser les filtres."
                onReset={() => setFilterValues(EMPTY_LISTING_FILTERS)}
                icon={Search}
              />
            ) : (
              <div className="space-y-4 sm:space-y-6 animate-fade-in">
                {residences.map((residence, index) => (
                  <div
                    key={residence.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ResidenceCard
                      id={residence.id}
                      image={residence.image}
                      name={residence.name}
                      location={residence.location}
                      address={residence.address}
                      city={residence.city}
                      country={residence.country}
                      type={residence.type}
                      standing={residence.standing}
                      max_guests={residence.max_guests}
                      bedrooms={residence.bedrooms}
                      bathrooms={residence.bathrooms}
                      piece_number={residence.piece_number}
                      amenities={residence.amenities}
                      rating={residence.rating}
                      reviews={residence.reviews}
                      price={residence.price}
                      images={residence.images}
                      description={residence.description}
                      availability_status={residence.availability_status}
                      isPopular={residence.isPopular}
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