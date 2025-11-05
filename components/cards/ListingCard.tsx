import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export interface ListingCardProps {
  image: string;
  name: string;
  city: string;
  rating: number;
  description: string;
  price: string;
  isPopular?: boolean;
  freeCancel?: boolean;
  id?: number;
  slug?: string;
}

const ListingCard: React.FC<ListingCardProps> = ({
  image,
  name,
  city,
  rating,
  description,
  price,
  isPopular = false,
  id,
  slug: providedSlug,
}) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const slug = providedSlug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  // Utiliser l'ID si disponible, sinon le slug
  const linkHref = id ? `/residences/${id}` : `/details/${slug}`;
  const imageSrc = !image ? "/media/hotels/hotel1.jpg" : image;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"/>
      </svg>
    ));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full group transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl relative border border-gray-100">
      {/* Badges */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        {isPopular && (
          <span className="bg-gradient-to-r from-theme-primary to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            ⭐ Populaire
          </span>
        )}
      </div>

      {/* Bouton Favori */}
      <button 
        className={`absolute top-4 right-4 z-20 rounded-full p-2.5 shadow-lg transition-all duration-200 ${
          isFavorited 
            ? "bg-red-500 text-white" 
            : "bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500"
        }`}
        onClick={() => setIsFavorited(!isFavorited)}
        aria-label={isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
      >
        <svg className="w-5 h-5" fill={isFavorited ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      {/* Image avec overlay gradient */}
      <div className="relative overflow-hidden">
        <Image 
          src={imageSrc} 
          alt={name} 
          width={600} 
          height={400} 
          className="w-full h-64 md:h-80 object-cover group-hover:scale-110 transition-transform duration-500" 
          unoptimized={imageSrc.startsWith('http://') || imageSrc.startsWith('https://')}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Contenu de la carte */}
      <div className="p-6 flex flex-col flex-1">
        {/* Header avec nom et rating */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-theme-primary transition-colors duration-200">
              {name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {city}
            </div>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
            {renderStars(rating)}
            <span className="text-sm font-semibold text-gray-700 ml-1">{rating}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Footer avec prix et CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-theme-primary">{price}</span>
            <span className="text-xs text-gray-500">La nuitée</span>
          </div>
          <Link 
            href={linkHref} 
            className="group/btn flex items-center gap-2 bg-gradient-to-r from-theme-primary to-orange-500 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 hover:from-orange-500 hover:to-theme-primary"
          >
            Découvrir
            <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ListingCard; 