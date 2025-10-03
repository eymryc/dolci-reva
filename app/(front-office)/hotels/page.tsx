"use client"

import { useState } from 'react';
import HotelCard from '@/components/HotelCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter
} from "lucide-react";

export default function HotelsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');

  // Données fictives des hôtels
  const hotels = [
    {
      id: 1,
      name: "Hôtel de Luxe Abidjan Centre",
      location: "Plateau, Abidjan",
      price: 78000,
      rating: 4.8,
      reviews: 128,
      image: "/media/hotels/hotel1.jpg",
      amenities: ["Wi-Fi", "Parking", "Restaurant", "Spa"],
      category: "luxury",
      popular: true,
      freeCancel: true
    },
    {
      id: 2,
      name: "Resort Lagune Cocody",
      location: "Cocody, Abidjan",
      price: 65000,
      rating: 4.6,
      reviews: 95,
      image: "/media/hotels/hotel2.jpg",
      amenities: ["Wi-Fi", "Piscine", "Restaurant", "Gym"],
      category: "resort",
      popular: false,
      freeCancel: true
    },
    {
      id: 3,
      name: "Business Hotel Marcory",
      location: "Marcory, Abidjan",
      price: 45000,
      rating: 4.4,
      reviews: 67,
      image: "/media/hotels/hotel3.jpg",
      amenities: ["Wi-Fi", "Parking", "Salle de conférence"],
      category: "business",
      popular: false,
      freeCancel: false
    },
    {
      id: 4,
      name: "Boutique Hotel Yopougon",
      location: "Yopougon, Abidjan",
      price: 35000,
      rating: 4.2,
      reviews: 43,
      image: "/media/hotels/hotel1.jpg",
      amenities: ["Wi-Fi", "Restaurant", "Bar"],
      category: "boutique",
      popular: false,
      freeCancel: true
    },
    {
      id: 5,
      name: "Eco Lodge Assinie",
      location: "Assinie, Côte d'Ivoire",
      price: 55000,
      rating: 4.7,
      reviews: 89,
      image: "/media/hotels/hotel2.jpg",
      amenities: ["Plage", "Restaurant", "Activités nautiques"],
      category: "eco",
      popular: true,
      freeCancel: true
    },
    {
      id: 6,
      name: "City Hotel Treichville",
      location: "Treichville, Abidjan",
      price: 28000,
      rating: 4.0,
      reviews: 34,
      image: "/media/hotels/hotel3.jpg",
      amenities: ["Wi-Fi", "Parking", "Restaurant"],
      category: "city",
      popular: false,
      freeCancel: false
    }
  ];

  const categories = [
    { value: 'all', label: 'Tous les hôtels' },
    { value: 'luxury', label: 'Luxe' },
    { value: 'resort', label: 'Resort' },
    { value: 'business', label: 'Affaires' },
    { value: 'boutique', label: 'Boutique' },
    { value: 'eco', label: 'Éco-lodge' },
    { value: 'city', label: 'Ville' }
  ];

  const priceRanges = [
    { value: 'all', label: 'Tous les prix' },
    { value: 'budget', label: 'Moins de 30 000 FCFA' },
    { value: 'mid', label: '30 000 - 50 000 FCFA' },
    { value: 'high', label: '50 000 - 80 000 FCFA' },
    { value: 'luxury', label: 'Plus de 80 000 FCFA' }
  ];

  const ratings = [
    { value: 'all', label: 'Toutes les notes' },
    { value: '5', label: '5 étoiles' },
    { value: '4', label: '4+ étoiles' },
    { value: '3', label: '3+ étoiles' }
  ];

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hotel.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || hotel.category === selectedCategory;
    const matchesPrice = selectedPrice === 'all' || 
      (selectedPrice === 'budget' && hotel.price < 30000) ||
      (selectedPrice === 'mid' && hotel.price >= 30000 && hotel.price <= 50000) ||
      (selectedPrice === 'high' && hotel.price > 50000 && hotel.price <= 80000) ||
      (selectedPrice === 'luxury' && hotel.price > 80000);
    const matchesRating = selectedRating === 'all' || hotel.rating >= parseInt(selectedRating);

    return matchesSearch && matchesCategory && matchesPrice && matchesRating;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-theme-primary to-theme-warm py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Hôtels de Prestige</h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Découvrez notre sélection d&apos;hôtels d&apos;exception en Côte d&apos;Ivoire. 
              Du luxe urbain aux éco-lodges en passant par les resorts de plage.
            </p>
            
            {/* Barre de recherche */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Rechercher un hôtel..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
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
            {filteredHotels.length} hôtel{filteredHotels.length > 1 ? 's' : ''} trouvé{filteredHotels.length > 1 ? 's' : ''}
          </h2>
          <Select defaultValue="popular">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Plus populaires</SelectItem>
              <SelectItem value="price-low">Prix croissant</SelectItem>
              <SelectItem value="price-high">Prix décroissant</SelectItem>
              <SelectItem value="rating">Meilleures notes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grille des hôtels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredHotels.map((hotel) => (
            <HotelCard
              key={hotel.id}
              name={hotel.name}
              city={hotel.location}
              price={`${hotel.price.toLocaleString()} FCFA`}
              rating={hotel.rating}
              description={`Hôtel ${hotel.category} avec ${hotel.amenities.join(', ')}`}
              image={hotel.image}
              isPopular={hotel.popular}
              freeCancel={hotel.freeCancel}
            />
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