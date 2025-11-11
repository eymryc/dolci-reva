"use client";

import EmblaCarousel from '@/components/carousel/EmblaCarousel'
import { EmblaOptionsType } from 'embla-carousel'
import '@/components/carousel/css/embla.css'
import TrueFocus from '@/components/animations/textanimate/TextAnimations/TrueFocus/TrueFocus';
import SectionHeader from '@/components/ui/SectionHeader';
import AnimatedSection from '@/components/ui/AnimatedSection';
import AnimatedButton from '@/components/ui/AnimatedButton';
import ListingCard from '@/components/cards/ListingCard';
import HebergementListingCard from '@/components/cards/HebergementListingCard';
import React from 'react';
import { usePublicResidences } from '@/hooks/use-residences';
import { usePublicDwellings } from '@/hooks/use-dwellings';
import Link from 'next/link';
// import GenericCarousel from '@/components/carousel/GenericCarousel';


const OPTIONS: EmblaOptionsType = { axis: 'y' }
// Création d'un tableau d'images
const IMAGES = [
  { src: "/media/slide/slide3.jpg", alt: "Image 3" },
  { src: "/media/slide/slide5.jpg", alt: "Image 5" },
  { src: "/media/slide/slide4.jpg", alt: "Image 4" },
  { src: "/media/slide/slide1.jpg", alt: "Image 1" },
  { src: "/media/slide/slide2.jpg", alt: "Image 2" },
]

