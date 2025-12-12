/**
 * Composant Carousel pour les images de résidence
 */

"use client";

import { useState } from 'react';
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ResidenceCarouselProps {
  images: string[];
}

export function ResidenceCarousel({ images }: ResidenceCarouselProps) {
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
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-theme-primary hover:text-white transition-all duration-300 p-1.5 rounded-full shadow-md border border-gray-200 z-10 opacity-100 hover:scale-110"
          aria-label="Photo suivante"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Miniatures - 50% */}
      <div className="w-full lg:w-1/2 grid grid-cols-3 gap-2">
        {visibleThumbnails.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${
              current === idx
                ? 'border-theme-primary shadow-lg scale-105'
                : 'border-transparent hover:border-gray-300'
            }`}
            aria-label={`Voir la photo ${idx + 1}`}
          >
            <Image
              src={img}
              alt={`Miniature ${idx + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 16vw"
            />
            {current === idx && (
              <div className="absolute inset-0 bg-theme-primary/20" />
            )}
          </button>
        ))}
        
        {hasMoreThanMax && (
          <button
            onClick={() => setCurrent(maxVisibleThumbnails - 1)}
            className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-300 hover:border-theme-primary transition-all duration-300 bg-gray-100 flex items-center justify-center group"
            aria-label="Voir plus d'images"
          >
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-600 group-hover:text-theme-primary">
                +{images.length - maxVisibleThumbnails + 1}
              </p>
              <p className="text-[10px] text-gray-500">plus</p>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}






