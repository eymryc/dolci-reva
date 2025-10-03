"use client";

import EmblaCarousel from '@/components/carousel/EmblaCarousel'
import { EmblaOptionsType } from 'embla-carousel'
import '@/components/carousel/css/embla.css'
import TrueFocus from '@/textanimate/TextAnimations/TrueFocus/TrueFocus';
import SectionHeader from '@/components/ui/SectionHeader';
import AnimatedSection from '@/components/ui/AnimatedSection';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { FiMail, FiSend } from "react-icons/fi";
import ListingCard from '@/components/HotelCard';
import React from 'react';
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

// Tableau d'hôtels pour la section "Hôtels en vogue"
const hotels = [
  {
    image: "/media/hotels/hotel1.jpg",
    name: "Hôtel du Soleil",
    city: "Paris, France",
    rating: 4.5,
    description: "Un havre de paix au cœur de la ville, avec piscine et spa.",
    price: "Dès 78 000 FCFA/nuit",
    isPopular: true,
    freeCancel: true,
  },
  {
    image: "/media/hotels/hotel2.jpg",
    name: "Hôtel du Soleil",
    city: "Paris, France",
    rating: 4.5,
    description: "Un havre de paix au cœur de la ville, avec piscine et spa.",
    price: "Dès 78 000 FCFA/nuit",
    isPopular: true,
    freeCancel: true,
  },
  {
    image: "/media/hotels/hotel3.jpg",
    name: "Hôtel du Soleil",
    city: "Paris, France",
    rating: 4.5,
    description: "Un havre de paix au cœur de la ville, avec piscine et spa.",
    price: "Dès 78 000 FCFA/nuit",
    isPopular: true,
    freeCancel: true,
  },
  {
    image: "/media/hotels/hotel1.jpg",
    name: "Hôtel du Soleil",
    city: "Paris, France",
    rating: 4.5,
    description: "Un havre de paix au cœur de la ville, avec piscine et spa.",
    price: "Dès 78 000 FCFA/nuit",
    isPopular: true,
    freeCancel: true,
  },
  {
    image: "/media/hotels/hotel2.jpg",
    name: "Hôtel du Soleil",
    city: "Paris, France",
    rating: 4.5,
    description: "Un havre de paix au cœur de la ville, avec piscine et spa.",
    price: "Dès 78 000 FCFA/nuit",
    isPopular: true,
    freeCancel: true,
  },
  {
    image: "/media/hotels/hotel3.jpg",
    name: "Hôtel du Soleil",
    city: "Paris, France",
    rating: 4.5,
    description: "Un havre de paix au cœur de la ville, avec piscine et spa.",
    price: "Dès 78 000 FCFA/nuit",
    isPopular: true,
    freeCancel: true,
  },
];

// Tableau de restaurants pour la section "la hâute gastronomie"
const restaurants = [
  {
    image: "/media/hotels/hotel1.jpg",
    name: "Le Gourmet Parisien",
    city: "Paris, France",
    rating: 4.8,
    description: "Cuisine raffinée et ambiance élégante au cœur de Paris.",
    price: "Menu dès 45 000 FCFA",
    isPopular: true,
    freeCancel: false,
  },
  {
    image: "/media/hotels/hotel2.jpg",
    name: "Saveurs du Monde",
    city: "Lyon, France",
    rating: 4.7,
    description: "Voyage culinaire à travers les saveurs du monde.",
    price: "Menu dès 38 000 FCFA",
    isPopular: false,
    freeCancel: true,
  },
  {
    image: "/media/hotels/hotel3.jpg",
    name: "Bistro Chic",
    city: "Marseille, France",
    rating: 4.6,
    description: "Ambiance conviviale et plats traditionnels revisités.",
    price: "Menu dès 30 000 FCFA",
    isPopular: false,
    freeCancel: true,
  },
  {
    image: "/media/hotels/hotel1.jpg",
    name: "Le Gourmet Parisien",
    city: "Paris, France",
    rating: 4.8,
    description: "Cuisine raffinée et ambiance élégante au cœur de Paris.",
    price: "Menu dès 45 000 FCFA",
    isPopular: true,
    freeCancel: false,
  },
  {
    image: "/media/hotels/hotel2.jpg",
    name: "Saveurs du Monde",
    city: "Lyon, France",
    rating: 4.7,
    description: "Voyage culinaire à travers les saveurs du monde.",
    price: "Menu dès 38 000 FCFA",
    isPopular: false,
    freeCancel: true,
  },
  {
    image: "/media/hotels/hotel3.jpg",
    name: "Bistro Chic",
    city: "Marseille, France",
    rating: 4.6,
    description: "Ambiance conviviale et plats traditionnels revisités.",
    price: "Menu dès 30 000 FCFA",
    isPopular: false,
    freeCancel: true,
  },
];

