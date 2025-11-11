"use client"

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from "next/image";
import Link from "next/link";
import { usePublicDwelling, GalleryImage } from '@/hooks/use-dwellings';
import { useAuth } from '@/context/AuthContext';
import { CustomerSignUpModal } from '@/components/auth/CustomerSignUpModal';
import { Calendar, Home, MapPin, Droplet, Sofa, Building2, Eye } from 'lucide-react';
import { 
  Heart, 
  Share2, 
  Shield,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import { toast } from 'sonner';

// Carousel amélioré avec disposition moderne
function Carousel({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const total = images.length;
  const hasMultipleImages = total > 1;

  const goTo = (idx: number) => setCurrent((idx + total) % total);
  const prev = () => goTo(current - 1);
  const next = () => goTo(current + 1);

  if (images.length === 0) {
    return (
      <div className="w-full aspect-[16/10] rounded-3xl overflow-hidden bg-gray-100 shadow-2xl flex items-center justify-center">
        <p className="text-gray-400">Aucune image disponible</p>
      </div>
    );
  }

  // Si une seule image, affichage simple
  if (!hasMultipleImages) {
    return (
      <div className="relative w-full group">
        <div className="w-full aspect-[16/10] rounded-3xl overflow-hidden bg-gray-100 shadow-2xl">
          <Image
            src={images[0]}
            alt="Photo principale"
            fill
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 1200px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
        </div>
      </div>
    );
  }

  // Disposition avec miniatures
  const maxVisibleThumbnails = 6;
  const shouldShowAll = images.length <= maxVisibleThumbnails;
  const visibleThumbnails = shouldShowAll ? images : images.slice(0, maxVisibleThumbnails - 1);
  const hasMoreThanMax = images.length > maxVisibleThumbnails;

  return (
    <div className="w-full flex flex-col lg:flex-row gap-3">
      {/* Image principale - 50% */}
      <div className="w-full lg:w-1/2 relative aspect-[16/10] rounded-2xl overflow-hidden bg-gray-100 shadow-md group">
        <Image
          src={images[current] || images[0]}
          alt={`Photo ${current + 1} sur ${total}`}
          fill
          className="w-full h-full object-cover transition-all duration-700"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={current === 0}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
        
        {/* Compteur d'images */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-medium z-10">
          {current + 1} / {total}
        </div>
      
        {/* Flèches de navigation */}
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-theme-primary hover:text-white transition-all duration-300 p-1.5 rounded-full shadow-md border border-gray-200 z-10 opacity-100 hover:scale-110"
          aria-label="Photo précédente"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-theme-primary hover:text-white transition-all duration-300 p-1.5 rounded-full shadow-md border border-gray-200 z-10 opacity-100 hover:scale-110"
          aria-label="Photo suivante"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      {/* Miniatures en grille 3 colonnes - 50% */}
      <div className="w-full lg:w-1/2">
        <div className="grid grid-cols-3 gap-2">
          {visibleThumbnails.map((image, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-300 ${
                idx === current 
                  ? 'ring-2 ring-theme-primary shadow-md'
                  : 'ring-1 ring-gray-200 hover:ring-theme-primary/50 opacity-70 hover:opacity-100'
              }`}
              aria-label={`Voir la photo ${idx + 1}`}
            >
              <Image
                src={image}
                alt={`Miniature ${idx + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, 16vw"
              />
              {idx === current && (
                <div className="absolute inset-0 bg-theme-primary/15 border-2 border-theme-primary" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
            </button>
          ))}
          
          {/* Indicateur s'il y a plus d'images */}
          {hasMoreThanMax && (
            <button
              onClick={() => {
                const nextIndex = visibleThumbnails.length;
                goTo(nextIndex);
              }}
              className="relative aspect-square rounded-lg bg-gradient-to-br from-theme-primary/10 to-theme-accent/10 flex items-center justify-center border-2 border-theme-primary/30 hover:border-theme-primary transition-all duration-300 cursor-pointer"
              aria-label={`Voir les ${images.length - maxVisibleThumbnails + 1} images restantes`}
            >
              <div className="text-center">
                <span className="text-lg font-bold text-theme-primary">+{images.length - maxVisibleThumbnails + 1}</span>
                <p className="text-xs text-gray-600 mt-0.5 font-medium">plus</p>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Formater les labels
const formatLabel = (value: string) => {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};


export default function HebergementDetailPage() {
  const params = useParams();
  const id = parseInt(params.id as string);
  const { data: dwelling, isLoading, error } = usePublicDwelling(id);
  const { user } = useAuth();
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  
  // Format price
  const formatPrice = (price: number) => {
    return price.toLocaleString('fr-FR', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-theme-primary mx-auto mb-4" />
          <p className="text-gray-600">Chargement des détails de l&apos;hébergement...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !dwelling) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Une erreur s&apos;est produite lors du chargement de l&apos;hébergement.</p>
          <Link href="/se-loger">
            <Button>Retour aux hébergements</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get images from dwelling data
  const images: string[] = [];
  if (dwelling.all_images && dwelling.all_images.length > 0) {
    dwelling.all_images.forEach((img: GalleryImage) => {
      if (img.url && !images.includes(img.url)) {
        images.push(img.url);
      }
    });
  } else if (dwelling.main_image_url) {
    images.push(dwelling.main_image_url);
    if (dwelling.gallery_images && dwelling.gallery_images.length > 0) {
      dwelling.gallery_images.forEach((img: GalleryImage) => {
        if (img.url && !images.includes(img.url)) {
          images.push(img.url);
        }
      });
    }
  }
  
  if (images.length === 0) {
    images.push('/media/hotels/hotel1.jpg');
  }

  // Generate title
  const generateTitle = () => {
    if (!dwelling.type) return dwelling.description || `Hébergement ${dwelling.id}`;
    
    const typeLabel = formatLabel(dwelling.type);
    const city = dwelling.city || '';
    const addressDetails = dwelling.address ? dwelling.address.split(',').slice(0, 2).join(', ') : '';
    
    if (city && addressDetails) {
      return `${typeLabel} à ${city}, ${addressDetails}`;
    } else if (city) {
      return `${typeLabel} à ${city}`;
    }
    
    return typeLabel;
  };

  const title = generateTitle();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header avec navigation amélioré */}
      <div className="bg-white/80 backdrop-blur-md shadow-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/se-loger" 
              className="flex items-center gap-2 text-gray-700 hover:text-theme-primary transition-all duration-300 group font-medium"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Retour aux hébergements</span>
            </Link>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 hover:bg-theme-primary/5 hover:border-theme-primary/30 transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Partager</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className={`flex items-center gap-2 transition-all duration-300 ${
                  isFavorite 
                    ? 'text-red-500 border-red-500 bg-red-50 hover:bg-red-100' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart className={`w-4 h-4 transition-all ${isFavorite ? 'fill-current scale-110' : ''}`} />
                <span className="hidden sm:inline">{isFavorite ? 'Favori' : 'Ajouter aux favoris'}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Galerie d'images */}
        <section className="mb-6">
          <Carousel images={images} />
        </section>

        {/* Titre, localisation, note amélioré */}
        <section className="mb-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between gap-4 mb-2">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight flex-1">{title}</h1>
                {dwelling.piece_number && (
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
                    <Home className="w-4 h-4 text-theme-primary" />
                    <span className="font-semibold text-sm text-gray-900 whitespace-nowrap">
                      {dwelling.piece_number} pièce{dwelling.piece_number > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {dwelling.type && (
                  <Badge 
                    variant="secondary" 
                    className="px-3 py-1 text-xs font-medium bg-theme-primary/10 text-theme-primary border border-theme-primary/20"
                  >
                    {formatLabel(dwelling.type)}
                  </Badge>
                )}
                {dwelling.structure_type_label && (
                  <Badge 
                    variant="secondary" 
                    className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    {dwelling.structure_type_label}
                  </Badge>
                )}
                {dwelling.construction_type_label && (
                  <Badge 
                    variant="secondary" 
                    className="px-3 py-1 text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200"
                  >
                    {dwelling.construction_type_label}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-gray-600 mb-4 text-base">
                <MapPin className="w-4 h-4 text-theme-primary flex-shrink-0" />
                <span className="truncate">
                  {dwelling.address && `${dwelling.address}, `}
                  {dwelling.city && `${dwelling.city}, `}
                  {dwelling.country}
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Colonne principale */}
          <div className="flex-1 space-y-6">
            {/* Description améliorée */}
            <Card className="p-4 lg:p-6 shadow-md border border-gray-100 bg-white">
              <h2 className="text-xl lg:text-2xl font-bold mb-4 text-gray-900 border-b border-gray-100 pb-3">À propos de cet hébergement</h2>
              {dwelling.description ? (
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                    {dwelling.description}
                  </p>
                </div>
              ) : (
                <p className="text-gray-700 leading-relaxed text-base">
                  Découvrez cet hébergement exceptionnel situé à {dwelling.city}, {dwelling.country}. 
                  Une expérience de séjour unique vous attend dans cet hébergement de type {dwelling.type ? formatLabel(dwelling.type).toLowerCase() : 'premium'}.
                </p>
              )}
            </Card>

            {/* Informations détaillées */}
            <Card className="p-4 lg:p-6 shadow-md border border-gray-100 bg-white">
              <h2 className="text-xl lg:text-2xl font-bold mb-4 text-gray-900 border-b border-gray-100 pb-3">Informations détaillées</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dwelling.piece_number != null && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100">
                    <div className="w-10 h-10 bg-theme-primary/10 rounded-lg flex items-center justify-center">
                      <Home className="w-5 h-5 text-theme-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Nombre de pièces</p>
                      <p className="font-semibold text-gray-900">{dwelling.piece_number}</p>
                    </div>
                  </div>
                )}
                {dwelling.rooms != null && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Home className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Chambres</p>
                      <p className="font-semibold text-gray-900">{dwelling.rooms}</p>
                    </div>
                  </div>
                )}
                {dwelling.bathrooms != null && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100">
                    <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <Droplet className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Salles de bain</p>
                      <p className="font-semibold text-gray-900">{dwelling.bathrooms}</p>
                    </div>
                  </div>
                )}
                {dwelling.living_room != null && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Sofa className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Salons</p>
                      <p className="font-semibold text-gray-900">{dwelling.living_room}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Informations financières */}
            {(dwelling.rent_advance_amount_number || dwelling.security_deposit_month_number || dwelling.agency_fees_month_number || dwelling.visite_price) && (
              <Card className="p-4 lg:p-6 shadow-md border border-gray-100 bg-white">
                <h2 className="text-xl lg:text-2xl font-bold mb-4 text-gray-900 border-b border-gray-100 pb-3">Informations financières</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {dwelling.rent_advance_amount_number && dwelling.rent_advance_amount_number > 0 && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-700" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-600 uppercase tracking-wide font-medium">Avance</p>
                        <p className="font-semibold text-blue-900">{dwelling.rent_advance_amount_number} mois</p>
                      </div>
                    </div>
                  )}
                  {dwelling.security_deposit_month_number && dwelling.security_deposit_month_number > 0 && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-amber-700" />
                      </div>
                      <div>
                        <p className="text-xs text-amber-600 uppercase tracking-wide font-medium">Caution</p>
                        <p className="font-semibold text-amber-900">{dwelling.security_deposit_month_number} mois</p>
                      </div>
                    </div>
                  )}
                  {dwelling.agency_fees_month_number && dwelling.agency_fees_month_number > 0 && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 border border-purple-200">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-purple-700" />
                      </div>
                      <div>
                        <p className="text-xs text-purple-600 uppercase tracking-wide font-medium">Frais d&apos;agence</p>
                        <p className="font-semibold text-purple-900">{dwelling.agency_fees_month_number} mois</p>
                      </div>
                    </div>
                  )}
                  {dwelling.visite_price && dwelling.visite_price > 0 && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Eye className="w-5 h-5 text-green-700" />
                      </div>
                      <div>
                        <p className="text-xs text-green-600 uppercase tracking-wide font-medium">Visite</p>
                        <p className="font-semibold text-green-900">{formatPrice(dwelling.visite_price)} FCFA</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Localisation */}
            <Card className="p-4 lg:p-6 shadow-md border border-gray-100 bg-white overflow-hidden">
              <h2 className="text-xl lg:text-2xl font-bold mb-4 text-gray-900 border-b border-gray-100 pb-3">Localisation</h2>
              
              {/* Informations de localisation */}
              <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-5 h-5 text-theme-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">{dwelling.city || 'Localisation'}</p>
                    <p className="text-sm text-gray-600">{dwelling.country}</p>
                  </div>
                </div>
                {dwelling.address && (
                  <p className="text-sm text-gray-600 pl-7">{dwelling.address}</p>
                )}
              </div>

              {/* Carte */}
              {dwelling.latitude && dwelling.longitude ? (
                <div className="w-full h-96 rounded-xl overflow-hidden border border-gray-200 shadow-lg relative">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${dwelling.latitude},${dwelling.longitude}&hl=fr&z=15&output=embed`}
                    className="w-full h-full"
                  />
                  <a
                    href={`https://www.google.com/maps?q=${dwelling.latitude},${dwelling.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-2 right-2 bg-white px-3 py-2 rounded-lg shadow-md text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3" />
                    Ouvrir dans Google Maps
                  </a>
                </div>
              ) : dwelling.address ? (
                <div className="w-full h-96 rounded-xl overflow-hidden border border-gray-200 shadow-lg relative">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(dwelling.address + ', ' + dwelling.city + ', ' + dwelling.country)}&hl=fr&z=15&output=embed`}
                    className="w-full h-full"
                  />
                  <a
                    href={`https://www.google.com/maps?q=${encodeURIComponent(dwelling.address + ', ' + dwelling.city + ', ' + dwelling.country)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-2 right-2 bg-white px-3 py-2 rounded-lg shadow-md text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3" />
                    Ouvrir dans Google Maps
                  </a>
                </div>
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 rounded-xl flex items-center justify-center relative overflow-hidden border border-gray-200">
                  <div className="absolute inset-0 bg-gradient-to-br from-theme-primary/10 via-theme-primary/5 to-theme-accent/10" />
                  <div className="text-center z-10 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
                    <MapPin className="w-14 h-14 text-theme-primary mx-auto mb-3 drop-shadow-lg" />
                    <p className="text-gray-800 font-bold text-lg mb-1">{dwelling.city || 'Localisation'}</p>
                    <p className="text-sm text-gray-600 mb-2">{dwelling.country}</p>
                    <p className="text-xs text-gray-500 mt-2">Carte non disponible</p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Encadré de réservation amélioré */}
          <aside className="w-full lg:w-96">
            <Card className="p-6 lg:p-8 sticky top-24 shadow-2xl border-0 rounded-3xl bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
              <div className="text-center mb-8">
                <div className="flex items-end justify-center gap-1 mb-3">
                  <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-theme-primary to-theme-accent">
                    {formatPrice(dwelling.rent)}
                  </span>
                  <span className="text-gray-600 text-xl mb-1">FCFA</span>
                </div>
                <p className="text-gray-500 text-sm mb-4">/ mois</p>
              </div>

              <div className="space-y-3 mb-8 p-5 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
                <div className="flex justify-between text-sm py-2 border-b border-gray-200">
                  <span className="text-gray-600">Loyer mensuel</span>
                  <span className="font-semibold text-gray-900">
                    {formatPrice(dwelling.rent)} FCFA
                  </span>
                </div>
                {dwelling.rent_advance_amount_number && dwelling.rent_advance_amount_number > 0 && (
                  <div className="flex justify-between text-sm py-2 border-b border-gray-200">
                    <span className="text-gray-600">Avance ({dwelling.rent_advance_amount_number} mois)</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(dwelling.rent_advance_amount || dwelling.rent * dwelling.rent_advance_amount_number)} FCFA
                    </span>
                  </div>
                )}
                {dwelling.security_deposit_month_number && dwelling.security_deposit_month_number > 0 && (
                  <div className="flex justify-between text-sm py-2 border-b border-gray-200">
                    <span className="text-gray-600">Caution ({dwelling.security_deposit_month_number} mois)</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(dwelling.security_deposit_amount || dwelling.rent * dwelling.security_deposit_month_number)} FCFA
                    </span>
                  </div>
                )}
                {dwelling.agency_fees_month_number && dwelling.agency_fees_month_number > 0 && (
                  <div className="flex justify-between text-sm py-2 border-b border-gray-200">
                    <span className="text-gray-600">Frais d&apos;agence ({dwelling.agency_fees_month_number} mois)</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(dwelling.agency_fees || dwelling.rent * dwelling.agency_fees_month_number)} FCFA
                    </span>
                  </div>
                )}
                <div className="border-t-2 border-gray-300 pt-4 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-gray-900">Total initial</span>
                    <span className="text-2xl font-extrabold text-theme-primary">
                      {formatPrice(
                        (dwelling.rent_advance_amount || (dwelling.rent_advance_amount_number ? dwelling.rent * dwelling.rent_advance_amount_number : 0)) +
                        (dwelling.security_deposit_amount || (dwelling.security_deposit_month_number ? dwelling.rent * dwelling.security_deposit_month_number : 0)) +
                        (dwelling.agency_fees || (dwelling.agency_fees_month_number ? dwelling.rent * dwelling.agency_fees_month_number : 0))
                      )} FCFA
                    </span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => {
                  if (!user) {
                    setShowSignUpModal(true);
                  } else {
                    // TODO: Implémenter la logique de contact
                    toast.success("Fonctionnalité de contact à venir");
                  }
                }}
                className="w-full bg-gradient-to-r from-theme-primary to-theme-accent hover:from-theme-primary/90 hover:to-theme-accent/90 text-white py-5 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Contacter le propriétaire ou démarcheur
              </Button>
              
              <div className="text-center mt-6 space-y-3">
                <p className="text-gray-500 text-sm font-medium">Nous vous mettrons en contact avec le propriétaire ou le démarcheur</p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
                  <Shield className="w-4 h-4 text-theme-primary" />
                  <span className="font-medium">Service sécurisé</span>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </div>

      {/* Modal d'inscription Customer */}
      <CustomerSignUpModal open={showSignUpModal} onOpenChange={setShowSignUpModal} />
    </div>
  );
}

