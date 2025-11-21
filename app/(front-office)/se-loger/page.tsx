"use client"

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import HebergementCard from '@/components/cards/HebergementCard';
import HeroSection from '@/components/sections/HeroSection';
import { usePublicDwellings, type PublicDwellingsFilters, type GalleryImage } from '@/hooks/use-dwellings';
import { Search, MapPin, Home, AlertCircle, RefreshCw } from "lucide-react";

export default function SeLogerPage() {
   const [searchTerm, setSearchTerm] = useState('');
   const [selectedCity, setSelectedCity] = useState('');
   const [selectedType, setSelectedType] = useState('');
   const [orderPrice, setOrderPrice] = useState<'asc' | 'desc' | ''>('');

   // Construire les filtres pour l'API
   const filters: PublicDwellingsFilters = useMemo(() => {
      const apiFilters: PublicDwellingsFilters = {};

      if (searchTerm.trim()) apiFilters.search = searchTerm.trim();
      if (selectedCity.trim()) apiFilters.city = selectedCity.trim();
      if (selectedType && selectedType !== 'all') apiFilters.type = selectedType;
      if (orderPrice) apiFilters.order_price = orderPrice as 'asc' | 'desc';

      return apiFilters;
   }, [searchTerm, selectedCity, selectedType, orderPrice]);

   // Récupération des hébergements depuis l'API avec les filtres
   const { data: dwellingsData, isLoading, error } = usePublicDwellings(filters);

   const types = [
      { value: 'all', label: 'Tous les types' },
      { value: 'STUDIO', label: 'Studio' },
      { value: 'APPARTEMENT', label: 'Appartement' },
      { value: 'VILLA', label: 'Villa' },
      { value: 'MAISON', label: 'Maison' },
      { value: 'LOFT', label: 'Loft' },
      { value: 'DUPLEX', label: 'Duplex' }
   ];

   // Récupérer les villes uniques depuis les hébergements (pour le dropdown)
   const cities = useMemo(() => {
      if (!dwellingsData) return [];
      const uniqueCities = Array.from(new Set(dwellingsData.map(d => d.city).filter(Boolean)));
      return uniqueCities.sort();
   }, [dwellingsData]);

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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
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

                {/* Bouton Rechercher */}
                <Button className="w-full h-11 sm:h-12 text-sm sm:text-base bg-gradient-to-r from-theme-primary to-theme-accent hover:from-theme-primary/90 hover:to-theme-accent/90 text-white font-semibold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Rechercher
                </Button>

                {/* Bouton Réinitialiser */}
                {(searchTerm || selectedCity || selectedType) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCity('');
                      setSelectedType('');
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
            {/* Liste des hébergements */}
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
                  Une erreur s&apos;est produite lors du chargement des hébergements. Veuillez réessayer.
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-theme-primary hover:bg-theme-primary/90 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Réessayer
                </Button>
              </div>
            ) : dwellings.length === 0 ? (
              <div className="text-center py-16 md:py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun résultat trouvé</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Aucun hébergement ne correspond à vos critères de recherche. Essayez de modifier vos filtres.
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

