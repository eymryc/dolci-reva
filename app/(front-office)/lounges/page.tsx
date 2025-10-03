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
  Clock, 
  Coffee, 
  Wine,
  Music,
  Heart,
  Share2,
  Phone,
  Globe,
  Users,
  Wifi,
  Car
} from "lucide-react";

export default function LoungesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');

  // Données fictives des lounges
  const lounges = [
    {
      id: 1,
      name: "Sky Lounge Plateau",
      location: "Plateau, Abidjan",
      type: "Rooftop",
      price: "€€€",
      rating: 4.8,
      reviews: 156,
      image: "/media/hotels/hotel1.jpg",
      description: "Vue panoramique sur la ville avec cocktails signature",
      features: ["Vue panoramique", "Wi-Fi", "Parking", "Musique live"],
      popular: true,
      openNow: true,
      capacity: "50 personnes"
    },
    {
      id: 2,
      name: "Café Lounge Cocody",
      location: "Cocody, Abidjan",
      type: "Café",
      price: "€€",
      rating: 4.6,
      reviews: 89,
      image: "/media/hotels/hotel2.jpg",
      description: "Ambiance cosy pour travailler ou se détendre",
      features: ["Wi-Fi", "Prise électrique", "Petit-déjeuner", "Terrasse"],
      popular: true,
      openNow: true,
      capacity: "30 personnes"
    },
    {
      id: 3,
      name: "Wine Bar Riviera",
      location: "Riviera, Abidjan",
      type: "Bar à vin",
      price: "€€€€",
      rating: 4.7,
      reviews: 124,
      image: "/media/hotels/hotel3.jpg",
      description: "Sélection de vins fins et fromages d'exception",
      features: ["Cave à vin", "Dégustation", "Wi-Fi", "Parking"],
      popular: false,
      openNow: false,
      capacity: "25 personnes"
    },
    {
      id: 4,
      name: "Business Lounge Marcory",
      location: "Marcory, Abidjan",
      type: "Business",
      price: "€€",
      rating: 4.4,
      reviews: 67,
      image: "/media/hotels/hotel1.jpg",
      description: "Espace de travail moderne avec services professionnels",
      features: ["Salle de réunion", "Wi-Fi", "Imprimante", "Café"],
      popular: false,
      openNow: true,
      capacity: "40 personnes"
    },
    {
      id: 5,
      name: "Jazz Lounge Treichville",
      location: "Treichville, Abidjan",
      type: "Musique",
      price: "€€€",
      rating: 4.5,
      reviews: 98,
      image: "/media/hotels/hotel2.jpg",
      description: "Concerts de jazz et ambiance feutrée",
      features: ["Musique live", "Bar", "Wi-Fi", "Parking"],
      popular: true,
      openNow: true,
      capacity: "60 personnes"
    },
    {
      id: 6,
      name: "Garden Lounge Yopougon",
      location: "Yopougon, Abidjan",
      type: "Jardin",
      price: "€€",
      rating: 4.3,
      reviews: 76,
      image: "/media/hotels/hotel3.jpg",
      description: "Espace vert paisible en plein cœur de la ville",
      features: ["Jardin", "Terrasse", "Wi-Fi", "Parking"],
      popular: false,
      openNow: true,
      capacity: "35 personnes"
    }
  ];

  const types = [
    { value: 'all', label: 'Tous les types' },
    { value: 'Rooftop', label: 'Rooftop' },
    { value: 'Café', label: 'Café' },
    { value: 'Bar à vin', label: 'Bar à vin' },
    { value: 'Business', label: 'Business' },
    { value: 'Musique', label: 'Musique' },
    { value: 'Jardin', label: 'Jardin' }
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

  const filteredLounges = lounges.filter(lounge => {
    const matchesSearch = lounge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lounge.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lounge.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || lounge.type === selectedType;
    const matchesPrice = selectedPrice === 'all' || lounge.price === selectedPrice;
    const matchesRating = selectedRating === 'all' || lounge.rating >= parseInt(selectedRating);

    return matchesSearch && matchesType && matchesPrice && matchesRating;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-theme-accent to-theme-primary py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Lounges d&apos;Exception</h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Découvrez des espaces de détente uniques où l&apos;élégance rencontre le confort. 
              Parfait pour vos moments de pause et vos rencontres d&apos;affaires.
            </p>
            
            {/* Barre de recherche */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Rechercher un lounge..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20"
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Type de lounge" />
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
            {filteredLounges.length} lounge{filteredLounges.length > 1 ? 's' : ''} trouvé{filteredLounges.length > 1 ? 's' : ''}
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

        {/* Grille des lounges */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredLounges.map((lounge) => (
            <Card key={lounge.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <div className="relative">
                <Image
                  src={lounge.image}
                  alt={lounge.name}
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
                  {lounge.popular && (
                    <Badge className="bg-red-500 text-white">Populaire</Badge>
                  )}
                </div>
                <div className="absolute bottom-4 left-4">
                  <Badge variant="secondary" className="bg-white/90 text-gray-900">
                    {lounge.openNow ? 'Ouvert' : 'Fermé'}
                  </Badge>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-theme-primary transition-colors">
                    {lounge.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-semibold">{lounge.rating}</span>
                    <span className="text-gray-500 text-sm">({lounge.reviews})</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 text-theme-primary" />
                  <span className="text-sm">{lounge.location}</span>
                </div>
                
                <div className="flex items-center gap-4 mb-3">
                  <Badge variant="outline">{lounge.type}</Badge>
                  <span className="text-lg font-semibold text-theme-primary">{lounge.price}</span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{lounge.description}</p>
                
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{lounge.capacity}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Ouvert maintenant</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {lounge.features.slice(0, 3).map((feature, index) => (
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
                  <Link href={`/details/${lounge.id}`}>
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