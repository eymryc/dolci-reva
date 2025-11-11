import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Shield, Eye } from "lucide-react";

export interface HebergementListingCardProps {
  image: string;
  name: string;
  location: string;
  address?: string;
  city?: string;
  country?: string;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  living_room?: number;
  amenities?: string[];
  price: number;
  id?: number;
  images?: string[];
  type?: string;
  structureType?: string;
  structureTypeLabel?: string;
  constructionType?: string;
  constructionTypeLabel?: string;
  pieceNumber?: number;
  rentAdvanceAmountNumber?: number;
  securityDepositMonthNumber?: number;
  agencyFeesMonthNumber?: number;
  visitePrice?: number;
  isPopular?: boolean;
}

const HebergementListingCard: React.FC<HebergementListingCardProps> = ({
  image,
  name,
  location,
  city,
  country,
  price,
  id,
  images = [],
  type,
  structureType,
  structureTypeLabel,
  constructionType,
  constructionTypeLabel,
  rentAdvanceAmountNumber,
  securityDepositMonthNumber,
  agencyFeesMonthNumber,
  visitePrice,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const allImages = images.length > 0 ? images : [image];
  const imageSrc = !image ? "/media/hotels/hotel1.jpg" : image;
  const linkHref = id ? `/se-loger/${id}` : `/se-loger`;
  
  // Extraire ville et pays depuis location ou utiliser les props
  const locationParts = location ? location.split(',').map(part => part.trim()) : [];
  const displayCity = city || locationParts[0] || '';
  const displayCountry = country || locationParts[1] || '';
  
  // Construire l'affichage de la localisation
  const displayLocation = displayCity && displayCountry 
    ? `${displayCity}, ${displayCountry}`
    : displayCity || displayCountry || location;

  // Format price
  const formatPrice = (price: number) => {
    return price.toLocaleString('fr-FR', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    });
  };

  // Formater les labels
  const formatLabel = (value: string) => {
    return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Créer une phrase descriptive avec le format : "Type en location à ville, structureTypeLabel, constructionTypeLabel"
  const generateDescription = () => {
    if (!type) return null;
    
    const typeLabel = formatLabel(type);
    
    // Extraire la ville depuis location ou city (format: "Ville, Pays")
    const cityFromLocation = location ? location.split(',')[0].trim() : '';
    const cityName = city || cityFromLocation;
    
    // Construire les parties de la phrase
    const parts: string[] = [];
    
    // Partie 1: Type en location
    parts.push(`${typeLabel} à loyer`);
    
    // Partie 2: Ville
    if (cityName) {
      parts.push(`à ${cityName}`);
    }
    
    // Partie 3: Structure type
    if (structureTypeLabel || structureType) {
      parts.push(formatLabel(structureTypeLabel || structureType || ''));
    }
    
    // Partie 4: Construction type - toujours afficher si disponible
    if (constructionTypeLabel) {
      parts.push(constructionTypeLabel);
    } else if (constructionType) {
      parts.push(formatLabel(constructionType));
    }
    
    // Joindre toutes les parties avec des virgules
    return parts.join(', ');
  };

  const description = generateDescription();

  return (
    <Link href={linkHref} className="block h-full">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full group transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl relative border border-gray-100 cursor-pointer">
        {/* Badges */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          {type && (
            <span className="bg-gradient-to-r from-theme-primary/90 to-orange-500/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
              {formatLabel(type)}
            </span>
          )}
        </div>

        {/* Image avec overlay gradient */}
        <div className="relative overflow-hidden">
          <Image 
            src={allImages[currentImageIndex] || imageSrc} 
            alt={name} 
            width={600} 
            height={400} 
            className="w-full h-64 md:h-80 object-cover group-hover:scale-110 transition-transform duration-500" 
            unoptimized={imageSrc.startsWith('http://') || imageSrc.startsWith('https://')}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Pagination dots (si plusieurs images) */}
          {allImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentImageIndex 
                      ? 'bg-white w-6' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Contenu de la carte */}
        <div className="p-6 flex flex-col flex-1">
          {/* Header avec nom et localisation */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              {/* Title */}
              <h3 className="text-xl font-normal text-theme-primary line-clamp-2 transition-colors duration-200 mb-2">
                {name}
              </h3>
              {/* Phrase descriptive en bas du titre */}
              {description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2 text-justify">
                  {description}
                </p>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <MapPin className="w-4 h-4" />
                {displayLocation}
              </div>
            </div>
          </div>

          {/* Informations financières compactes */}
          {(rentAdvanceAmountNumber || securityDepositMonthNumber || agencyFeesMonthNumber) && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {rentAdvanceAmountNumber && rentAdvanceAmountNumber > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-lg border border-blue-200">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">
                    {rentAdvanceAmountNumber} mois d&apos;avance
                  </span>
                </div>
              )}
              {securityDepositMonthNumber && securityDepositMonthNumber > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 rounded-lg border border-amber-200">
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-medium text-amber-700">
                    {securityDepositMonthNumber} mois caution
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Footer avec prix et CTA - Fond orange */}
          <div className="flex items-center justify-between pt-4 px-6 pb-6 -mx-6 -mb-6 bg-theme-primary mt-auto">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">{formatPrice(price)} FCFA</span>
              <span className="text-xs text-white/80">Loyer mensuel</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              {visitePrice && visitePrice > 0 && (
                <div className="flex items-center gap-1.5 text-black text-xs font-bold">
                  <Eye className="w-3 h-3" />
                  <span>Visite: {formatPrice(visitePrice)} FCFA</span>
                </div>
              )}
              <div className="group/btn flex items-center gap-2 text-white text-sm font-semibold">
                Découvrir
                <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default HebergementListingCard;

