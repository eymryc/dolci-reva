"use client"

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from "next/image";
import Link from "next/link";
import { 
  MapPin, 
  Star, 
  Heart, 
  Share2, 
  Wifi, 
  Car, 
  Coffee, 
  Utensils, 
  Dumbbell,
  Shield,
  Clock,
  Users,
  Bed,
  Bath,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Check,
  X
} from "lucide-react";

// Carousel amélioré
function Carousel({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const total = images.length;

  const goTo = (idx: number) => setCurrent((idx + total) % total);
  const prev = () => goTo(current - 1);
  const next = () => goTo(current + 1);

  return (
    <div className="relative w-full group">
      <div className="w-full aspect-[16/10] rounded-3xl overflow-hidden bg-gray-100 shadow-2xl">
        <Image
          src={images[current]}
          alt={`Photo ${current + 1}`}
          fill
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 1200px"
          priority={current === 0}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      </div>
      
      {/* Flèches améliorées */}
      <button
        onClick={prev}
        className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-theme-primary hover:text-white transition-all duration-300 p-3 rounded-full shadow-xl border border-gray-200 z-10 opacity-0 group-hover:opacity-100"
        aria-label="Précédent"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-theme-primary hover:text-white transition-all duration-300 p-3 rounded-full shadow-xl border border-gray-200 z-10 opacity-0 group-hover:opacity-100"
        aria-label="Suivant"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
      
      {/* Compteur d'images */}
      <div className="absolute top-6 right-6 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
        {current + 1} / {total}
      </div>
      
      {/* Points améliorés */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              idx === current 
                ? 'bg-white scale-125' 
                : 'bg-white/60 hover:bg-white/80'
            }`}
            aria-label={`Aller à la photo ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function DetailPage() {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  
  // Données fictives pour l'exemple
  const images = [
    '/media/hotels/hotel1.jpg',
    '/media/hotels/hotel2.jpg',
    '/media/hotels/hotel3.jpg',
  ];

  const amenities = [
    { icon: Wifi, name: 'Wi-Fi gratuit', available: true },
    { icon: Car, name: 'Parking gratuit', available: true },
    { icon: Coffee, name: 'Petit-déjeuner', available: true },
    { icon: Utensils, name: 'Restaurant', available: true },
    { icon: Dumbbell, name: 'Salle de sport', available: false },
    { icon: Shield, name: 'Sécurité 24h/24', available: true },
    { icon: Clock, name: 'Service 24h/24', available: true },
    { icon: Users, name: 'Réception multilingue', available: true },
  ];

  const reviews = [
    { name: 'Jean M.', rating: 5, date: 'Il y a 2 jours', comment: 'Superbe séjour, hôtel très propre et bien situé ! Le personnel est très accueillant.' },
    { name: 'Sophie L.', rating: 4.8, date: 'Il y a 1 semaine', comment: 'Accueil chaleureux, je recommande vivement ! Petit-déjeuner excellent.' },
    { name: 'Pierre D.', rating: 5, date: 'Il y a 2 semaines', comment: 'Parfait pour un séjour d\'affaires. Très bon rapport qualité-prix.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-theme-primary transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Retour à l&apos;accueil</span>
            </Link>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Partager
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className={`flex items-center gap-2 ${isFavorite ? 'text-red-500 border-red-500' : ''}`}
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'Favori' : 'Ajouter aux favoris'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Galerie d'images */}
        <section className="mb-8">
          <Carousel images={images} />
        </section>

        {/* Titre, localisation, note */}
        <section className="mb-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2 text-gray-900">Hôtel de Luxe Abidjan Centre</h1>
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <MapPin className="w-5 h-5 text-theme-primary" />
                <span>Plateau, Abidjan, Côte d&apos;Ivoire</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="font-semibold text-lg">4.8</span>
                  <span className="text-gray-500">(128 avis)</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Check className="w-3 h-3 mr-1" />
                  Disponible
                </Badge>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Colonne principale */}
          <div className="flex-1 space-y-8">
            {/* Infos principales */}
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-theme-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-theme-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Capacité</p>
                    <p className="font-semibold">2 voyageurs</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-theme-primary/10 rounded-full flex items-center justify-center">
                    <Bed className="w-6 h-6 text-theme-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Chambres</p>
                    <p className="font-semibold">1 chambre</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-theme-primary/10 rounded-full flex items-center justify-center">
                    <Bath className="w-6 h-6 text-theme-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Salle de bain</p>
                    <p className="font-semibold">1 salle de bain</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Description */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">À propos de cet hôtel</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Découvrez le charme authentique de l&apos;hôtellerie ivoirienne dans cet établissement de luxe situé au cœur du Plateau, le quartier d&apos;affaires d&apos;Abidjan. Notre hôtel allie tradition et modernité pour vous offrir une expérience inoubliable.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Profitez de nos chambres spacieuses avec vue sur la lagune, de notre restaurant gastronomique proposant une cuisine locale raffinée, et de nos équipements de pointe pour un séjour d&apos;affaires ou de détente réussi.
              </p>
            </Card>

            {/* Équipements améliorés */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Équipements et services</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAllAmenities(!showAllAmenities)}
                >
                  {showAllAmenities ? 'Voir moins' : 'Voir tout'}
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {amenities.slice(0, showAllAmenities ? amenities.length : 6).map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <amenity.icon className={`w-5 h-5 ${amenity.available ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className={`${amenity.available ? 'text-gray-900' : 'text-gray-400'}`}>
                      {amenity.name}
                    </span>
                    {amenity.available ? (
                      <Check className="w-4 h-4 text-green-500 ml-auto" />
                    ) : (
                      <X className="w-4 h-4 text-gray-400 ml-auto" />
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Avis améliorés */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Avis clients</h2>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="font-semibold text-lg">4.8</span>
                  <span className="text-gray-500">(128 avis)</span>
                </div>
              </div>
              
              <div className="space-y-6">
                {reviews.map((review, index) => (
                  <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-theme-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
                        {review.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900">{review.name}</span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < Math.floor(review.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <span className="text-gray-500 text-sm">{review.date}</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full mt-6">
                Voir tous les avis
              </Button>
            </Card>

            {/* Carte améliorée */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Localisation</h2>
              <div className="w-full h-80 bg-gray-100 rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-theme-primary/10 to-theme-warm/10" />
                <div className="text-center z-10">
                  <MapPin className="w-12 h-12 text-theme-primary mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">Plateau, Abidjan</p>
                  <p className="text-sm text-gray-500">Côte d&apos;Ivoire</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-theme-primary" />
                  <span>Centre-ville</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-theme-primary" />
                  <span>5 min de l&apos;aéroport</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-theme-primary" />
                  <span>Zone sécurisée</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Encadré de réservation amélioré */}
          <aside className="w-full lg:w-96">
            <Card className="p-6 sticky top-24 shadow-2xl border border-gray-200 rounded-3xl bg-white">
              <div className="text-center mb-6">
                <div className="flex items-end justify-center gap-1 mb-2">
                  <span className="text-4xl font-bold text-theme-primary">78&nbsp;000</span>
                  <span className="text-gray-600 text-lg">FCFA</span>
                </div>
                <p className="text-gray-500">/ nuit</p>
                <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
                  <Check className="w-3 h-3 mr-1" />
                  Meilleur prix garanti
                </Badge>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dates de séjour</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input 
                        type="date" 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary" 
                        placeholder="Arrivée" 
                      />
                      <p className="text-xs text-gray-500 mt-1">Arrivée</p>
                    </div>
                    <div>
                      <input 
                        type="date" 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary" 
                        placeholder="Départ" 
                      />
                      <p className="text-xs text-gray-500 mt-1">Départ</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Voyageurs</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary">
                    <option>1 voyageur</option>
                    <option>2 voyageurs</option>
                    <option>3 voyageurs</option>
                    <option>4+ voyageurs</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>78 000 FCFA × 2 nuits</span>
                  <span>156 000 FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Frais de service</span>
                  <span>Gratuit</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taxes</span>
                  <span>Incluses</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>156 000 FCFA</span>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-theme-primary hover:bg-theme-primary/90 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                Réserver maintenant
              </Button>
              
              <div className="text-center mt-4 space-y-2">
                <p className="text-gray-500 text-sm">Vous ne serez pas encore débité</p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                  <Shield className="w-4 h-4" />
                  <span>Paiement sécurisé</span>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
} 