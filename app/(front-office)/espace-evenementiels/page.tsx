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
  Users, 
  Calendar,
  Heart,
  Share2,
  Phone,
  Globe,
  Wifi,
  Car,
  Utensils,
  Music,
  Camera
} from "lucide-react";

export default function EspaceEvenementielsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCapacity, setSelectedCapacity] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');

  // Données fictives des espaces événementiels
  const eventSpaces = [
    {
      id: 1,
      name: "Salle des Fêtes Plateau",
      location: "Plateau, Abidjan",
      type: "Salle de réception",
      capacity: 200,
      rating: 4.8,
      reviews: 156,
      image: "/media/hotels/hotel1.jpg",
      description: "Salle élégante pour mariages et événements d'entreprise",
      features: ["Sonorisation", "Éclairage", "Cuisine", "Parking", "Wi-Fi"],
      popular: true,
      available: true,
      price: 150000,
      area: "300 m²"
    },
    {
      id: 2,
      name: "Centre de Conférences Cocody",
      location: "Cocody, Abidjan",
      type: "Centre de conférences",
      capacity: 500,
      rating: 4.7,
      reviews: 89,
      image: "/media/hotels/hotel2.jpg",
      description: "Espace professionnel pour séminaires et conférences",
      features: ["Projection", "Micros", "Wi-Fi", "Parking", "Catering"],
      popular: true,
      available: true,
      price: 200000,
      area: "500 m²"
    },
    {
      id: 3,
      name: "Jardin Événementiel Riviera",
      location: "Riviera, Abidjan",
      type: "Jardin",
      capacity: 150,
      rating: 4.6,
      reviews: 67,
      image: "/media/hotels/hotel3.jpg",
      description: "Jardin paysager pour événements en plein air",
      features: ["Jardin", "Tente", "Éclairage", "Parking", "Cuisine"],
      popular: false,
      available: true,
      price: 100000,
      area: "400 m²"
    },
    {
      id: 4,
      name: "Rooftop Lounge Marcory",
      location: "Marcory, Abidjan",
      type: "Rooftop",
      capacity: 80,
      rating: 4.5,
      reviews: 98,
      image: "/media/hotels/hotel1.jpg",
      description: "Terrasse panoramique pour cocktails et soirées privées",
      features: ["Vue panoramique", "Bar", "Éclairage", "Sonorisation"],
      popular: false,
      available: false,
      price: 80000,
      area: "150 m²"
    },
    {
      id: 5,
      name: "Salle Polyvalente Yopougon",
      location: "Yopougon, Abidjan",
      type: "Salle polyvalente",
      capacity: 300,
      rating: 4.4,
      reviews: 124,
      image: "/media/hotels/hotel2.jpg",
      description: "Espace modulable pour tous types d'événements",
      features: ["Modulable", "Sonorisation", "Éclairage", "Parking", "Cuisine"],
      popular: true,
      available: true,
      price: 120000,
      area: "350 m²"
    },
    {
      id: 6,
      name: "Villa Événementielle Treichville",
      location: "Treichville, Abidjan",
      type: "Villa",
      capacity: 100,
      rating: 4.3,
      reviews: 76,
      image: "/media/hotels/hotel3.jpg",
      description: "Villa historique pour événements intimes et élégants",
      features: ["Jardin", "Piscine", "Cuisine", "Parking", "Wi-Fi"],
      popular: false,
      available: true,
      price: 180000,
      area: "250 m²"
    }
  ];

  const types = [
    { value: 'all', label: 'Tous les types' },
    { value: 'Salle de réception', label: 'Salle de réception' },
    { value: 'Centre de conférences', label: 'Centre de conférences' },
    { value: 'Jardin', label: 'Jardin' },
    { value: 'Rooftop', label: 'Rooftop' },
    { value: 'Salle polyvalente', label: 'Salle polyvalente' },
    { value: 'Villa', label: 'Villa' }
  ];

  const capacities = [
    { value: 'all', label: 'Toutes les capacités' },
    { value: 'small', label: 'Moins de 100 personnes' },
    { value: 'medium', label: '100 - 300 personnes' },
    { value: 'large', label: 'Plus de 300 personnes' }
  ];

  const ratings = [
    { value: 'all', label: 'Toutes les notes' },
    { value: '5', label: '5 étoiles' },
    { value: '4', label: '4+ étoiles' },
    { value: '3', label: '3+ étoiles' }
  ];

  const filteredEventSpaces = eventSpaces.filter(space => {
    const matchesSearch = space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         space.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         space.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || space.type === selectedType;
    const matchesCapacity = selectedCapacity === 'all' || 
      (selectedCapacity === 'small' && space.capacity < 100) ||
      (selectedCapacity === 'medium' && space.capacity >= 100 && space.capacity <= 300) ||
      (selectedCapacity === 'large' && space.capacity > 300);
    const matchesRating = selectedRating === 'all' || space.rating >= parseInt(selectedRating);

    return matchesSearch && matchesType && matchesCapacity && matchesRating;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-theme-warm to-theme-accent py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Espaces Événementiels</h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Organisez vos événements dans des espaces d&apos;exception. 
              Mariages, séminaires, conférences, anniversaires... Nous avons l&apos;espace parfait pour vous.
            </p>
            
            {/* Barre de recherche */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Rechercher un espace..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20"
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Type d'espace" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedCapacity} onValueChange={setSelectedCapacity}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Capacité" />
                  </SelectTrigger>
                  <SelectContent>
                    {capacities.map((capacity) => (
                      <SelectItem key={capacity.value} value={capacity.value}>
                        {capacity.label}
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
            {filteredEventSpaces.length} espace{filteredEventSpaces.length > 1 ? 's' : ''} trouvé{filteredEventSpaces.length > 1 ? 's' : ''}
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

        {/* Grille des espaces événementiels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEventSpaces.map((space) => (
            <Card key={space.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <div className="relative">
                <Image
                  src={space.image}
                  alt={space.name}
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
                  {space.popular && (
                    <Badge className="bg-red-500 text-white">Populaire</Badge>
                  )}
                </div>
                <div className="absolute bottom-4 left-4">
                  <Badge variant="secondary" className={`${space.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {space.available ? 'Disponible' : 'Occupé'}
                  </Badge>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-theme-primary transition-colors">
                    {space.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-semibold">{space.rating}</span>
                    <span className="text-gray-500 text-sm">({space.reviews})</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 text-theme-primary" />
                  <span className="text-sm">{space.location}</span>
                </div>
                
                <div className="flex items-center gap-4 mb-3">
                  <Badge variant="outline">{space.type}</Badge>
                  <span className="text-lg font-semibold text-theme-primary">{space.price.toLocaleString()} FCFA</span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{space.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{space.capacity} personnes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{space.area}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {space.features.slice(0, 3).map((feature, index) => (
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
                  <Link href={`/details/${space.id}`}>
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