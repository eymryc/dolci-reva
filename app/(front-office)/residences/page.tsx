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
  Bed,
  Bath,
  Square,
  Heart,
  Share2,
  Phone,
  Globe
} from "lucide-react";

export default function ResidencesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');

  // Données fictives des résidences
  const residences = [
    {
      id: 1,
      name: "Résidence Les Palmiers",
      location: "Cocody, Abidjan",
      type: "Appartement",
      price: 45000,
      rating: 4.7,
      reviews: 89,
      image: "/media/hotels/hotel1.jpg",
      description: "Appartement moderne avec vue sur la lagune",
      features: ["Wi-Fi", "Parking", "Climatisation", "Sécurité"],
      popular: true,
      available: true,
      bedrooms: 2,
      bathrooms: 1,
      area: "85 m²"
    },
    {
      id: 2,
      name: "Villa Riviera",
      location: "Riviera, Abidjan",
      type: "Villa",
      price: 120000,
      rating: 4.9,
      reviews: 156,
      image: "/media/hotels/hotel2.jpg",
      description: "Villa de luxe avec piscine privée et jardin",
      features: ["Piscine", "Jardin", "Wi-Fi", "Parking", "Sécurité"],
      popular: true,
      available: true,
      bedrooms: 4,
      bathrooms: 3,
      area: "200 m²"
    },
    {
      id: 3,
      name: "Studio Plateau",
      location: "Plateau, Abidjan",
      type: "Studio",
      price: 25000,
      rating: 4.3,
      reviews: 67,
      image: "/media/hotels/hotel3.jpg",
      description: "Studio fonctionnel au cœur du quartier d'affaires",
      features: ["Wi-Fi", "Climatisation", "Sécurité"],
      popular: false,
      available: true,
      bedrooms: 1,
      bathrooms: 1,
      area: "35 m²"
    },
    {
      id: 4,
      name: "Duplex Marcory",
      location: "Marcory, Abidjan",
      type: "Duplex",
      price: 75000,
      rating: 4.5,
      reviews: 98,
      image: "/media/hotels/hotel1.jpg",
      description: "Duplex spacieux avec terrasse privée",
      features: ["Terrasse", "Wi-Fi", "Parking", "Climatisation"],
      popular: false,
      available: false,
      bedrooms: 3,
      bathrooms: 2,
      area: "120 m²"
    },
    {
      id: 5,
      name: "Penthouse Yopougon",
      location: "Yopougon, Abidjan",
      type: "Penthouse",
      price: 150000,
      rating: 4.8,
      reviews: 124,
      image: "/media/hotels/hotel2.jpg",
      description: "Penthouse de luxe avec vue panoramique",
      features: ["Vue panoramique", "Terrasse", "Wi-Fi", "Parking", "Sécurité"],
      popular: true,
      available: true,
      bedrooms: 3,
      bathrooms: 2,
      area: "180 m²"
    },
    {
      id: 6,
      name: "Loft Treichville",
      location: "Treichville, Abidjan",
      type: "Loft",
      price: 35000,
      rating: 4.2,
      reviews: 45,
      image: "/media/hotels/hotel3.jpg",
      description: "Loft industriel rénové avec charme authentique",
      features: ["Wi-Fi", "Climatisation", "Parking"],
      popular: false,
      available: true,
      bedrooms: 1,
      bathrooms: 1,
      area: "60 m²"
    }
  ];

  const types = [
    { value: 'all', label: 'Tous les types' },
    { value: 'Appartement', label: 'Appartement' },
    { value: 'Villa', label: 'Villa' },
    { value: 'Studio', label: 'Studio' },
    { value: 'Duplex', label: 'Duplex' },
    { value: 'Penthouse', label: 'Penthouse' },
    { value: 'Loft', label: 'Loft' }
  ];

  const priceRanges = [
    { value: 'all', label: 'Tous les prix' },
    { value: 'budget', label: 'Moins de 30 000 FCFA' },
    { value: 'mid', label: '30 000 - 60 000 FCFA' },
    { value: 'high', label: '60 000 - 100 000 FCFA' },
    { value: 'luxury', label: 'Plus de 100 000 FCFA' }
  ];

  const ratings = [
    { value: 'all', label: 'Toutes les notes' },
    { value: '5', label: '5 étoiles' },
    { value: '4', label: '4+ étoiles' },
    { value: '3', label: '3+ étoiles' }
  ];

  const filteredResidences = residences.filter(residence => {
    const matchesSearch = residence.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         residence.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         residence.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || residence.type === selectedType;
    const matchesPrice = selectedPrice === 'all' || 
      (selectedPrice === 'budget' && residence.price < 30000) ||
      (selectedPrice === 'mid' && residence.price >= 30000 && residence.price <= 60000) ||
      (selectedPrice === 'high' && residence.price > 60000 && residence.price <= 100000) ||
      (selectedPrice === 'luxury' && residence.price > 100000);
    const matchesRating = selectedRating === 'all' || residence.rating >= parseInt(selectedRating);

    return matchesSearch && matchesType && matchesPrice && matchesRating;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-theme-primary to-theme-accent py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Résidences d&apos;Exception</h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Trouvez votre résidence idéale pour un séjour confortable et mémorable. 
              Du studio moderne à la villa de luxe, découvrez notre sélection exclusive.
            </p>
            
            {/* Barre de recherche */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Rechercher une résidence..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20"
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Type de résidence" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
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
            {filteredResidences.length} résidence{filteredResidences.length > 1 ? 's' : ''} trouvée{filteredResidences.length > 1 ? 's' : ''}
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

        {/* Grille des résidences */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredResidences.map((residence) => (
            <Card key={residence.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <div className="relative">
                <Image
                  src={residence.image}
                  alt={residence.name}
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
                  {residence.popular && (
                    <Badge className="bg-red-500 text-white">Populaire</Badge>
                  )}
                </div>
                <div className="absolute bottom-4 left-4">
                  <Badge variant="secondary" className={`${residence.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {residence.available ? 'Disponible' : 'Occupé'}
                  </Badge>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-theme-primary transition-colors">
                    {residence.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-semibold">{residence.rating}</span>
                    <span className="text-gray-500 text-sm">({residence.reviews})</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 text-theme-primary" />
                  <span className="text-sm">{residence.location}</span>
                </div>
                
                <div className="flex items-center gap-4 mb-3">
                  <Badge variant="outline">{residence.type}</Badge>
                  <span className="text-lg font-semibold text-theme-primary">{residence.price.toLocaleString()} FCFA</span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{residence.description}</p>
                
                <div className="grid grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    <span>{residence.bedrooms} ch.</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="w-4 h-4" />
                    <span>{residence.bathrooms} sdb</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Square className="w-4 h-4" />
                    <span>{residence.area}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {residence.features.slice(0, 3).map((feature, index) => (
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
                  <Link href={`/details/${residence.id}`}>
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