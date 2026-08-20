"use client";

import Image from "next/image";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface HeroSectionProps {
  title: string | ReactNode;
  subtitle?: string | ReactNode;
  eyebrow?: string;
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
  eyebrow = "Dolci Rêva",
  backgroundImage = "/media/slide/slide3.jpg",
  backgroundImageAlt = "Hero background",
  overlayOpacity = 55,
  minHeight = "320px",
  showShimmer = false,
  showDecorativeElements = true,
  className = "",
}: HeroSectionProps) {
  return (
    <div
      className={cn(
        "relative flex items-center overflow-hidden py-14 md:py-16",
        className
      )}
      style={{ minHeight }}
    >
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
          <div
            className="absolute inset-0 bg-[#12100c]"
            style={{ opacity: overlayOpacity / 100 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12100c]/80 via-transparent to-[#12100c]/30" />
          {showDecorativeElements && (
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#f08400]/20 to-transparent" />
          )}
        </div>
      )}

      {showShimmer && (
        <div className="pointer-events-none absolute inset-0 z-10 animate-shimmer-slide bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full" />
      )}

      <div className="container relative z-20 mx-auto px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center text-white">
          {eyebrow ? (
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#ffb347]">
              {eyebrow}
            </p>
          ) : null}
          <div className="mx-auto mb-5 h-px w-14 bg-gradient-to-r from-transparent via-[#f08400] to-transparent" />
          <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mx-auto max-w-2xl text-base font-light leading-relaxed text-white/80 md:text-lg">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-px bg-gradient-to-r from-transparent via-[#f08400]/80 to-transparent" />
    </div>
  );
}
