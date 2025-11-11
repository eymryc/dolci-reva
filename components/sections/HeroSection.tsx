"use client";

import Image from "next/image";
import { ReactNode } from "react";

export interface HeroSectionProps {
  title: string | ReactNode;
  subtitle?: string | ReactNode;
  backgroundImage?: string;
  backgroundImageAlt?: string;
  overlayOpacity?: number; // 0-100
  minHeight?: string;
  showShimmer?: boolean;
  showDecorativeElements?: boolean;
  className?: string;
}

export default function HeroSection({
  title,
  subtitle,
  backgroundImage = "/media/slide/slide3.jpg",
  backgroundImageAlt = "Hero background",
  overlayOpacity = 40,
  minHeight = "350px",
  showShimmer = true,
  showDecorativeElements = true,
  className = "",
}: HeroSectionProps) {
  return (
    <div 
      className={`relative py-12 md:py-16 overflow-hidden flex items-center ${className}`}
      style={{ minHeight: minHeight }}
    >
      {/* Image de fond */}
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImage}
            alt={backgroundImageAlt}
            fill
            className="object-cover"
            priority
            unoptimized
          />
          {/* Overlay sombre pour améliorer la lisibilité du texte */}
          <div 
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity / 100 }}
          ></div>
        </div>
      )}

      {/* Effet de brillance animé */}
      {showShimmer && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer-slide pointer-events-none z-10"></div>
      )}
      
      {/* Motifs décoratifs */}
      {showDecorativeElements && (
        <div className="absolute top-0 left-0 w-full h-full opacity-10 z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
      )}

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-20">
        <div className="text-center text-white">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-base md:text-lg mb-6 max-w-3xl mx-auto text-white/95 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

