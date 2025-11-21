"use client"

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import ResidenceCard from '@/components/cards/ResidenceCard';
import HeroSection from '@/components/sections/HeroSection';
import { usePublicResidences, type PublicResidencesFilters, type GalleryImage } from '@/hooks/use-residences';
import { Search, MapPin, Home, AlertCircle, RefreshCw, ArrowUpDown } from "lucide-react";

export default function ResidencesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [orderPrice, setOrderPrice] = useState<'asc' | 'desc' | ''>('');

  // Construire les filtres pour l'API
  const filters: PublicResidencesFilters = useMemo(() => {
    const apiFilters: PublicResidencesFilters = {};
    
    if (searchTerm.trim()) apiFilters.search = searchTerm.trim();
    if (selectedCity.trim()) apiFilters.city = selectedCity.trim();
    if (selectedType && selectedType !== 'all') apiFilters.type = selectedType;
    if (orderPrice) apiFilters.order_price = orderPrice as 'asc' | 'desc';
    
    return apiFilters;
  }, [searchTerm, selectedCity, selectedType, orderPrice]);

  // Récupération des résidences depuis l'API avec les filtres
  const { data: residencesData, isLoading, error } = usePublicResidences(filters);


  const types = [
    { value: 'all', label: 'Tous les types' },
    { value: 'STUDIO', label: 'Studio' },
    { value: 'APPARTEMENT', label: 'Appartement' },
    { value: 'VILLA', label: 'Villa' },
    { value: 'MAISON', label: 'Maison' },
    { value: 'LOFT', label: 'Loft' },
    { value: 'DUPLEX', label: 'Duplex' }
  ];

  // Récupérer les villes uniques depuis les résidences (pour le dropdown)
  const cities = useMemo(() => {
    if (!residencesData) return [];
    const uniqueCities = Array.from(new Set(residencesData.map(r => r.city).filter(Boolean)));
    return uniqueCities.sort();
  }, [residencesData]);

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
        amenities: residence.amenities || [],
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
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
          {/* Sidebar Filtres - Left */}
          <div>
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-md border border-gray-100 p-4 sm:p-6 md:p-8 lg:sticky lg:top-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8">Filtres</h3>
              
              <div className="space-y-4 sm:space-y-5">
                {/* Barre de recherche */}
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 z-10 pointer-events-none group-focus-within:text-theme-primary transition-colors" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 sm:pl-10 h-11 sm:h-12 text-sm sm:text-base border-2 border-gray-200 focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 text-gray-900 bg-gray-50 hover:bg-white transition-all duration-200 rounded-lg sm:rounded-xl"
                  />
                </div>

                {/* Selects Ville et Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="min-w-0">
                    <label className="text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-3 block">Ville</label>
                    <Select value={selectedCity || 'all'} onValueChange={(value) => setSelectedCity(value === 'all' ? '' : value)}>
                      <SelectTrigger className="h-11 sm:h-12 text-sm sm:text-base text-gray-900 bg-gray-50 hover:bg-white border-2 border-gray-200 focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 rounded-lg sm:rounded-xl transition-all duration-200 w-full">
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                          <SelectValue placeholder="Toutes les villes" className="truncate" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les villes</SelectItem>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="min-w-0">
                    <label className="text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-3 block">Type</label>
                    <Select value={selectedType || 'all'} onValueChange={(value) => setSelectedType(value === 'all' ? '' : value)}>
                      <SelectTrigger className="h-11 sm:h-12 text-sm sm:text-base text-gray-900 bg-gray-50 hover:bg-white border-2 border-gray-200 focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 rounded-lg sm:rounded-xl transition-all duration-200 w-full">
                        <div className="flex items-center gap-2 min-w-0">
                          <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                          <SelectValue placeholder="Tous les types" className="truncate" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {types.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Trier par prix */}
                <div className="min-w-0">
                  <label className="text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-3 block">Trier par prix</label>
                  <Select
                    value={orderPrice || 'none'}
                    onValueChange={(value) => setOrderPrice(value === 'none' ? '' : value as 'asc' | 'desc')}
                  >
                    <SelectTrigger className="h-11 sm:h-12 text-sm sm:text-base text-gray-900 bg-gray-50 hover:bg-white border-2 border-gray-200 focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 rounded-lg sm:rounded-xl transition-all duration-200 w-full">
                      <div className="flex items-center gap-2 min-w-0">
                        <ArrowUpDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                        <SelectValue placeholder="Trier par prix" className="truncate" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Trier par prix</SelectItem>
                      <SelectItem value="asc">Prix croissant</SelectItem>
                      <SelectItem value="desc">Prix décroissant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bouton Rechercher */}
                <Button className="w-full h-11 sm:h-12 text-sm sm:text-base bg-gradient-to-r from-theme-primary to-theme-accent hover:from-theme-primary/90 hover:to-theme-accent/90 text-white font-semibold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Rechercher
                </Button>

                {/* Bouton Réinitialiser */}
                {(searchTerm || selectedCity || selectedType || orderPrice) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCity('');
                      setSelectedType('');
                      setOrderPrice('');
                    }}
                    className="w-full h-11 sm:h-12 text-sm sm:text-base border-2 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg sm:rounded-xl transition-all duration-200"
                  >
                    Réinitialiser
                  </Button>
                )}
              </div>
            </div>
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
                        <div className="h-3 sm:h-4 bg-gray-200 rounded-lg w-3/4"></div>
                        <div className="h-3 sm:h-4 bg-gray-200 rounded-lg w-1/2"></div>
                        <div className="h-3 sm:h-4 bg-gray-200 rounded-lg w-full"></div>
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
              <div className="text-center py-16 md:py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Erreur de chargement</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Une erreur s&apos;est produite lors du chargement des résidences. Veuillez réessayer.
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-theme-primary hover:bg-theme-primary/90 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Réessayer
                </Button>
              </div>
            ) : residences.length === 0 ? (
              <div className="text-center py-16 md:py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun résultat trouvé</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Aucune résidence ne correspond à vos critères de recherche. Essayez de modifier vos filtres.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCity('');
                    setSelectedType('');
                    setOrderPrice('');
                  }}
                  className="border-2 border-theme-primary text-theme-primary hover:bg-theme-primary hover:text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Réinitialiser les filtres
                </Button>
              </div>
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