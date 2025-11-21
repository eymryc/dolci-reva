"use client"

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import ListingCard from '@/components/cards/ListingCard';
import HeroSection from '@/components/sections/HeroSection';
import { usePublicResidences, type PublicResidencesFilters } from '@/hooks/use-residences';
import { Search } from "lucide-react";

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

  // Format price with space separator
  const formatPrice = (price: string) => {
    return parseFloat(price).toLocaleString('fr-FR', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    });
  };

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

  // Mapper les résidences de l'API vers le format attendu (les filtres sont déjà appliqués côté serveur)
  const residences = useMemo(() => {
    if (!residencesData) return [];
    
    return residencesData.map((residence) => ({
      id: residence.id,
      name: residence.name,
      location: `${residence.city}, ${residence.country}`,
      type: residence.type,
      price: parseFloat(residence.price),
      rating: parseFloat(residence.average_rating) || 0,
      reviews: residence.rating_count || 0,
      image: residence.main_image_url || residence.main_image_thumb_url || "/media/hotels/hotel1.jpg",
      description: residence.description || "Aucune description disponible.",
      features: residence.amenities?.map((amenity: { name: string }) => amenity.name) || [],
      popular: residence.has_ratings || residence.rating_count > 0,
      available: residence.is_available,
      bedrooms: residence.bedrooms || null,
      bathrooms: residence.bathrooms || null,
      area: residence.piece_number ? `${residence.piece_number} pièces` : null,
      standing: residence.standing,
      amenities: residence.amenities,
      availability_status: residence.availability_status,
    }));
  }, [residencesData]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection
        title="Découvrez nos Résidences"
        subtitle="Explorez une sélection exclusive de résidences de luxe pour votre séjour en Côte d'Ivoire"
        backgroundImage="/media/slide/slide3.jpg"
      />
      
      <div className="container mx-auto px-2 md:px-0 py-8">
        <div className="text-center">
          {/* Barre de recherche */}
          <div className="max-w-5xl mx-auto bg-white rounded-2xl p-6 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10 pointer-events-none" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 text-gray-900 bg-white"
                />
              </div>
              <Select value={selectedCity || 'all'} onValueChange={(value) => setSelectedCity(value === 'all' ? '' : value)}>
                <SelectTrigger className="h-12 text-gray-900 bg-white border-gray-200 focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20">
                  <SelectValue placeholder="Ville" />
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
              <Select value={selectedType || 'all'} onValueChange={(value) => setSelectedType(value === 'all' ? '' : value)}>
                <SelectTrigger className="h-12 text-gray-900 bg-white border-gray-200 focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="h-12 bg-theme-primary hover:bg-theme-primary/90">
                <Search className="w-5 h-5 mr-2" />
                Rechercher
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 md:px-0 py-12">
        {/* Résultats */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {residences.length} résidence{residences.length > 1 ? 's' : ''} trouvée{residences.length > 1 ? 's' : ''}
          </h2>
          <Select 
            value={orderPrice || 'none'} 
            onValueChange={(value) => setOrderPrice(value === 'none' ? '' : value as 'asc' | 'desc')}
          >
            <SelectTrigger className="w-48 text-gray-900 bg-white border-gray-200 focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20">
              <SelectValue placeholder="Trier par prix" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Trier par prix</SelectItem>
              <SelectItem value="asc">Prix croissant</SelectItem>
              <SelectItem value="desc">Prix décroissant</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grille des résidences */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <Card key={idx} className="overflow-hidden animate-pulse">
                <div className="h-64 bg-gray-200"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Une erreur s&apos;est produite lors du chargement des résidences.</p>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </div>
        ) : residences.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Aucune résidence ne correspond à vos critères de recherche.</p>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setSelectedCity('');
              setSelectedType('');
              setOrderPrice('');
            }}>Réinitialiser les filtres</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {residences.map((residence) => (
              <ListingCard
                key={residence.id}
                id={residence.id}
                image={residence.image}
                name={residence.name}
                city={residence.location}
                description={residence.description}
                price={`${formatPrice(residence.price.toString())} FCFA`}
                isPopular={residence.popular}
                type={residence.type}
                standing={residence.standing}
                amenities={residence.amenities}
                availability_status={residence.availability_status}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 