// Ajouter les tableaux de données fictives pour chaque section
const chillPlaces = [
  { image: '/media/hotels/hotel1.jpg', name: 'Chill Bar', city: 'Abidjan', rating: 4.2, description: 'Ambiance lounge et cocktails signature.', price: 'Entrée libre', isPopular: false, freeCancel: false },
  { image: '/media/hotels/hotel2.jpg', name: 'Night Vibes', city: 'Abidjan', rating: 4.4, description: 'Soirées DJ et tapas.', price: 'Entrée 5 000 FCFA', isPopular: true, freeCancel: false },
  { image: '/media/hotels/hotel3.jpg', name: 'Rooftop 360', city: 'Abidjan', rating: 4.6, description: 'Vue panoramique et musique live.', price: 'Entrée 10 000 FCFA', isPopular: false, freeCancel: true },
  { image: '/media/hotels/hotel1.jpg', name: 'Cosy Spot', city: 'Abidjan', rating: 4.1, description: 'Canapés moelleux et mocktails.', price: 'Entrée libre', isPopular: false, freeCancel: true },
];
const kidsSpaces = [
  { image: '/media/hotels/hotel2.jpg', name: 'Kids Park', city: 'Abidjan', rating: 4.7, description: 'Jeux et animations pour enfants.', price: 'Entrée 2 000 FCFA', isPopular: true, freeCancel: true },
  { image: '/media/hotels/hotel3.jpg', name: 'Fun Zone', city: 'Abidjan', rating: 4.5, description: 'Espace sécurisé et éducatif.', price: 'Entrée 3 000 FCFA', isPopular: false, freeCancel: true },
  { image: '/media/hotels/hotel1.jpg', name: 'Mini Club', city: 'Abidjan', rating: 4.3, description: 'Ateliers créatifs et jeux.', price: 'Entrée 2 500 FCFA', isPopular: false, freeCancel: false },
  { image: '/media/hotels/hotel2.jpg', name: 'Playground', city: 'Abidjan', rating: 4.6, description: 'Structures gonflables et toboggans.', price: 'Entrée 2 000 FCFA', isPopular: true, freeCancel: true },
];
const residences = [
  { image: '/media/hotels/hotel3.jpg', name: 'Résidence Zen', city: 'Abidjan', rating: 4.8, description: 'Studios tout équipés et discrets.', price: 'Dès 60 000 FCFA/nuit', isPopular: true, freeCancel: true },
  { image: '/media/hotels/hotel1.jpg', name: 'Secret Loft', city: 'Abidjan', rating: 4.5, description: 'Ambiance feutrée et confort.', price: 'Dès 55 000 FCFA/nuit', isPopular: false, freeCancel: true },
  { image: '/media/hotels/hotel2.jpg', name: 'Urban Hideout', city: 'Abidjan', rating: 4.4, description: 'Emplacement central et calme.', price: 'Dès 50 000 FCFA/nuit', isPopular: false, freeCancel: false },
  { image: '/media/hotels/hotel3.jpg', name: 'Quiet Place', city: 'Abidjan', rating: 4.7, description: 'Service discret et raffiné.', price: 'Dès 65 000 FCFA/nuit', isPopular: true, freeCancel: true },
];
const lounges = [
  { image: '/media/hotels/hotel1.jpg', name: 'Lounge Relax', city: 'Abidjan', rating: 4.3, description: 'Ambiance cosy et raffinée.', price: 'Entrée 4 000 FCFA', isPopular: false, freeCancel: true },
  { image: '/media/hotels/hotel2.jpg', name: 'Chic Corner', city: 'Abidjan', rating: 4.5, description: 'Cocktails et douce musique.', price: 'Entrée 5 000 FCFA', isPopular: true, freeCancel: false },
  { image: '/media/hotels/hotel3.jpg', name: 'Zen Space', city: 'Abidjan', rating: 4.6, description: 'Détente et gourmandises.', price: 'Entrée 6 000 FCFA', isPopular: false, freeCancel: true },
  { image: '/media/hotels/hotel1.jpg', name: 'Cosy Lounge', city: 'Abidjan', rating: 4.2, description: 'Espace chaleureux.', price: 'Entrée 4 500 FCFA', isPopular: false, freeCancel: true },
];
const magicPlaces = [
  { image: '/media/hotels/hotel2.jpg', name: 'Magic Lake', city: 'Abidjan', rating: 4.9, description: 'Lieu féérique au bord de l’eau.', price: 'Visite 8 000 FCFA', isPopular: true, freeCancel: true },
  { image: '/media/hotels/hotel3.jpg', name: 'Enchanted Garden', city: 'Abidjan', rating: 4.8, description: 'Jardin secret et animations.', price: 'Visite 7 000 FCFA', isPopular: false, freeCancel: true },
  { image: '/media/hotels/hotel1.jpg', name: 'Hidden Falls', city: 'Abidjan', rating: 4.7, description: 'Cascade cachée et détente.', price: 'Visite 9 000 FCFA', isPopular: false, freeCancel: false },
  { image: '/media/hotels/hotel2.jpg', name: 'Hidden Falls', city: 'Abidjan', rating: 4.7, description: 'Cascade cachée et détente.', price: 'Visite 9 000 FCFA', isPopular: false, freeCancel: false },
];


