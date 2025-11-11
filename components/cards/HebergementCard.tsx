import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Wifi, Car, UtensilsCrossed, Wind, Tv, WashingMachine, Maximize2, Home, MapPin, ArrowRight, Calendar, Shield, Building2, Eye } from "lucide-react";

export interface HebergementCardProps {
  image: string;
  name: string;
  location: string;
  address?: string; // Adresse complète
  area?: number | string; // m²
  guests?: number;
  bedrooms?: number; // Alias pour rooms (compatibilité)
  rooms?: number; // Nombre de chambres
  bathrooms?: number; // Nombre de salles de bain
  living_room?: number; // Nombre de salons
  amenities?: string[]; // Liste des noms d'équipements
  rating?: number;
  reviews?: number;
  price: number; // Prix en nombre
  id?: number;
  images?: string[]; // Pour le carousel
  type?: string; // Type d'hébergement
  structureType?: string; // Type de structure (code)
  structureTypeLabel?: string; // Label du type de structure
  constructionType?: string; // Type de construction (code)
  constructionTypeLabel?: string; // Label du type de construction
  pieceNumber?: number; // Nombre de pièces
  rentAdvanceAmountNumber?: number; // Nombre de loyers d'avance
  securityDepositMonthNumber?: number; // Nombre de mois de caution
  agencyFeesMonthNumber?: number; // Nombre de mois de frais d'agence
  visitePrice?: number; // Prix de la visite
}

// Mapping des équipements vers leurs icônes
const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Wi-Fi': Wifi,
  'Wifi': Wifi,
  'WiFi': Wifi,
  'Parking': Car,
  'Cuisine': UtensilsCrossed,
  'Kitchen': UtensilsCrossed,
  'Climatisation': Wind,
  'Air Conditioning': Wind,
  'TV': Tv,
  'Télévision': Tv,
  'Lave-linge': WashingMachine,
  'Washing Machine': WashingMachine,
};

