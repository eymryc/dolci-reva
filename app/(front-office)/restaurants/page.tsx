"use client"

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Heart,
  Share2,
  Phone,
  Globe
} from "lucide-react";

export default function RestaurantsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');

  // Données fictives des restaurants
  const restaurants = [
    {
      id: 1,
      name: "Le Bistrot du Plateau",
      location: "Plateau, Abidjan",
      cuisine: "Française",
      price: "€€€",
      rating: 4.8,
      reviews: 156,
      image: "/media/hotels/hotel1.jpg",
      description: "Cuisine française raffinée avec une touche locale",
      features: ["Terrasse", "Wi-Fi", "Réservation"],
      popular: true,
      openNow: true,
      delivery: true
    },
    {
      id: 2,
      name: "Maquis Chez Gbê",
      location: "Cocody, Abidjan",
      cuisine: "Ivoirienne",
      price: "€",
      rating: 4.6,
      reviews: 89,
      image: "/media/hotels/hotel2.jpg",
      description: "Authentique cuisine ivoirienne dans une ambiance chaleureuse",
      features: ["Terrasse", "Musique live", "Parking"],
      popular: true,
      openNow: true,
      delivery: false
    },
    {
      id: 3,
      name: "Sushi Zen",
      location: "Marcory, Abidjan",
      cuisine: "Japonaise",
      price: "€€€€",
      rating: 4.7,
      reviews: 124,
      image: "/media/hotels/hotel3.jpg",
      description: "Sushi et sashimi frais préparés par des maîtres sushi",
      features: ["Bar à sushis", "Wi-Fi", "Réservation"],
      popular: false,
      openNow: false,
      delivery: true
    },
    {
      id: 4,
      name: "Pizza Corner",
      location: "Yopougon, Abidjan",
      cuisine: "Italienne",
      price: "€€",
      rating: 4.3,
      reviews: 67,
      image: "/media/hotels/hotel1.jpg",
      description: "Pizzas artisanales cuites au feu de bois",
      features: ["Livraison", "Emporté", "Wi-Fi"],
      popular: false,
      openNow: true,
      delivery: true
    },
    {
      id: 5,
      name: "Café des Arts",
      location: "Treichville, Abidjan",
      cuisine: "Café & Brunch",
      price: "€€",
      rating: 4.5,
      reviews: 98,
      image: "/media/hotels/hotel2.jpg",
      description: "Café culturel avec brunchs créatifs et expositions",
      features: ["Wi-Fi", "Expositions", "Terrasse"],
      popular: true,
      openNow: true,
      delivery: false
    },
    {
      id: 6,
      name: "Grill House",
      location: "Riviera, Abidjan",
      cuisine: "Grill & BBQ",
      price: "€€€",
      rating: 4.4,
      reviews: 76,
      image: "/media/hotels/hotel3.jpg",
      description: "Viandes grillées et spécialités barbecue",
      features: ["Terrasse", "Bar", "Parking"],
      popular: false,
      openNow: true,
      delivery: true
    }
  ];

  const cuisines = [
    { value: 'all', label: 'Toutes les cuisines' },
    { value: 'Ivoirienne', label: 'Ivoirienne' },
    { value: 'Française', label: 'Française' },
    { value: 'Japonaise', label: 'Japonaise' },
    { value: 'Italienne', label: 'Italienne' },
    { value: 'Café & Brunch', label: 'Café & Brunch' },
    { value: 'Grill & BBQ', label: 'Grill & BBQ' }
  ];

  const priceRanges = [
    { value: 'all', label: 'Tous les prix' },
    { value: '€', label: '€ Économique' },
    { value: '€€', label: '€€ Modéré' },
    { value: '€€€', label: '€€€ Élevé' },
    { value: '€€€€', label: '€€€€ Luxe' }
  ];

  const ratings = [
    { value: 'all', label: 'Toutes les notes' },
    { value: '5', label: '5 étoiles' },
    { value: '4', label: '4+ étoiles' },
    { value: '3', label: '3+ étoiles' }
  ];

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCuisine = selectedCuisine === 'all' || restaurant.cuisine === selectedCuisine;
    const matchesPrice = selectedPrice === 'all' || restaurant.price === selectedPrice;
    const matchesRating = selectedRating === 'all' || restaurant.rating >= parseInt(selectedRating);

    return matchesSearch && matchesCuisine && matchesPrice && matchesRating;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-theme-warm to-theme-primary py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Gastronomie d&apos;Exception</h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Découvrez les saveurs authentiques de Côte d&apos;Ivoire et du monde. 
              De la cuisine traditionnelle aux créations contemporaines.
            </p>
            
            {/* Barre de recherche */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Rechercher un restaurant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20"
                  />
                </div>
                <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Type de cuisine" />
                  </SelectTrigger>
                  <SelectContent>
                    {cuisines.map((cuisine) => (
                      <SelectItem key={cuisine.value} value={cuisine.value}>
                        {cuisine.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedPrice} onValueChange={setSelectedPrice}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Prix" />
                  </SelectTrigger>
                  <SelectContent>
                    {priceRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
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
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Filtres supplémentaires */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Select value={selectedRating} onValueChange={setSelectedRating}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Note minimum" />
            </SelectTrigger>
            <SelectContent>
              {ratings.map((rating) => (
                <SelectItem key={rating.value} value={rating.value}>
                  {rating.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Plus de filtres
          </Button>
        </div>

        {/* Résultats */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredRestaurants.length} restaurant{filteredRestaurants.length > 1 ? 's' : ''} trouvé{filteredRestaurants.length > 1 ? 's' : ''}
          </h2>
          <Select defaultValue="popular">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Plus populaires</SelectItem>
              <SelectItem value="rating">Meilleures notes</SelectItem>
              <SelectItem value="distance">Plus proches</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grille des restaurants */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRestaurants.map((restaurant) => (
            <Card key={restaurant.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <div className="relative">
                <Image
                  src={restaurant.image}
                  alt={restaurant.name}
                  width={400}
                  height={250}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button size="sm" variant="secondary" className="w-8 h-8 p-0 rounded-full">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="secondary" className="w-8 h-8 p-0 rounded-full">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="absolute top-4 left-4">
                  {restaurant.popular && (
                    <Badge className="bg-red-500 text-white">Populaire</Badge>
                  )}
                </div>
                <div className="absolute bottom-4 left-4">
                  <Badge variant="secondary" className="bg-white/90 text-gray-900">
                    {restaurant.openNow ? 'Ouvert' : 'Fermé'}
                  </Badge>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-theme-primary transition-colors">
                    {restaurant.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-semibold">{restaurant.rating}</span>
                    <span className="text-gray-500 text-sm">({restaurant.reviews})</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 text-theme-primary" />
                  <span className="text-sm">{restaurant.location}</span>
                </div>
                
                <div className="flex items-center gap-4 mb-3">
                  <Badge variant="outline">{restaurant.cuisine}</Badge>
                  <span className="text-lg font-semibold text-theme-primary">{restaurant.price}</span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{restaurant.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {restaurant.features.slice(0, 3).map((feature, index) => (
                    <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {feature}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Phone className="w-4 h-4 mr-1" />
                      Appeler
                    </Button>
                    <Button size="sm" variant="outline">
                      <Globe className="w-4 h-4 mr-1" />
                      Site web
                    </Button>
                  </div>
                  <Link href={`/details/${restaurant.id}`}>
                    <Button className="bg-theme-primary hover:bg-theme-primary/90">
                      Voir détails
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-12">
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled>Précédent</Button>
            <Button variant="outline" className="bg-theme-primary text-white">1</Button>
            <Button variant="outline">2</Button>
            <Button variant="outline">3</Button>
            <Button variant="outline">Suivant</Button>
          </div>
        </div>
      </div>
    </div>
  );
} 