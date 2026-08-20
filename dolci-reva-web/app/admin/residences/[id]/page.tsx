"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit2,
  MapPin,
  Users,
  Bath,
  Loader2,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResidence } from "@/hooks/use-residences";
import { useBookings } from "@/hooks/use-bookings";
import { HostShell } from "@/components/admin/host/HostShell";
import { HostFeatureCategoriesSection } from "@/components/admin/host/HostFeatureCategoriesSection";
import { cn } from "@/lib/utils";
import { useBackofficePath } from "@/hooks/use-host-view";

function formatPrice(price: string | number) {
  const n = Number(price);
  if (Number.isNaN(n)) return String(price);
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function ResidenceDossierPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const bo = useBackofficePath();
  const { data: residence, isLoading, error } = useResidence(id);
  const { data: bookingsResponse } = useBookings(1);
  const upcoming = (bookingsResponse?.data || [])
    .filter((b) => b.bookable_id === id || b.bookable?.id === id)
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center">
        <Loader2 className="mb-3 h-9 w-9 animate-spin text-[#f08400]" />
        <p className="text-sm text-slate-500">Ouverture de la fiche…</p>
      </div>
    );
  }

  if (error || !residence) {
    return (
      <div className="mx-auto max-w-6xl border border-[#f08400]/20 bg-gradient-to-br from-[#fff4e8] to-white px-8 py-16 text-center">
        <p className="text-xl font-semibold tracking-tight text-slate-900">
          Résidence introuvable
        </p>
        <Button
          onClick={() => router.push(bo("/residences"))}
          className="mt-6 h-11 rounded-none bg-[#f08400] px-6 text-white hover:bg-[#d87200]"
        >
          Retour aux résidences
        </Button>
      </div>
    );
  }

  const cover =
    residence.main_image_url ||
    residence.main_image_thumb_url ||
    null;

  const available = residence.is_available && residence.is_active;

  const getSrc = (img: {
    url?: string;
    medium_url?: string;
    large_url?: string;
    thumb_url?: string;
  }) =>
    img.url || img.large_url || img.medium_url || img.thumb_url || "";

  // Uniquement les médias avec une vraie URL (évite les cases grises vides)
  const galleryFromCollection = (residence.gallery_images || []).filter((img) =>
    Boolean(getSrc(img))
  );
  const galleryFallback = (residence.all_images || []).filter((img) =>
    Boolean(getSrc(img))
  );
  const gallery =
    galleryFromCollection.length > 0 ? galleryFromCollection : galleryFallback;

  const featureCats = (residence.feature_categories || []).filter(
    (c) => (c.options || []).length > 0
  );

  return (
    <HostShell>
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <button
          type="button"
          onClick={() => router.push(bo("/residences"))}
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Toutes les résidences
        </button>

        {/* Hero */}
        <div className="relative overflow-hidden border border-[#f08400]/25">
          <div className="relative h-[min(42vh,400px)] min-h-[240px] bg-[#1a1a1a]">
            {cover ? (
              <Image
                src={cover}
                alt={residence.name}
                fill
                className="object-cover opacity-95"
                unoptimized
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#2a2118] to-[#161210] text-5xl font-semibold tracking-[0.25em] text-[#f08400]/30">
                {residence.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#f08400] to-[#ffb347]"
            />

            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 lg:p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0 max-w-2xl">
                  <p className="mb-2.5 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 border px-2 py-1 backdrop-blur-sm",
                        available
                          ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-100"
                          : "border-amber-400/40 bg-amber-500/20 text-amber-100"
                      )}
                    >
                      {available ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <span className="h-1.5 w-1.5 bg-amber-300" />
                      )}
                      {available ? "Disponible" : "Indisponible"}
                    </span>
                    <span className="normal-case tracking-normal text-white/70">
                      {residence.type}
                      {residence.standing ? ` · ${residence.standing}` : ""}
                    </span>
                  </p>
                  <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]">
                    {residence.name}
                  </h1>
                  <p className="mt-2.5 flex items-center gap-1.5 text-sm text-white/75">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-[#ffb347]" />
                    {[residence.address, residence.city, residence.country]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    asChild
                    className="h-11 rounded-none border-white/25 bg-white/10 px-4 text-white backdrop-blur-sm hover:bg-white hover:text-slate-900"
                  >
                    <Link href={bo("/bookings")}>
                      <Calendar className="mr-2 h-4 w-4" />
                      Réservations
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="h-11 rounded-none bg-[#f08400] px-5 font-semibold text-white shadow-[0_10px_28px_-12px_rgba(240,132,0,0.9)] hover:bg-[#d87200]"
                  >
                    <Link href={bo(`/residences/${residence.id}/edit`)}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Modifier
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats success */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "Tarif",
              value: formatPrice(residence.price),
              hint: "/ nuit",
              tone: "from-[#fff4e8] to-white border-[#f08400]/25",
            },
            {
              label: "Capacité",
              value: String(residence.max_guests),
              hint: "Personnes",
              tone: "from-[#fff8eb] to-white border-amber-300/40",
            },
            {
              label: "Chambres",
              value: residence.bedrooms != null ? String(residence.bedrooms) : "—",
              hint:
                residence.bathrooms != null
                  ? `${residence.bathrooms} sdb`
                  : undefined,
              tone: "from-[#fff0e6] to-white border-orange-200/70",
            },
            {
              label: "Note",
              value: residence.has_ratings
                ? String(residence.average_rating)
                : "—",
              hint: residence.has_ratings ? "moyenne" : "pas encore",
              tone: "from-[#fff9e8] to-white border-yellow-300/40",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={cn(
                "relative overflow-hidden border bg-gradient-to-br px-4 py-4 sm:px-5 sm:py-5",
                stat.tone
              )}
            >
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-[#f08400] to-[#ffb347] opacity-70"
              />
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {stat.label}
              </p>
              <p className="mt-1.5 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                {stat.value}
                {stat.hint ? (
                  <span className="ml-1.5 text-sm font-normal text-slate-400">
                    {stat.hint}
                  </span>
                ) : null}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-6">
          <div className="space-y-6 lg:col-span-8">
            <section className="border border-[#f08400]/20 bg-gradient-to-br from-[#fff4e8]/80 via-white to-white p-5 sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f08400]">
                À propos
              </p>
              <p className="mt-3 text-[15px] leading-[1.75] text-slate-600">
                {residence.description || "Aucune description pour le moment."}
              </p>
            </section>

            {gallery.length > 0 ? (
              <section className="border border-[#f08400]/15 bg-white p-5 sm:p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f08400]">
                  Galerie
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                  {gallery.slice(0, 6).map((img, i) => {
                    const src = getSrc(img);
                    return (
                      <div
                        key={img.id}
                        className={cn(
                          "relative overflow-hidden bg-[#fff4e8]",
                          i === 0
                            ? "col-span-2 aspect-[16/10] sm:col-span-2 sm:row-span-2 sm:aspect-auto sm:min-h-[240px]"
                            : "aspect-[4/3]"
                        )}
                      >
                        <Image
                          src={src}
                          alt={`${residence.name} — photo ${i + 1}`}
                          fill
                          className="object-cover transition-transform duration-700 hover:scale-105"
                          unoptimized
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : (
              <section className="border border-dashed border-[#f08400]/25 bg-gradient-to-br from-[#fff4e8]/60 to-white px-5 py-10 text-center sm:px-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f08400]">
                  Galerie
                </p>
                <p className="mt-3 text-sm text-slate-500">
                  Aucune photo de galerie pour le moment.
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="mt-5 h-10 rounded-none border-[#f08400]/30 text-[#c96d00] hover:bg-[#fff4e8]"
                >
                  <Link href={bo(`/residences/${residence.id}/edit`)}>
                    Ajouter des photos
                  </Link>
                </Button>
              </section>
            )}

            {featureCats.length > 0 ? (
              <HostFeatureCategoriesSection categories={featureCats} />
            ) : null}
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-6 overflow-hidden border border-[#f08400]/25 bg-gradient-to-br from-[#fff4e8] via-white to-white p-5 sm:p-6">
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#f08400] to-[#ffb347]"
              />
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f08400]">
                  Prochaines résas
                </p>
                <Link
                  href={bo("/bookings")}
                  className="text-[12px] font-semibold text-[#f08400] hover:text-[#d87200]"
                >
                  Voir tout
                </Link>
              </div>

              {upcoming.length === 0 ? (
                <div className="mt-5 border border-dashed border-[#f08400]/25 bg-white/70 px-4 py-8 text-center">
                  <Users className="mx-auto h-5 w-5 text-[#f08400]/50" />
                  <p className="mt-3 text-sm leading-relaxed text-slate-500">
                    Pas encore de réservation liée à ce lieu.
                  </p>
                </div>
              ) : (
                <ul className="mt-4 divide-y divide-[#f08400]/10">
                  {upcoming.map((b) => (
                    <li key={b.id} className="py-3.5">
                      <p className="text-sm font-semibold text-slate-900">
                        {b.customer
                          ? `${b.customer.first_name} ${b.customer.last_name}`
                          : b.booking_reference}
                      </p>
                      <p className="mt-1 text-[12px] text-slate-400">
                        {b.status} · {formatPrice(b.total_price)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-5 space-y-3 border-t border-[#f08400]/15 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Statut</span>
                  <span className="font-medium text-slate-800">
                    {residence.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                {residence.bathrooms != null ? (
                  <div className="flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-1.5 text-slate-500">
                      <Bath className="h-3.5 w-3.5" />
                      Salles de bain
                    </span>
                    <span className="font-medium text-slate-800">
                      {residence.bathrooms}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </HostShell>
  );
}
