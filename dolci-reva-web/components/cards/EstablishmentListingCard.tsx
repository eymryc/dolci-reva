"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { type AvailabilityStatus } from "@/hooks/use-residences";
import { type FeatureOption } from "@/types/common";

export interface EstablishmentListingCardProps {
  image: string;
  name: string;
  city: string;
  rating?: number;
  type?: string;
  standing?: string;
  amenities?: FeatureOption[];
  description: string;
  /** Formatted price; omit for venues without a night rate */
  price?: string;
  priceLabel?: string;
  /** Override link (required for non-résidence types; defaults to /residences/:id) */
  href?: string;
  isPopular?: boolean;
  freeCancel?: boolean;
  id?: number;
  slug?: string;
  availability_status?: AvailabilityStatus;
  images?: string[];
  meta?: string;
}

const EstablishmentListingCard: React.FC<EstablishmentListingCardProps> = ({
  image,
  name,
  city,
  rating,
  type,
  standing,
  description,
  price,
  priceLabel = "La nuitée",
  href,
  isPopular = false,
  id,
  slug: providedSlug,
  availability_status,
  images = [],
  meta,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const slug =
    providedSlug ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  const linkHref = href || (id ? `/residences/${id}` : `/details/${slug}`);
  const allImages = images.length > 0 ? images : [image];
  const imageSrc = !image ? "/media/hotels/hotel1.jpg" : image;

  const renderStars = (value: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`h-3.5 w-3.5 ${
          i < Math.floor(value) ? "text-[#f08400]" : "text-gray-300"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
      </svg>
    ));
  };

  return (
    <Link href={linkHref} className="block h-full">
      <article className="group relative flex h-full cursor-pointer flex-col overflow-hidden border border-[#12100c]/08 bg-white transition-all duration-500 hover:-translate-y-1 hover:border-[#f08400]/35 hover:shadow-[0_24px_50px_-28px_rgba(240,132,0,0.55)]">
        <div className="absolute left-3 top-3 z-20 flex flex-col gap-1.5">
          {type && (
            <span className="bg-[#12100c]/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
              {type}
            </span>
          )}
          {isPopular && (
            <span className="bg-[#f08400] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
              Populaire
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

          {availability_status?.message && (
            <div
              className={`absolute right-3 top-3 z-20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm ${
                availability_status.status === "available"
                  ? "bg-emerald-500/90 text-white"
                  : "bg-[#f08400]/90 text-white"
              }`}
            >
              {availability_status.message}
            </div>
          )}

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
          <div className="mb-2.5 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="mb-1 line-clamp-1 text-lg font-semibold tracking-tight text-[#12100c] transition-colors duration-200 group-hover:text-[#f08400]">
                {name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-[#5c574f]">
                <svg
                  className="h-3.5 w-3.5 shrink-0 text-[#f08400]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="line-clamp-1">{city}</span>
              </div>
            </div>
            {rating !== undefined && (
              <div className="flex shrink-0 items-center gap-0.5 border border-[#12100c]/08 bg-[#faf8f5] px-1.5 py-1">
                {renderStars(rating)}
                <span className="ml-0.5 text-xs font-semibold text-[#12100c]">
                  {rating}
                </span>
              </div>
            )}
          </div>

          <p className="mb-5 flex-1 text-sm leading-relaxed text-[#5c574f] line-clamp-2">
            {description}
          </p>

          <div className="-mx-5 -mb-5 mt-auto flex items-center justify-between border-t border-[#12100c]/06 bg-[#12100c] px-5 py-3.5">
            <div className="flex min-w-0 flex-col">
              {price ? (
                <>
                  <span className="truncate text-lg font-bold text-white">
                    {price}
                  </span>
                  <span className="text-[11px] text-white/55">{priceLabel}</span>
                </>
              ) : (
                <>
                  <span className="text-sm font-semibold text-white">
                    {meta || standing || "Découvrir"}
                  </span>
                  {meta && standing ? (
                    <span className="text-[11px] text-white/55">{standing}</span>
                  ) : null}
                </>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-0.5">
              {price && standing ? (
                <span className="text-xs font-medium text-[#ffb347]">
                  {standing}
                </span>
              ) : null}
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

export default EstablishmentListingCard;
