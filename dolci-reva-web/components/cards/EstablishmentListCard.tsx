"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MapPin, Users } from "lucide-react";
import { type AvailabilityStatus } from "@/hooks/use-residences";
import { type FeatureOption } from "@/types/common";

export interface EstablishmentListCardProps {
  image: string;
  name: string;
  location: string;
  address?: string;
  city?: string;
  country?: string;
  type?: string;
  standing?: string;
  max_guests?: number;
  bedrooms?: number;
  bathrooms?: number;
  piece_number?: number;
  amenities?: FeatureOption[];
  badges?: string[];
  rating?: number;
  reviews?: number;
  price?: string | number;
  priceLabel?: string;
  /** Override generated title */
  title?: string;
  /** Override link (required for non-résidence types; defaults to /residences/:id) */
  href?: string;
  ctaLabel?: string;
  footerMeta?: string;
  id?: number;
  images?: string[];
  description?: string;
  availability_status?: AvailabilityStatus;
  isPopular?: boolean;
}

const EstablishmentListCard: React.FC<EstablishmentListCardProps> = ({
  image,
  name,
  location,
  address,
  type,
  max_guests,
  bedrooms,
  bathrooms,
  piece_number,
  amenities,
  badges,
  rating,
  reviews,
  price,
  priceLabel = "Par nuit",
  title,
  href,
  ctaLabel = "Découvrir →",
  footerMeta,
  id,
  images = [],
  description,
}) => {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const allImages = images.length > 0 ? images : [image];
  const imageSrc = !image ? "/media/hotels/hotel1.jpg" : image;
  const linkHref = href || (id ? `/residences/${id}` : `/residences`);

  const formatPrice = (value: string | number) => {
    const numPrice = typeof value === "string" ? parseFloat(value) : value;
    if (Number.isNaN(numPrice)) return String(value);
    return numPrice.toLocaleString("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatLabel = (value: string) =>
    value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  const generateTitle = () => {
    if (title) return title;
    if (!type) return name;
    const typeLabel = formatLabel(type);
    const city = location ? location.split(",")[0].trim() : "";
    let addressDetails = "";
    if (address) {
      const addressParts = address.split(",").map((part) => part.trim());
      const filteredParts = addressParts.filter(
        (part) => part.toLowerCase() !== city.toLowerCase() && part.length > 0
      );
      if (filteredParts.length > 0) {
        addressDetails = filteredParts.slice(0, 2).join(", ");
      }
    }
    let locationText = "";
    if (city && addressDetails) locationText = `${city}, ${addressDetails}`;
    else if (city) locationText = city;
    else if (addressDetails) locationText = addressDetails;
    else if (address) locationText = address;

    return locationText
      ? `${typeLabel} disponible à ${locationText}`
      : `${typeLabel} disponible`;
  };

  const chipLabels =
    badges ||
    amenities?.slice(0, 4).map((a) => a.name) ||
    [];

  return (
    <Link href={linkHref} className="group/card block">
      <article className="flex min-h-[260px] flex-col overflow-hidden border border-[#12100c]/08 bg-white transition-all duration-500 hover:-translate-y-1 hover:border-[#f08400]/35 hover:shadow-[0_24px_50px_-28px_rgba(240,132,0,0.55)] sm:flex-row">
        <div className="relative h-52 w-full overflow-hidden bg-[#eceae6] sm:h-auto sm:min-h-[280px] sm:w-2/5 sm:min-w-[260px]">
          <Image
            src={allImages[currentImageIndex] || imageSrc}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 group-hover/card:scale-105"
            sizes="(max-width: 640px) 100vw, 40vw"
            unoptimized={
              imageSrc.startsWith("http://") || imageSrc.startsWith("https://")
            }
          />

          {allImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {allImages.slice(0, 5).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`h-1.5 transition-all ${
                    index === currentImageIndex
                      ? "w-5 bg-white"
                      : "w-1.5 bg-white/50 hover:bg-white/80"
                  }`}
                  aria-label={`Image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="relative flex flex-1 flex-col p-5 sm:p-6">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-1.5 text-[#5c574f]">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <p className="truncate text-xs sm:text-sm">{location}</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(linkHref);
              }}
              className="flex-shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-[#f08400] hover:text-[#d87200] sm:text-sm"
            >
              {ctaLabel}
            </button>
          </div>

          <h3 className="fo-display mb-2 line-clamp-2 text-lg font-semibold leading-snug text-[#12100c] sm:text-xl">
            {generateTitle()}
          </h3>

          {description && (
            <p className="mb-3 line-clamp-2 text-sm text-[#5c574f]">
              {description}
            </p>
          )}

          {chipLabels.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {chipLabels.slice(0, 4).map((label) => (
                <span
                  key={label}
                  className="border border-[#12100c]/08 bg-[#f7f5f1] px-2 py-0.5 text-[11px] font-medium text-[#5c574f]"
                >
                  {label}
                </span>
              ))}
              {chipLabels.length > 4 && (
                <span className="border border-[#12100c]/08 px-2 py-0.5 text-[11px] text-[#5c574f]">
                  +{chipLabels.length - 4}
                </span>
              )}
            </div>
          )}

          {rating !== undefined && (
            <p className="mb-3 text-sm text-[#12100c]">
              <span className="font-semibold">{rating.toFixed(1)}</span>
              {reviews !== undefined && reviews > 0 && (
                <span className="text-[#5c574f]"> · {reviews} avis</span>
              )}
            </p>
          )}

          <div className="mt-auto flex flex-col gap-3 border-t border-[#12100c]/06 pt-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#5c574f]">
              {footerMeta ? <span>{footerMeta}</span> : null}
              {max_guests != null && (
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {max_guests} pers.
                </span>
              )}
              {piece_number != null && <span>{piece_number} pièces</span>}
              {bedrooms != null && <span>{bedrooms} ch.</span>}
              {bathrooms != null && <span>{bathrooms} sdb</span>}
            </div>
            {price !== undefined && price !== null && price !== "" ? (
              <div className="text-left sm:text-right">
                <p className="text-[11px] uppercase tracking-wide text-[#5c574f]">
                  {priceLabel}
                </p>
                <p className="text-xl font-bold text-[#12100c]">
                  {typeof price === "number" ||
                  (typeof price === "string" && !Number.isNaN(Number(price)))
                    ? `${formatPrice(price)} FCFA`
                    : price}
                </p>
              </div>
            ) : (
              <span className="text-sm font-semibold text-theme-primary">
                {ctaLabel.replace("→", "").trim()}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
};

export default EstablishmentListCard;
