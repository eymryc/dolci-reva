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
      <article className="group relative flex h-full cursor-pointer flex-col overflow-hidden border border-[#12100c]/08 bg-white transition-all duration-500 hover:-translate-y-1 hover:border-[#f08400]/35 hover:shadow-[0_24px_50px_-28px_rgba(240,132,0,0.55)]">
        <div className="absolute left-3 top-3 z-20 flex flex-col gap-1.5">
          {type && (
            <span className="bg-[#12100c]/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
              {formatLabel(type)}
            </span>
          )}
        </div>

        <div className="relative overflow-hidden">
          <Image
            src={allImages[currentImageIndex] || imageSrc}
            alt={name}
            width={600}
            height={400}
            className="h-60 w-full object-cover transition-transform duration-700 group-hover:scale-105 md:h-72"
            unoptimized={
              imageSrc.startsWith("http://") || imageSrc.startsWith("https://")
            }
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />

          {allImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`h-1 rounded-none transition-all duration-200 ${
                    index === currentImageIndex
                      ? "w-5 bg-white"
                      : "w-1.5 bg-white/45 hover:bg-white/75"
                  }`}
                  aria-label={`Image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="mb-2.5">
            <h3 className="mb-1.5 line-clamp-2 text-lg font-semibold tracking-tight text-[#12100c] transition-colors duration-200 group-hover:text-[#f08400]">
              {name}
            </h3>
            {description && (
              <p className="mb-2 line-clamp-2 text-sm leading-relaxed text-[#5c574f]">
                {description}
              </p>
            )}
            <div className="flex items-center gap-1.5 text-xs text-[#5c574f]">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#f08400]" />
              <span className="line-clamp-1">{displayLocation}</span>
            </div>
          </div>

          {(rentAdvanceAmountNumber ||
            securityDepositMonthNumber ||
            agencyFeesMonthNumber) && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {rentAdvanceAmountNumber && rentAdvanceAmountNumber > 0 && (
                <div className="flex items-center gap-1.5 border border-[#12100c]/08 bg-[#faf8f5] px-2 py-1">
                  <Calendar className="h-3.5 w-3.5 text-[#f08400]" />
                  <span className="text-[11px] font-medium text-[#12100c]">
                    {rentAdvanceAmountNumber} mois d&apos;avance
                  </span>
                </div>
              )}
              {securityDepositMonthNumber &&
                securityDepositMonthNumber > 0 && (
                  <div className="flex items-center gap-1.5 border border-[#12100c]/08 bg-[#faf8f5] px-2 py-1">
                    <Shield className="h-3.5 w-3.5 text-[#f08400]" />
                    <span className="text-[11px] font-medium text-[#12100c]">
                      {securityDepositMonthNumber} mois caution
                    </span>
                  </div>
                )}
            </div>
          )}

          <div className="-mx-5 -mb-5 mt-auto flex items-center justify-between border-t border-[#12100c]/06 bg-[#12100c] px-5 py-3.5">
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-lg font-bold text-white">
                {formatPrice(price)} FCFA
              </span>
              <span className="text-[11px] text-white/55">Loyer mensuel</span>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-0.5">
              {visitePrice && visitePrice > 0 && (
                <div className="flex items-center gap-1 text-[11px] font-medium text-[#ffb347]">
                  <Eye className="h-3 w-3" />
                  <span>Visite {formatPrice(visitePrice)}</span>
                </div>
              )}
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#ffb347] transition-transform duration-300 group-hover:translate-x-0.5">
                Voir
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default HebergementListingCard;

