"use client";

import { useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Music2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoungeForm } from "@/components/admin/lounges/LoungeForm";
import { LoungeHostForm } from "@/components/admin/lounges/LoungeHostForm";
import { HostShell } from "@/components/admin/host/HostShell";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { extractApiData } from "@/types/api-response.types";
import { toast } from "sonner";
import { handleError } from "@/lib/error-handler";
import type {
  NightlifeVenue,
  NightlifeVenueFormData,
} from "@/types/entities/nightlife-venue.types";
import Link from "next/link";
import { flattenFeatureOptions } from "@/lib/features";
import { usePermissions } from "@/hooks/use-permissions";
import { useBackofficePath } from "@/hooks/use-host-view";
import {
  appendNightlifeImages,
  appendNightlifeVenueFormData,
  parseOpeningHours,
} from "@/lib/nightlife-form-data";

export default function EditNightClubPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const queryClient = useQueryClient();
  const { isOwner, isAnyAdmin } = usePermissions();
  const isHostView = isOwner() && !isAnyAdmin();
  const bo = useBackofficePath();
  const handleServerErrorRef = useRef<
    ((error: unknown) => { errorMessage: string; hasDetailedErrors: boolean }) | null
  >(null);

  const backPath = isHostView ? bo(`/night-clubs/${id}`) : bo("/night-clubs");

  const { data: club, isLoading, error } = useQuery({
    queryKey: ["admin", "night-clubs", id],
    queryFn: async () => {
      const response = await api.get(`/night-clubs/${id}`);
      const data = extractApiData<NightlifeVenue>(response.data);
      if (!data) throw new Error("Night-club not found");
      return data;
    },
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      data,
      images,
    }: {
      data: NightlifeVenueFormData;
      images?: { mainImage?: File | null; galleryImages?: File[] };
    }) => {
      const formData = new FormData();
      formData.append("_method", "PUT");
      appendNightlifeVenueFormData(formData, data, {
        forceVenueType: "NIGHT_CLUB",
      });
      appendNightlifeImages(formData, images);

      const response = await api.post(`/night-clubs/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return extractApiData<NightlifeVenue>(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "night-clubs"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "night-clubs", id] });
      toast.success("Night-club mis à jour avec succès !");
      router.push(backPath);
    },
    onError: (error: unknown) => {
      handleError(error, {
        defaultMessage: "Erreur lors de la mise à jour du night-club",
      });
    },
  });

  const handleSubmit = (
    data: NightlifeVenueFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ) => {
    updateMutation.mutate(
      { data, images },
      {
        onError: (error: unknown) => {
          if (handleServerErrorRef.current) {
            const { errorMessage, hasDetailedErrors } =
              handleServerErrorRef.current(error);
            if (!hasDetailedErrors) toast.error(errorMessage);
          }
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#f08400]" />
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="py-20 text-center">
        <p className="mb-4 text-gray-600">Night-club introuvable.</p>
        <Link href={bo("/night-clubs")}>
          <Button>Retour</Button>
        </Link>
      </div>
    );
  }

  const defaults = {
    name: club.name,
    description: club.description || "",
    address: club.address,
    city: club.city,
    country: club.country,
    latitude: club.latitude || "",
    longitude: club.longitude || "",
    opening_hours: parseOpeningHours(club.opening_hours),
    age_restriction: club.age_restriction === 21 ? 21 : 18,
    smoking_area: club.smoking_area,
    outdoor_seating: club.outdoor_seating,
    parking: club.parking,
    venue_type: (Array.isArray(club.venue_type)
      ? club.venue_type
      : club.venue_type
        ? [club.venue_type]
        : ["NIGHT_CLUB"]) as ("NIGHT_CLUB")[],
    is_active: club.is_active,
    feature_option_ids: flattenFeatureOptions(club.feature_categories).map(
      (option) => option.id
    ),
    main_image_url: club.main_image_url || null,
    gallery_images: club.gallery_images || [],
  };

  if (isHostView) {
    return (
      <HostShell>
        <div className="mx-auto w-full max-w-7xl space-y-6">
          <button
            type="button"
            onClick={() => router.push(backPath)}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour au dossier
          </button>

          <header className="relative overflow-hidden border border-[#f08400]/25 bg-gradient-to-br from-[#fff4e8] via-[#fffaf5] to-white px-5 py-6 sm:px-7 sm:py-7">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-[#f08400]/15 blur-2xl"
            />
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#f08400] to-[#ffb347]"
            />
            <p className="relative text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f08400]">
              Espace hôte
            </p>
            <h1 className="relative mt-2 text-[1.85rem] font-semibold leading-[1.1] tracking-tight text-slate-900 sm:text-[2.35rem]">
              Modifier le night-club
            </h1>
            <p className="relative mt-2.5 max-w-xl text-[15px] leading-relaxed text-slate-500">
              {club.name}
            </p>
          </header>

          <LoungeHostForm
            defaultValues={defaults}
            onSubmit={handleSubmit}
            onCancel={() => router.push(backPath)}
            isLoading={updateMutation.isPending}
            lockedVenueType={["NIGHT_CLUB"]}
            entityLabel="night-club"
            onServerError={(handleServerError) => {
              handleServerErrorRef.current = handleServerError;
            }}
          />
        </div>
      </HostShell>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(backPath)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100">
            <Music2 className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Modifier le night-club
            </h1>
            <p className="text-sm text-gray-500">{club.name}</p>
          </div>
        </div>
      </div>

      <LoungeForm
        defaultValues={defaults}
        onSubmit={handleSubmit}
        onCancel={() => router.push(backPath)}
        isLoading={updateMutation.isPending}
        onServerError={(handleServerError) => {
          handleServerErrorRef.current = handleServerError;
        }}
      />
    </div>
  );
}