export default function Home() {
  // Embla pour la section Hôtels en vogue
  React.useEffect(() => {
    // This block is removed as emblaRef and emblaApi are no longer used for the restaurants section
  }, []);

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

      <AnimatedSection>
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="mb-12">
              <SectionHeader 
                title="Hôtels en vogue" 
                subtitle="Découvrez les établissements les plus prisés du moment" 
                className="text-center"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {hotels.slice(0, 4).map((hotel, idx) => (
                <ListingCard key={idx} {...hotel} />
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      <section className="py-20 bg-gradient-to-br from-orange-50 via-white to-yellow-100">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <SectionHeader 
              title="La haute gastronomie" 
              subtitle="Savourez une expérience culinaire d'exception" 
              className="text-center"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {restaurants.slice(0, 4).map((restaurant, idx) => (
              <ListingCard key={idx} {...restaurant} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-purple-50 via-white to-pink-100">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-right">
            <SectionHeader 
              title="Chill de minuit" 
              subtitle="Des lieux parfaits pour vos soirées inoubliables" 
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {chillPlaces.slice(0, 4).map((place, idx) => (
              <ListingCard key={idx} {...place} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-green-50 via-white to-emerald-100">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-right">
            <SectionHeader 
              title="Espace des tout petits" 
              subtitle="Des espaces ludiques et sécurisés pour vos enfants" 
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kidsSpaces.slice(0, 4).map((space, idx) => (
              <ListingCard key={idx} {...space} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-right">
            <SectionHeader 
              title="Résidences incognito" 
              subtitle="Séjournez dans le confort et la discrétion" 
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {residences.slice(0, 4).map((residence, idx) => (
              <ListingCard key={idx} {...residence} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-cyan-50 via-white to-sky-100">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <SectionHeader 
              title="Petite détente dans nos lounges" 
              subtitle="Détendez-vous dans une ambiance cosy et raffinée" 
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {lounges.slice(0, 4).map((lounge, idx) => (
              <ListingCard key={idx} {...lounge} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-pink-50 via-white to-rose-100">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <SectionHeader 
              title="Lieux magiques" 
              subtitle="Explorez des endroits uniques et enchanteurs" 
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {magicPlaces.slice(0, 4).map((place, idx) => (
              <ListingCard key={idx} {...place} />
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto flex justify-center py-10 mb-10 px-2 md:px-0">
        <div className="w-full md:w-2/3 bg-gradient-to-br from-orange-50 via-white to-yellow-100 rounded-3xl shadow-2xl p-10 flex flex-col items-center gap-6 border border-orange-100">
          <h2 className="text-3xl md:text-5xl font-extrabold text-theme-primary mb-2 text-center drop-shadow-lg tracking-tight">Restez informé !</h2>
          <p className="text-gray-700 text-center text-base md:text-lg mb-2 max-w-xl">Abonnez-vous à notre newsletter pour recevoir les meilleures adresses, bons plans et événements exclusifs du Coin Chic du Moment.</p>
          <form className="w-full flex flex-col md:flex-row gap-3 md:gap-0 md:items-center justify-center">
            <div className="relative w-full md:w-2/3">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-primary text-xl"><FiMail /></span>
              <input
                type="email"
                required
                placeholder="Votre adresse email"
                className="pl-10 pr-4 py-3 rounded-l-full rounded-r-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-theme-primary text-base w-full shadow-sm bg-white"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 bg-theme-primary text-white px-8 py-3 rounded-full font-bold text-lg shadow-md hover:bg-orange-500 transition-colors duration-200 md:rounded-l-none md:rounded-r-full md:ml-2"
            >S&apos;inscrire <FiSend className="ml-1 text-xl" /></button>
          </form>
          <span className="text-xs text-gray-400 mt-2 text-center">Nous respectons votre vie privée. Désabonnement possible à tout moment.</span>
        </div>
      </section>
    </div>
  );
}
