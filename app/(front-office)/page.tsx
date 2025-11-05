"use client";

import EmblaCarousel from '@/components/carousel/EmblaCarousel'
import { EmblaOptionsType } from 'embla-carousel'
import '@/components/carousel/css/embla.css'
import TrueFocus from '@/components/animations/textanimate/TextAnimations/TrueFocus/TrueFocus';
import SectionHeader from '@/components/ui/SectionHeader';
import AnimatedSection from '@/components/ui/AnimatedSection';
import AnimatedButton from '@/components/ui/AnimatedButton';
import ListingCard from '@/components/cards/ListingCard';
import React from 'react';
import { usePublicResidences } from '@/hooks/use-residences';
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

  // Format price with space separator
  const formatPrice = (price: string) => {
    return parseFloat(price).toLocaleString('fr-FR', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    });
  };
  return (
    <div>
      <section className="mb-5 px-2 md:px-0">
        <div className="">
          <EmblaCarousel slides={IMAGES} options={OPTIONS} />
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-yellow-100">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-theme-primary rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Main Title */}
            <div className="mb-8">
              <TrueFocus
                sentence="Dolci Rêva, Kiffer l'instant."
                manualMode={false}
                blurAmount={5}
                borderColor="#12100c"
                animationDuration={2}
                pauseBetweenAnimations={1}
              />
            </div>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-700 mb-8 font-light leading-relaxed">
              Découvrez les trésors cachés de la Côte d&apos;Ivoire.
              <br className="hidden md:block" />
              Des hôtels d&apos;exception, une gastronomie raffinée, des lieux magiques qui vous feront vivre des moments inoubliables.
            </p>

            {/* CTA Buttons */}
            <AnimatedSection delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <AnimatedButton size="lg" variant="primary">
                  <span className="flex items-center gap-2">
                    Explorer maintenant
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </AnimatedButton>
                <AnimatedButton size="lg" variant="outline">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Découvrir les lieux
                  </span>
                </AnimatedButton>
              </div>
            </AnimatedSection>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-theme-primary mb-1">500+</div>
                <div className="text-sm text-gray-600">Lieux découverts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-theme-primary mb-1">50+</div>
                <div className="text-sm text-gray-600">Villes couvertes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-theme-primary mb-1">10K+</div>
                <div className="text-sm text-gray-600">Visiteurs satisfaits</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-theme-primary mb-1">4.9</div>
                <div className="text-sm text-gray-600">Note moyenne</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-theme-primary rounded-full flex justify-center">
            <div className="w-1 h-3 bg-theme-primary rounded-full mt-2 animate-pulse"></div>
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
                className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-theme-primary to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:from-orange-500 hover:to-theme-primary whitespace-nowrap"
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
              {residences.slice(0, 4).map((residence) => (
                <ListingCard
                  key={residence.id}
                  id={residence.id}
                  image={residence.main_image_url || residence.main_image_thumb_url || "/media/hotels/hotel1.jpg"}
                  name={residence.name}
                  city={`${residence.city}, ${residence.country}`}
                  description={residence.description || "Aucune description disponible."}
                  price={`${formatPrice(residence.price)} FCFA`}
                  type={residence.type}
                  standing={residence.standing}
                  amenities={residence.amenities}
                  isPopular={residence.has_ratings || residence.rating_count > 0}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Aucune résidence disponible pour le moment.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