export default function Home() {
  const { data: residences, isLoading, error } = usePublicResidences();
  const { data: dwellings, isLoading: isLoadingDwellings, error: errorDwellings } = usePublicDwellings();

  // Format price with space separator
  const formatPrice = (price: string) => {
    return parseFloat(price).toLocaleString('fr-FR', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    });
  };
  return (
    <div>
      <section className="px-2 md:px-0">
        <div className="">
          <EmblaCarousel slides={IMAGES} options={OPTIONS} />
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-yellow-50">
        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-80 h-80 bg-theme-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
          <div className="absolute top-40 right-10 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-delayed"></div>
          <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float-slow"></div>
        </div>

        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            {/* Main Title */}
            <div className="mb-8 md:mb-10">
              <TrueFocus
                sentence="Dolci Rêva, Kiffer l'instant."
                manualMode={false}
                blurAmount={5}
                borderColor="#12100c"
                animationDuration={2}
                pauseBetweenAnimations={1}
              />
            </div>

            {/* Enhanced Subtitle */}
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-800 mb-8 md:mb-10 font-light leading-relaxed max-w-3xl mx-auto">
              Découvrez les trésors cachés de la{' '}
              <span className="font-semibold text-theme-primary">Côte d&apos;Ivoire</span>.
              <br className="hidden md:block" />
              <span className="text-gray-700">
                Des hôtels d&apos;exception, une gastronomie raffinée, des lieux magiques qui vous feront vivre des moments inoubliables.
              </span>
            </p>

            {/* Enhanced CTA Buttons */}
            <AnimatedSection delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center mb-12 md:mb-16">
                <Link href="/residences">
                  <AnimatedButton size="lg" variant="primary" className="w-full sm:w-auto min-w-[200px] shadow-xl hover:shadow-2xl">
                    <span className="flex items-center justify-center gap-2">
                      Explorer maintenant
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </AnimatedButton>
                </Link>
                <Link href="/residences">
                  <AnimatedButton size="lg" variant="outline" className="w-full sm:w-auto min-w-[200px] bg-white/90 backdrop-blur-sm border-2 hover:bg-white">
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Découvrir les lieux
                    </span>
                  </AnimatedButton>
                </Link>
              </div>
            </AnimatedSection>

            {/* Enhanced Stats with Glassmorphism */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
              <div className="group relative bg-white/70 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white/90">
                <div className="absolute inset-0 bg-gradient-to-br from-theme-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-theme-primary to-orange-500 bg-clip-text text-transparent mb-2">
                    500+
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium">Lieux découverts</div>
                </div>
              </div>
              <div className="group relative bg-white/70 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white/90">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-theme-primary to-orange-500 bg-clip-text text-transparent mb-2">
                    50+
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium">Villes couvertes</div>
                </div>
              </div>
              <div className="group relative bg-white/70 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white/90">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-300/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-theme-primary to-orange-500 bg-clip-text text-transparent mb-2">
                    10K+
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium">Visiteurs satisfaits</div>
                </div>
              </div>
              <div className="group relative bg-white/70 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white/90">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-theme-primary to-orange-500 bg-clip-text text-transparent mb-2">
                    4.9
                    <span className="text-lg md:text-xl text-gray-500">/5</span>
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium">Note moyenne</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex flex-col items-center gap-2 group cursor-pointer">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider group-hover:text-theme-primary transition-colors">
              Découvrir
            </span>
            <div className="w-6 h-10 border-2 border-theme-primary/60 rounded-full flex justify-center items-start pt-2 group-hover:border-theme-primary transition-colors animate-bounce">
              <div className="w-1.5 h-3 bg-theme-primary rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex-1">
                <SectionHeader
                  title="Sélections d'exception"
                  subtitle="Découvrez les établissements les plus prisés du moment"
                />
              </div>
              <Link
                href="/residences"
                className="group flex items-center gap-2 text-theme-primary font-semibold hover:text-orange-500 transition-colors duration-300 whitespace-nowrap"
              >
                <span>Voir plus de sélections</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-64 bg-gray-200"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Une erreur s&apos;est produite lors du chargement des résidences.</p>
            </div>
          ) : residences && residences.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {residences.slice(0, 4).map((residence) => {
                // Préparer les images
                const allImages = residence.all_images?.map((img) => img.url) || 
                                 (residence.main_image_url ? [residence.main_image_url] : []);
                const galleryImages = residence.gallery_images?.map((img) => img.url) || [];
                const images = [...allImages, ...galleryImages].filter(Boolean);

                return (
                  <ListingCard
                    key={residence.id}
                    id={residence.id}
                    image={residence.main_image_url || residence.main_image_thumb_url || "/media/hotels/hotel1.jpg"}
                    images={images}
                    name={residence.name}
                    city={`${residence.city}, ${residence.country}`}
                    description={residence.description || "Aucune description disponible."}
                    price={`${formatPrice(residence.price)} FCFA`}
                    type={residence.type}
                    standing={residence.standing}
                    amenities={residence.amenities}
                    availability_status={residence.availability_status}
                    isPopular={residence.has_ratings || residence.rating_count > 0}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Aucune résidence disponible pour le moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Section Hébergements */}
      <section className="py-20 bg-gradient-to-br from-orange-50 via-white to-yellow-50">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex-1">
                <SectionHeader
                  title="Hébergements disponibles"
                  subtitle="Trouvez le logement parfait pour votre séjour"
                />
              </div>
              <Link
                href="/se-loger"
                className="group flex items-center gap-2 text-theme-primary font-semibold hover:text-orange-500 transition-colors duration-300 whitespace-nowrap"
              >
                <span>Voir tous les hébergements</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
          {isLoadingDwellings ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-64 bg-gray-200"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : errorDwellings ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Une erreur s&apos;est produite lors du chargement des hébergements.</p>
            </div>
          ) : dwellings && dwellings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {dwellings.slice(0, 4).map((dwelling) => {
                // Préparer les images
                const allImages = dwelling.all_images?.map((img) => img.url) || 
                                 (dwelling.main_image_url ? [dwelling.main_image_url] : []);
                const galleryImages = dwelling.gallery_images?.map((img) => 
                  typeof img === 'string' ? img : img.url
                ) || [];
                const images = [...allImages, ...galleryImages].filter(Boolean);

                // Préparer les équipements (amenities) - les hébergements n'ont pas d'amenities dans le type
                const amenities: string[] = [];

                return (
                  <HebergementListingCard
                    key={dwelling.id}
                    id={dwelling.id}
                    image={dwelling.main_image_url || dwelling.main_image_thumb_url || "/media/hotels/hotel1.jpg"}
                    images={images}
                    name={`${dwelling.type || 'Hébergement'} à ${dwelling.city}`}
                    location={`${dwelling.city}, ${dwelling.country}`}
                    city={dwelling.city}
                    country={dwelling.country}
                    address={dwelling.address}
                    type={dwelling.type}
                    structureType={dwelling.structure_type}
                    structureTypeLabel={dwelling.structure_type_label}
                    constructionType={dwelling.construction_type}
                    constructionTypeLabel={dwelling.construction_type_label}
                    rooms={dwelling.rooms ?? undefined}
                    bedrooms={dwelling.rooms ?? undefined}
                    bathrooms={dwelling.bathrooms ?? undefined}
                    living_room={dwelling.living_room ?? undefined}
                    pieceNumber={dwelling.piece_number ?? undefined}
                    amenities={amenities}
                    price={dwelling.rent}
                    rentAdvanceAmountNumber={dwelling.rent_advance_amount_number}
                    securityDepositMonthNumber={dwelling.security_deposit_month_number}
                    agencyFeesMonthNumber={dwelling.agency_fees_month_number}
                    visitePrice={dwelling.visite_price}
                    isPopular={dwelling.is_available}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Aucun hébergement disponible pour le moment.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
