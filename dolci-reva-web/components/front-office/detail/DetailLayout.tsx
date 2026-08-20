"use client";

import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ResidenceCarousel } from "@/components/front-office/residences/detail/ResidenceCarousel";

/** Same gallery as residences — works for any establishment images. */
export function EstablishmentCarousel({ images }: { images: string[] }) {
  return <ResidenceCarousel images={images} />;
}

export function DetailPageLayout({
  gallery,
  header,
  children,
  sidebar,
}: {
  gallery: ReactNode;
  header: ReactNode;
  children: ReactNode;
  sidebar: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="mb-6">{gallery}</section>
        <section className="mb-6">{header}</section>
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="min-w-0 flex-1 space-y-6">{children}</div>
          <aside className="w-full lg:w-96">{sidebar}</aside>
        </div>
      </div>
    </div>
  );
}

export function DetailSection({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "border border-gray-100 bg-white p-4 shadow-md lg:p-6",
        className
      )}
    >
      {title ? (
        <h2 className="mb-4 border-b border-gray-100 pb-3 text-xl font-bold text-gray-900 lg:text-2xl">
          {title}
        </h2>
      ) : null}
      {children}
    </Card>
  );
}

export function DetailBookingCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "sticky top-24 rounded-none border-0 bg-gradient-to-br from-white to-gray-50/50 p-6 shadow-2xl backdrop-blur-sm lg:p-8",
        className
      )}
    >
      {children}
    </Card>
  );
}

export function DetailInfoTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 border border-gray-100 bg-[#faf8f5] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-white text-[#f08400]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </p>
        <p className="truncate font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export function collectEstablishmentImages(entity: {
  main_image_url?: string | null;
  gallery_images?: Array<{
    url?: string;
    medium_url?: string;
    large_url?: string;
    thumb_url?: string;
  } | string> | null;
}): string[] {
  const fromGallery =
    entity.gallery_images
      ?.map((img) =>
        typeof img === "string"
          ? img
          : img.url || img.medium_url || img.large_url || img.thumb_url || ""
      )
      .filter(Boolean) ?? [];

  if (fromGallery.length > 0) return fromGallery;
  if (entity.main_image_url) return [entity.main_image_url];
  return [];
}
