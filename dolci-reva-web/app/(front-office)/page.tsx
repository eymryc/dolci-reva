"use client";

import TrueFocus from "@/components/animations/textanimate/TextAnimations/TrueFocus/TrueFocus";
import SectionHeader from "@/components/ui/SectionHeader";
import AnimatedButton from "@/components/ui/AnimatedButton";
import EstablishmentListingCard from "@/components/cards/EstablishmentListingCard";
import HebergementListingCard from "@/components/cards/HebergementListingCard";
import React, { useMemo } from "react";
import { usePublicResidences } from "@/hooks/use-residences";
import { usePublicDwellings } from "@/hooks/use-dwellings";
import { usePublicHotels } from "@/hooks/use-hotels";
import { usePublicRestaurants } from "@/hooks/use-restaurants";
import { usePublicBars } from "@/hooks/use-bars";
import { usePublicLounges } from "@/hooks/use-lounges";
import { usePublicNightClubs } from "@/hooks/use-nightlife-venues";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Building2,
  Hotel,
  UtensilsCrossed,
  Wine,
  Sofa,
  Music2,
  KeyRound,
  ArrowRight,
} from "lucide-react";

const COVER_IMAGE = "/media/slide/slide3.jpg";

const CATEGORIES = [
  {
    label: "Résidences",
    href: "/residences",
    description: "Le week-end, sans stress",
    icon: Building2,
  },
  {
    label: "Hôtels",
    href: "/hotels",
    description: "Dormir aux bonnes adresses",
    icon: Hotel,
  },
  {
    label: "Restaurants",
    href: "/restaurants",
    description: "La table qui se mérite",
    icon: UtensilsCrossed,
  },
  {
    label: "Bars",
    href: "/bars",
    description: "Le premier verre compte",
    icon: Wine,
  },
  {
    label: "Lounges",
    href: "/lounges",
    description: "Rooftop & slow vibe",
    icon: Sofa,
  },
  {
    label: "Night-Clubs",
    href: "/night-clubs",
    description: "La nuit qui frappe",
    icon: Music2,
  },
  {
    label: "Se loger",
    href: "/se-loger",
    description: "S'installer pour de vrai",
    icon: KeyRound,
  },
] as const;

function formatPrice(price: string | number) {
  const n = typeof price === "string" ? parseFloat(price) : price;
  return n.toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function SectionSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="animate-pulse overflow-hidden border border-[#12100c]/08 bg-white"
        >
          <div className="h-60 bg-[#eceae6] md:h-72" />
          <div className="space-y-3 p-5">
            <div className="h-4 w-3/4 bg-[#eceae6]" />
            <div className="h-3 w-1/2 bg-[#eceae6]" />
            <div className="h-3 w-full bg-[#eceae6]" />
          </div>
          <div className="h-14 bg-[#12100c]/90" />
        </div>
      ))}
    </div>
  );
}

function SectionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 border border-[#f08400]/30 bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#f08400] transition-all duration-300 hover:border-[#f08400] hover:bg-[#f08400] hover:text-white"
    >
      {label}
      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

function collectImages(item: {
  main_image_url?: string | null;
  main_image_thumb_url?: string | null;
  all_images?: { url: string }[] | null;
  gallery_images?: ({ url: string } | string)[] | null;
}): string[] {
  const all =
    item.all_images?.map((img) => img.url) ||
    (item.main_image_url ? [item.main_image_url] : []);
  const gallery =
    item.gallery_images?.map((img) =>
      typeof img === "string" ? img : img.url
    ) || [];
  return [...all, ...gallery].filter(Boolean) as string[];
}

export default function Home() {
  const router = useRouter();
  const { data: residences, isLoading: loadingResidences } =
    usePublicResidences();
  const { data: dwellings, isLoading: loadingDwellings } = usePublicDwellings();
  const { data: hotels, isLoading: loadingHotels } = usePublicHotels();
  const { data: restaurants, isLoading: loadingRestaurants } =
    usePublicRestaurants();
  const { data: bars, isLoading: loadingBars } = usePublicBars();
  const { data: lounges, isLoading: loadingLounges } = usePublicLounges();
  const { data: nightClubs, isLoading: loadingNightClubs } =
    usePublicNightClubs();

  const loadingNightlife = loadingBars || loadingLounges || loadingNightClubs;

  const nightSpots = useMemo(() => {
    type Spot = {
      id: number;
      name: string;
      city: string;
      country: string;
      description?: string | null;
      image: string;
      images: string[];
      href: string;
      kind: string;
      meta: string;
    };

    const pools: Spot[][] = [
      (bars || []).map((b) => ({
        id: b.id,
        name: b.name,
        city: b.city,
        country: b.country,
        description: b.description,
        image:
          b.main_image_url ||
          b.main_image_thumb_url ||
          "/media/hotels/hotel1.jpg",
        images: collectImages(b),
        href: `/bars/${b.id}`,
        kind: "Bar",
        meta: "Réserver",
      })),
      (lounges || []).map((l) => ({
        id: l.id,
        name: l.name,
        city: l.city,
        country: l.country,
        description: l.description,
        image:
          l.main_image_url ||
          l.main_image_thumb_url ||
          "/media/hotels/hotel1.jpg",
        images: collectImages(l),
        href: `/lounges/${l.id}`,
        kind: "Lounge",
        meta: "Réserver",
      })),
      (nightClubs || []).map((n) => ({
        id: n.id,
        name: n.name,
        city: n.city,
        country: n.country,
        description: n.description,
        image:
          n.main_image_url ||
          n.main_image_thumb_url ||
          "/media/hotels/hotel1.jpg",
        images: collectImages(n),
        href: `/night-clubs/${n.id}`,
        kind: "Night-Club",
        meta: "Réserver",
      })),
    ];

    // Round-robin : le grille reste rich même avec peu d'items par type
    const mixed: Spot[] = [];
    let i = 0;
    while (mixed.length < 4) {
      let added = false;
      for (const pool of pools) {
        if (pool[i]) {
          mixed.push(pool[i]);
          added = true;
          if (mixed.length >= 4) break;
        }
      }
      if (!added) break;
      i += 1;
    }
    return mixed;
  }, [bars, lounges, nightClubs]);

  return (
    <div className="bg-[#faf8f5]">
      {/* Hero cover + TrueFocus */}
      <section className="relative w-full">
        <div className="relative flex min-h-[68svh] w-full items-center justify-center overflow-hidden sm:min-h-[72svh]">
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={COVER_IMAGE}
              alt="Dolci Rêva — Kiffer l'instant"
              fill
              style={{ objectFit: "cover", objectPosition: "center 28%" }}
              sizes="100vw"
              priority
            />
          </motion.div>

          {/* Légère vignette — image visible, texte ancré à gauche */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

          <div className="relative z-10 container mx-auto flex w-full items-center px-4 py-14 md:px-6 sm:py-16 lg:px-8">
            <motion.div
              className="w-full max-w-xl text-left lg:max-w-2xl"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } },
              }}
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
                }}
                className="mb-4 flex flex-col items-start gap-2.5"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.42em] text-[#ffb347] drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)] sm:text-xs">
                  Dolci Rêva
                </span>
                <span className="h-px w-14 bg-gradient-to-r from-[#f08400] to-transparent" />
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 22 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.7 } },
                }}
                className="mb-4 md:mb-5 [filter:drop-shadow(0_3px_16px_rgba(0,0,0,0.7))]"
              >
                <TrueFocus
                  sentence="Ce soir, ça démarre."
                  manualMode={false}
                  blurAmount={3}
                  borderColor="#f08400"
                  glowColor="rgba(240, 132, 0, 0.75)"
                  animationDuration={0.55}
                  pauseBetweenAnimations={0.9}
                  textColor="#ffffff"
                  className="!justify-start"
                  wordClassName="!text-3xl sm:!text-4xl md:!text-5xl lg:!text-6xl !font-bold !tracking-tight !text-left"
                />
              </motion.div>

              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 18 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.65 } },
                }}
                className="mb-3 max-w-lg text-lg font-semibold leading-snug text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.8)] sm:text-xl md:text-2xl"
              >
                Abidjan t&apos;attend.{" "}
                <span className="text-[#ffb347]">Toi aussi.</span>
              </motion.p>

              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 18 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.65 } },
                }}
                className="mb-8 max-w-md text-sm font-medium leading-relaxed text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] sm:text-base md:mb-9"
              >
                Table qui claque. Rooftop qui brûle. Suite qui calme.
                Une seule app pour trouver — et réserver — le moment.
              </motion.p>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.65 } },
                }}
                className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
              >
                <AnimatedButton
                  size="lg"
                  variant="primary"
                  className="h-12 w-full min-w-[220px] px-8 py-0 text-sm font-semibold shadow-[0_12px_40px_-8px_rgba(240,132,0,0.65)] sm:w-[220px]"
                  onClick={() => router.push("/residences")}
                >
                  <span className="flex items-center justify-center gap-2">
                    Je réserve mon spot
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </AnimatedButton>
                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("categories")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="inline-flex h-12 w-full min-w-[220px] items-center justify-center border border-white/50 bg-white/10 px-8 text-sm font-semibold tracking-wide text-white backdrop-blur-md transition-all duration-300 hover:border-white hover:bg-white hover:text-[#12100c] sm:w-[220px]"
                >
                  Explorer la night
                </button>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 sm:bottom-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("categories")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="group flex flex-col items-center gap-2.5"
            >
              <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/55 transition-colors group-hover:text-[#ffb347]">
                Scroll
              </span>
              <div className="relative flex h-11 w-6 items-start justify-center overflow-hidden border border-white/40 pt-2 transition-colors group-hover:border-[#f08400]">
                <span className="block h-2 w-1 animate-bounce bg-[#f08400]" />
              </div>
            </button>
          </motion.div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#f08400]/80 to-transparent" />
        </div>
      </section>

      {/* 2. Catégories */}
      <section id="categories" className="relative overflow-hidden border-b border-[#12100c]/06 bg-[#faf8f5] py-16 sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#12100c06_1px,transparent_1px),linear-gradient(to_bottom,#12100c06_1px,transparent_1px)] bg-[size:28px_28px]"
        />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Explorer"
            title="Où kiffer ce soir ?"
            subtitle="Un lieu. Un moment. Zéro prise de tête."
          />
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7 lg:gap-3">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className="group relative flex flex-col overflow-hidden border border-[#12100c]/08 bg-white p-4 transition-all duration-400 hover:-translate-y-1 hover:border-[#f08400]/45 hover:shadow-[0_22px_44px_-28px_rgba(240,132,0,0.55)] sm:p-5"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#f08400]/10 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-[#f08400] to-[#ffb347] transition-transform duration-500 group-hover:scale-x-100"
                  />

                  <span className="relative mb-4 flex h-11 w-11 items-center justify-center border border-[#f08400]/25 bg-[#fff4e8] text-[#f08400] transition-all duration-300 group-hover:border-[#f08400] group-hover:bg-[#f08400] group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="relative text-sm font-semibold tracking-tight text-[#12100c] transition-colors group-hover:text-[#c96d00]">
                    {cat.label}
                  </span>
                  <span className="relative mt-1 text-[11px] leading-snug text-[#5c574f] sm:text-xs">
                    {cat.description}
                  </span>
                  <span className="relative mt-3 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#f08400] opacity-0 transition-all duration-300 group-hover:opacity-100">
                    Explorer
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Résidences à la une */}
      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              eyebrow="Séjours"
              title="Des adresses pour vraiment déconnecter"
              subtitle="Résidences sélectionnées — tu poses tes valises, on s'occupe du reste."
            />
            <SectionLink href="/residences" label="Voir les résidences" />
          </div>

          {loadingResidences ? (
            <SectionSkeleton />
          ) : residences && residences.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {residences.slice(0, 4).map((residence) => {
                const allImages =
                  residence.all_images?.map((img) => img.url) ||
                  (residence.main_image_url ? [residence.main_image_url] : []);
                const galleryImages =
                  residence.gallery_images?.map((img) => img.url) || [];
                const images = [...allImages, ...galleryImages].filter(Boolean);

                return (
                  <EstablishmentListingCard
                    key={residence.id}
                    id={residence.id}
                    image={
                      residence.main_image_url ||
                      residence.main_image_thumb_url ||
                      "/media/hotels/hotel1.jpg"
                    }
                    images={images}
                    name={residence.name}
                    city={`${residence.city}, ${residence.country}`}
                    description={
                      residence.description || "Aucune description disponible."
                    }
                    price={`${formatPrice(residence.price)} FCFA`}
                    type={residence.type}
                    standing={residence.standing}
                    availability_status={residence.availability_status}
                    isPopular={false}
                  />
                );
              })}
            </div>
          ) : (
            <p className="py-10 text-center text-[#5c574f]">
              Aucune résidence disponible pour le moment.
            </p>
          )}
        </div>
      </section>

      {/* 4. Hôtels */}
      <section className="relative overflow-hidden border-t border-[#12100c]/06 bg-[#faf8f5] py-16 sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-[#f08400]/10 blur-3xl"
        />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              eyebrow="Dormir"
              title="Hôtels qui donnent envie d’y rester"
              subtitle="Chambres, suites, service — le confort sans les surprises."
            />
            <SectionLink href="/hotels" label="Explorer les hôtels" />
          </div>

          {loadingHotels ? (
            <SectionSkeleton />
          ) : hotels && hotels.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {hotels.slice(0, 4).map((hotel) => {
                const allImages =
                  hotel.all_images?.map((img) => img.url) ||
                  (hotel.main_image_url ? [hotel.main_image_url] : []);
                const galleryImages =
                  hotel.gallery_images?.map((img) =>
                    typeof img === "string" ? img : img.url
                  ) || [];
                const images = [...allImages, ...galleryImages].filter(
                  Boolean
                ) as string[];

                return (
                  <EstablishmentListingCard
                    key={hotel.id}
                    id={hotel.id}
                    href={`/hotels/${hotel.id}`}
                    image={
                      hotel.main_image_url ||
                      hotel.main_image_thumb_url ||
                      "/media/hotels/hotel1.jpg"
                    }
                    images={images}
                    name={hotel.name}
                    city={`${hotel.city}, ${hotel.country}`}
                    description={
                      hotel.description || "Aucune description disponible."
                    }
                    type={
                      hotel.star_rating
                        ? `${hotel.star_rating}★`
                        : "Hôtel"
                    }
                    meta={
                      hotel.rooms_count != null
                        ? `${hotel.rooms_count} chambre${
                            hotel.rooms_count > 1 ? "s" : ""
                          }`
                        : "Voir les chambres"
                    }
                  />
                );
              })}
            </div>
          ) : (
            <p className="py-10 text-center text-[#5c574f]">
              Aucun hôtel disponible pour le moment.
            </p>
          )}
        </div>
      </section>

      {/* 5. Restaurants */}
      <section className="border-t border-[#12100c]/06 bg-white py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              eyebrow="À table"
              title="Réserve ta table. Pas le hasard."
              subtitle="Les restos qu’on se recommande vraiment — ambiance, assiettes, le buzz."
            />
            <SectionLink href="/restaurants" label="Toutes les tables" />
          </div>

          {loadingRestaurants ? (
            <SectionSkeleton />
          ) : restaurants && restaurants.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {restaurants.slice(0, 4).map((restaurant) => {
                const images = collectImages(restaurant);
                return (
                  <EstablishmentListingCard
                    key={restaurant.id}
                    id={restaurant.id}
                    href={`/restaurants/${restaurant.id}`}
                    image={
                      restaurant.main_image_url ||
                      restaurant.main_image_thumb_url ||
                      "/media/hotels/hotel1.jpg"
                    }
                    images={images}
                    name={restaurant.name}
                    city={`${restaurant.city}, ${restaurant.country}`}
                    description={
                      restaurant.description ||
                      "Une table à ne pas laisser au hasard."
                    }
                    type="Restaurant"
                    meta="Réserver maintenant"
                  />
                );
              })}
            </div>
          ) : (
            <p className="py-10 text-center text-[#5c574f]">
              Les prochaines tables arrivent bientôt.
            </p>
          )}
        </div>
      </section>

      {/* 6. Nightlife regroupé : bars + lounges + night-clubs */}
      <section className="relative overflow-hidden border-t border-[#12100c]/06 bg-[#12100c] py-16 sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(240,132,0,0.2),transparent_55%)]"
        />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              tone="dark"
              eyebrow="La nuit"
              title="Ce soir, on sort."
              subtitle="Bars, lounges, clubs — le prochain moment mémorable est déjà sur Dolci Rêva."
            />
            <SectionLink href="/bars" label="Voir où sortir" />
          </div>

          <div className="mb-10 flex flex-wrap gap-2">
            {[
              { href: "/bars", label: "Bars" },
              { href: "/lounges", label: "Lounges" },
              { href: "/night-clubs", label: "Night-clubs" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="border border-white/20 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80 transition-colors hover:border-[#f08400] hover:bg-[#f08400] hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {loadingNightlife ? (
            <SectionSkeleton />
          ) : nightSpots.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {nightSpots.map((spot) => (
                <EstablishmentListingCard
                  key={`${spot.kind}-${spot.id}`}
                  id={spot.id}
                  href={spot.href}
                  image={spot.image}
                  images={spot.images}
                  name={spot.name}
                  city={`${spot.city}, ${spot.country}`}
                  description={
                    spot.description || "Une adresse pour allumer la soirée."
                  }
                  type={spot.kind}
                  meta={spot.meta}
                />
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-white/55">
              La scène se remplit — reviens vite pour les prochaines adresses.
            </p>
          )}
        </div>
      </section>

      {/* 7. Se loger */}
      <section className="border-t border-[#12100c]/06 bg-[#faf8f5] py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              eyebrow="S'installer"
              title="Plus qu’une nuit : un vrai chez-toi"
              subtitle="Locations longue durée — pour ceux qui restent, pas ceux qui passent."
            />
            <SectionLink href="/se-loger" label="Trouver un logement" />
          </div>

          {loadingDwellings ? (
            <SectionSkeleton />
          ) : dwellings && dwellings.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {dwellings.slice(0, 4).map((dwelling) => {
                const allImages =
                  dwelling.all_images?.map((img) => img.url) ||
                  (dwelling.main_image_url ? [dwelling.main_image_url] : []);
                const galleryImages =
                  dwelling.gallery_images?.map((img) =>
                    typeof img === "string" ? img : img.url
                  ) || [];
                const images = [...allImages, ...galleryImages].filter(Boolean);

                return (
                  <HebergementListingCard
                    key={dwelling.id}
                    id={dwelling.id}
                    image={
                      dwelling.main_image_url ||
                      dwelling.main_image_thumb_url ||
                      "/media/hotels/hotel1.jpg"
                    }
                    images={images}
                    name={`${dwelling.type || "Hébergement"} à ${dwelling.city}`}
                    location={`${dwelling.city}, ${dwelling.country}`}
                    city={dwelling.city}
                    country={dwelling.country}
                    address={dwelling.address}
                    type={dwelling.type}
                    structureType={dwelling.structure_type}
                    structureTypeLabel={dwelling.structure_type_label}
                    constructionType={dwelling.construction_type}
                    constructionTypeLabel={dwelling.construction_type_label}
                    rooms={dwelling.rooms ?? undefined}
                    bedrooms={dwelling.rooms ?? undefined}
                    bathrooms={dwelling.bathrooms ?? undefined}
                    living_room={dwelling.living_room ?? undefined}
                    pieceNumber={dwelling.piece_number ?? undefined}
                    amenities={[]}
                    price={dwelling.rent}
                    rentAdvanceAmountNumber={dwelling.rent_advance_amount_number}
                    securityDepositMonthNumber={
                      dwelling.security_deposit_month_number
                    }
                    agencyFeesMonthNumber={dwelling.agency_fees_month_number}
                    visitePrice={dwelling.visite_price}
                    isPopular={false}
                  />
                );
              })}
            </div>
          ) : (
            <p className="py-10 text-center text-[#5c574f]">
              Aucun hébergement disponible pour le moment.
            </p>
          )}
        </div>
      </section>

      {/* 8. CTA hôte */}
      <section className="relative overflow-hidden bg-[#12100c] py-20 sm:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(240,132,0,0.22),transparent_55%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f08400]/80 to-transparent"
        />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#ffb347]">
              Propriétaires
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              Ton lieu mérite d’être trouvé.
            </h2>
            <p className="mt-5 text-base font-light leading-relaxed text-white/65 sm:text-lg">
              Publie sur Dolci Rêva et transforme chaque soirée, séjour ou table
              en réservation.
            </p>
            <Link
              href="/admin/residences/new"
              className="mt-9 inline-flex h-12 items-center justify-center gap-2 bg-[#f08400] px-8 text-sm font-semibold text-white shadow-[0_12px_40px_-10px_rgba(240,132,0,0.7)] transition-all duration-300 hover:bg-[#d87200]"
            >
              Publier mes services
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
