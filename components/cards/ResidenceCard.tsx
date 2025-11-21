import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Maximize2, Home, MapPin, ArrowRight, Users, Star } from "lucide-react";
import { type Amenity, type AvailabilityStatus } from "@/hooks/use-residences";

export interface ResidenceCardProps {
  image: string;
  name: string;
  location: string;
  address?: string;
  city?: string;
  country?: string;
  type?: string; // STUDIO, APPARTEMENT, etc.
  standing?: string; // STANDARD, PREMIUM, etc.
  max_guests?: number;
  bedrooms?: number;
  bathrooms?: number;
  piece_number?: number;
  amenities?: Amenity[];
  rating?: number;
  reviews?: number;
  price: string | number; // Prix par nuit
  id?: number;
  images?: string[];
  description?: string;
  availability_status?: AvailabilityStatus;
  isPopular?: boolean;
}

const ResidenceCard: React.FC<ResidenceCardProps> = ({
  image,
  name,
  location,
  address,
  type,
  max_guests,
  bedrooms,
  bathrooms,
  piece_number,
  amenities = [],
  rating,
  reviews,
  price,
  id,
  images = [],
  description,
  availability_status,
  isPopular = false,
}) => {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const allImages = images.length > 0 ? images : [image];
  const imageSrc = !image ? "/media/hotels/hotel1.jpg" : image;
  const linkHref = id ? `/residences/${id}` : `/residences`;
  
  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(linkHref);
  };

  // Format price
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toLocaleString('fr-FR', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    });
  };

  // Afficher les 5-6 premiers équipements
  const displayAmenities = amenities.slice(0, 6);

  // Formater les labels pour un affichage plus lisible
  const formatLabel = (value: string) => {
    return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Créer un titre avec le type et l'adresse au format "Type disponible à Adresse"
  const generateTitle = () => {
    if (!type) return name;
    
    const typeLabel = formatLabel(type);
    
    // Extraire la ville depuis location (format: "Ville, Pays")
    const city = location ? location.split(',')[0].trim() : '';
    
    // Extraire le reste de l'adresse (quartier, rue, etc.) depuis address
    let addressDetails = '';
    if (address) {
      const addressParts = address.split(',').map(part => part.trim());
      // Retirer la ville si elle est présente dans l'adresse
      const filteredParts = addressParts.filter(part => 
        part.toLowerCase() !== city.toLowerCase() && 
        part.length > 0
      );
      // Prendre les parties pertinentes (quartier, rue, etc.)
      if (filteredParts.length > 0) {
        addressDetails = filteredParts.slice(0, 2).join(', ');
      }
    }
    
    // Construire le texte de localisation : ville en premier, puis le reste
    let locationText = '';
    if (city && addressDetails) {
      locationText = `${city}, ${addressDetails}`;
    } else if (city) {
      locationText = city;
    } else if (addressDetails) {
      locationText = addressDetails;
    } else if (address) {
      locationText = address;
    }
    
    // Générer le titre au format "Type disponible à Adresse"
    if (locationText) {
      return `${typeLabel} disponible à ${locationText}`;
    }
    
    return `${typeLabel} disponible`;
  };

  const formattedTitle = generateTitle();

  // Rendre les étoiles pour le rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
          i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <Link href={linkHref} className="block group/card">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-md overflow-hidden flex flex-col sm:flex-row min-h-[280px] h-auto group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-gray-100 cursor-pointer">
        {/* Image Section (Left) - 40-50% width s */}
        <div className="relative w-full sm:w-2/5 h-48 sm:h-auto sm:min-w-[280px] sm:min-h-[280px] overflow-hidden">
          <Image 
            src={allImages[currentImageIndex] || imageSrc} 
            alt={name} 
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500" 
            unoptimized={imageSrc.startsWith('http://') || imageSrc.startsWith('https://')}
          />
          
          {/* Badges sur l'image */}
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-20 flex flex-col gap-1.5 sm:gap-2">
            {isPopular && (
              <span className="bg-gradient-to-r from-theme-primary to-orange-500 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg">
                ⭐ Populaire
              </span>
            )}
            {type && (
              <span className="bg-gradient-to-r from-theme-primary/90 to-orange-500/90 text-white text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg backdrop-blur-sm">
                {formatLabel(type)}
              </span>
            )}
          </div>

          {/* Availability Status Badge - En haut à droite */}
          {availability_status?.message && (
            <div className={`absolute top-2 sm:top-3 right-2 sm:right-3 z-20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold shadow-lg backdrop-blur-sm ${
              availability_status.status === 'available' 
                ? 'bg-green-500/90 text-white' 
                : 'bg-orange-500/90 text-white'
            }`}>
              {availability_status.message}
            </div>
          )}
          
          {/* Pagination dots (si plusieurs images) */}
          {allImages.length > 1 && (
            <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-1.5 z-10">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-200 ${
                    index === currentImageIndex 
                      ? 'bg-white w-4 sm:w-6' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Image ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Zoom icon (bottom right) */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // TODO: Ouvrir modal/galerie
            }}
            className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors duration-200 group/zoom"
            aria-label="Agrandir l'image"
          >
            <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700 group-hover/zoom:scale-110 transition-transform" />
          </button>
        </div>

        {/* Details Section (Right) - 60% width */}
        <div className="flex-1 flex flex-col relative sm:min-h-[280px]">
          {/* Header Section */}
          <div className="p-4 sm:p-6 pb-3 sm:pb-4 relative">
            {/* Location et Lien Voir les détails */}
            <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-gray-500 truncate">{location}</p>
              </div>
              <button
                onClick={handleViewDetails}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold text-theme-primary hover:text-theme-primary/80 hover:bg-theme-primary/10 rounded-lg transition-all duration-200 flex-shrink-0"
              >
                <span className="hidden sm:inline">Découvrir</span>
                <span className="sm:hidden">Voir</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Title avec type et adresse */}
            <h3 className="text-base sm:text-lg md:text-xl text-gray-900 mb-2 sm:mb-3 line-clamp-2 font-semibold">
              {formattedTitle}
            </h3>

            {/* Description */}
            {description && (
              <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">
                {description}
              </p>
            )}

            {/* Rating */}
            {rating !== undefined && (
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <div className="flex items-center gap-0.5">
                  {renderStars(rating)}
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-700">{rating.toFixed(1)}</span>
                {reviews !== undefined && reviews > 0 && (
                  <span className="text-xs sm:text-sm text-gray-500">({reviews} avis)</span>
                )}
              </div>
            )}

            {/* Amenities Names avec alternance de couleurs */}
            {displayAmenities.length > 0 && (
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 flex-wrap">
                {displayAmenities.map((amenity, index) => {
                  const amenityName = amenity.name || '';
                  // Alternance de couleurs : pair = theme-primary, impair = blue
                  const isEven = index % 2 === 0;
                  const bgColor = isEven ? 'bg-theme-primary/10' : 'bg-blue-50';
                  const textColor = isEven ? 'text-theme-primary' : 'text-blue-700';
                  const borderColor = isEven ? 'border-theme-primary/20' : 'border-blue-200';
                  
                  return (
                    <span
                      key={amenity.id || index}
                      className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-md border ${bgColor} ${textColor} ${borderColor}`}
                    >
                      {amenityName}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Rating and Price Section - Fond orange */}
          <div className="mt-auto flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 sm:gap-4 pt-3 sm:pt-4 px-4 sm:px-6 pb-4 sm:pb-6 bg-theme-primary">
            {/* Left side: Informations sur les capacités */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {max_guests != null && (
                <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  <span className="text-xs sm:text-sm font-bold text-white">{max_guests}</span>
                  <span className="text-[10px] sm:text-xs font-medium text-white/90">personne{max_guests > 1 ? 's' : ''}</span>
                </div>
              )}
              {piece_number != null && (
                <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                  <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  <span className="text-xs sm:text-sm font-bold text-white">{piece_number}</span>
                  <span className="text-[10px] sm:text-xs font-medium text-white/90">pièce{piece_number > 1 ? 's' : ''}</span>
                </div>
              )}
              {bedrooms != null && (
                <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                  <span className="text-xs sm:text-sm font-bold text-white">{bedrooms}</span>
                  <span className="text-[10px] sm:text-xs font-medium text-white/90">chambre{bedrooms > 1 ? 's' : ''}</span>
                </div>
              )}
              {bathrooms != null && (
                <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                  <span className="text-xs sm:text-sm font-bold text-white">{bathrooms}</span>
                  <span className="text-[10px] sm:text-xs font-medium text-white/90">salle{bathrooms > 1 ? 's' : ''} de bain</span>
                </div>
              )}
            </div>

            {/* Price - Toujours à droite */}
            <div className="flex flex-col items-start sm:items-end ml-0 sm:ml-auto w-full sm:w-auto">
              <p className="text-[10px] sm:text-xs text-white/80 mb-0.5 sm:mb-1">Par nuit</p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {formatPrice(price)} FCFA
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ResidenceCard;