const HebergementCard: React.FC<HebergementCardProps> = ({
  image,
  name,
  location,
  address,
  bedrooms,
  rooms,
  bathrooms,
  living_room,
  amenities = [],
  price,
  id,
  images = [],
  type,
  structureType,
  structureTypeLabel,
  constructionType,
  constructionTypeLabel,
  pieceNumber,
  rentAdvanceAmountNumber,
  securityDepositMonthNumber,
  agencyFeesMonthNumber,
  visitePrice,
}) => {
  // Utiliser rooms si disponible, sinon bedrooms (pour compatibilité)
  const displayRooms = rooms ?? bedrooms;
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const allImages = images.length > 0 ? images : [image];
  const imageSrc = !image ? "/media/hotels/hotel1.jpg" : image;
  const linkHref = id ? `/se-loger/${id}` : `/se-loger`;
  
  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(linkHref);
  };

  // Format price
  const formatPrice = (price: number) => {
    return price.toLocaleString('fr-FR', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    });
  };

  // Obtenir les icônes pour les équipements
  const getAmenityIcon = (amenityName: string) => {
    const normalizedName = amenityName.toLowerCase();
    for (const [key, Icon] of Object.entries(amenityIcons)) {
      if (normalizedName.includes(key.toLowerCase())) {
        return Icon;
      }
    }
    return null;
  };

  // Afficher les 5-6 premiers équipements avec icônes
  const displayAmenities = amenities.slice(0, 6);

  // Formater les labels pour un affichage plus lisible
  const formatLabel = (value: string) => {
    return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Créer un titre avec le type et l'adresse
  const generateTitle = () => {
    if (!type) return null;
    
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
    }
    
    // Générer le titre
    if (locationText) {
      return `${typeLabel} à ${locationText}`;
    }
    
    return typeLabel;
  };

  const title = generateTitle();

  return (
    <Link href={linkHref} className="block group/card">
      <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-row min-h-[280px] h-auto group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-gray-100 cursor-pointer">
      {/* Image Section (Left) - 40-50% width */}
      <div className="relative w-2/5 min-w-[280px] min-h-[280px] overflow-hidden">
        <Image 
          src={allImages[currentImageIndex] || imageSrc} 
          alt={name} 
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500" 
          unoptimized={imageSrc.startsWith('http://') || imageSrc.startsWith('https://')}
        />
        
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

        {/* Zoom icon (bottom right) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // TODO: Ouvrir modal/galerie
          }}
          className="absolute bottom-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors duration-200 group/zoom"
          aria-label="Agrandir l'image"
        >
          <Maximize2 className="w-4 h-4 text-gray-700 group-hover/zoom:scale-110 transition-transform" />
        </button>
      </div>

      {/* Details Section (Right) - 60% width */}
      <div className="flex-1 flex flex-col relative min-h-[280px]">
        {/* Header Section */}
        <div className="p-6 pb-4 relative">
          {/* Location et Lien Voir les détails */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <p className="text-sm text-gray-500">{location}</p>
            </div>
            <button
              onClick={handleViewDetails}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-theme-primary hover:text-theme-primary/80 hover:bg-theme-primary/10 rounded-lg transition-all duration-200 flex-shrink-0"
            >
              Découvrir
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Title avec type et adresse */}
          {title && (
            <h3 className="text-xl text-gray-900 mb-4 line-clamp-2">
              {title}
            </h3>
          )}

          {/* Badges Type, Structure, Construction */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {type && (
              <span className="px-2.5 py-1 bg-theme-primary/10 text-theme-primary rounded-md font-semibold border border-theme-primary/20 text-xs">
                {formatLabel(type)}
              </span>
            )}
            {(structureTypeLabel || structureType) && (
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md font-medium border border-blue-200 text-xs">
                {structureTypeLabel || formatLabel(structureType || '')}
              </span>
            )}
            {(constructionTypeLabel || constructionType) && (
              <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md font-medium border border-purple-200 text-xs">
                {constructionTypeLabel || formatLabel(constructionType || '')}
              </span>
            )}
          </div>

          {/* Amenities Icons */}
          {displayAmenities.length > 0 && (
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              {displayAmenities.map((amenity, index) => {
                const Icon = getAmenityIcon(amenity);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-center w-6 h-6 text-gray-500"
                    title={amenity}
                  >
                    {Icon ? (
                      <Icon className="w-5 h-5" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gray-400" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Informations financières */}
          {(rentAdvanceAmountNumber || securityDepositMonthNumber || agencyFeesMonthNumber || visitePrice) && (
            <div className="flex flex-wrap items-center gap-2.5">
              {rentAdvanceAmountNumber && rentAdvanceAmountNumber > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg border border-blue-200/60 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-500/10">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-blue-900 leading-tight">
                      {rentAdvanceAmountNumber} mois
                    </span>
                    <span className="text-[10px] text-blue-600/80 leading-tight">
                      d&apos;avance
                    </span>
                  </div>
                </div>
              )}
              {securityDepositMonthNumber && securityDepositMonthNumber > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-lg border border-amber-200/60 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/10">
                    <Shield className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-amber-900 leading-tight">
                      {securityDepositMonthNumber} mois
                    </span>
                    <span className="text-[10px] text-amber-600/80 leading-tight">
                      de caution
                    </span>
                  </div>
                </div>
              )}
              {agencyFeesMonthNumber && agencyFeesMonthNumber > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-lg border border-purple-200/60 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-purple-500/10">
                    <Building2 className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-purple-900 leading-tight">
                      {agencyFeesMonthNumber} mois
                    </span>
                    <span className="text-[10px] text-purple-600/80 leading-tight">
                      frais d&apos;agence
                    </span>
                  </div>
                </div>
              )}
              {visitePrice && visitePrice > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-50 to-green-100/50 rounded-lg border border-green-200/60 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-500/10">
                    <Eye className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-green-900 leading-tight">
                      Visite
                    </span>
                    <span className="text-[10px] text-green-600/80 leading-tight font-semibold">
                      {formatPrice(visitePrice)} FCFA
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rating and Price Section - Fond orange */}
        <div className="mt-auto flex items-end justify-between gap-4 pt-4 px-6 pb-6 bg-theme-primary">
          {/* Left side: Informations sur les pièces */}
          <div className="flex items-center gap-2 flex-wrap">
            {pieceNumber != null && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                <Home className="w-4 h-4 text-white" />
                <span className="text-sm font-bold text-white">{pieceNumber}</span>
                <span className="text-xs font-medium text-white/90">pièce{pieceNumber > 1 ? 's' : ''}</span>
              </div>
            )}
            {displayRooms != null && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                <span className="text-sm font-bold text-white">{displayRooms}</span>
                <span className="text-xs font-medium text-white/90">chambre{displayRooms > 1 ? 's' : ''}</span>
              </div>
            )}
            {bathrooms != null && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                <span className="text-sm font-bold text-white">{bathrooms}</span>
                <span className="text-xs font-medium text-white/90">salle{bathrooms > 1 ? 's' : ''} de bain</span>
              </div>
            )}
            {living_room != null && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                <span className="text-sm font-bold text-white">{living_room}</span>
                <span className="text-xs font-medium text-white/90">salon{living_room > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* Price - Toujours à droite */}
          <div className="flex flex-col items-end ml-auto">
            <p className="text-xs text-white/80 mb-1">Loyer mensuel</p>
            <p className="text-2xl font-bold text-white">
              {formatPrice(price)} FCFA
            </p>
          </div>
        </div>
      </div>
    </div>
    </Link>
  );
};

export default HebergementCard;

