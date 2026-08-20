"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Wine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoungeForm } from "@/components/admin/lounges/LoungeForm";
import { LoungeHostForm } from "@/components/admin/lounges/LoungeHostForm";
import { HostShell } from "@/components/admin/host/HostShell";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { extractApiData } from "@/types/api-response.types";
import { toast } from "sonner";
import { handleError } from "@/lib/error-handler";
import type {
  NightlifeVenueFormData,
  NightlifeVenue,
} from "@/types/entities/nightlife-venue.types";
import { usePermissions } from "@/hooks/use-permissions";
import { useBackofficePath } from "@/hooks/use-host-view";
import {
  appendNightlifeImages,
  appendNightlifeVenueFormData,
} from "@/lib/nightlife-form-data";

export default function NewBarPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isOwner, isAnyAdmin } = usePermissions();
  const isHostView = isOwner() && !isAnyAdmin();
  const bo = useBackofficePath();
  const handleServerErrorRef = useRef<
    ((error: unknown) => { errorMessage: string; hasDetailedErrors: boolean }) | null
  >(null);

  const createMutation = useMutation({
    mutationFn: async ({
      data,
      images,
    }: {
      data: NightlifeVenueFormData;
      images?: { mainImage?: File | null; galleryImages?: File[] };
    }) => {
      const formData = new FormData();
      appendNightlifeVenueFormData(formData, data, { forceVenueType: "BAR" });
      appendNightlifeImages(formData, images);

      const response = await api.post("/bars", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const venue = extractApiData<NightlifeVenue>(response.data);
      if (!venue) throw new Error("Failed to create bar");
      return venue;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "bars"] });
      toast.success("Bar créé avec succès !");
      router.push(bo("/bars"));
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Erreur lors de la création du bar" });
    },
  });

  const handleSubmit = (
    data: NightlifeVenueFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ) => {
    createMutation.mutate(
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

  const handleCancel = () => router.push(bo("/bars"));

  if (isHostView) {
    return (
      <HostShell>
        <div className="mx-auto w-full max-w-7xl space-y-6">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Tous les bars
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
              Ajouter un bar
            </h1>
            <p className="relative mt-2.5 max-w-xl text-[15px] leading-relaxed text-slate-500">
              Quelques étapes guidées pour publier votre bar sur Dolci Rêva.
            </p>
          </header>

          <LoungeHostForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={createMutation.isPending}
            lockedVenueType={["BAR"]}
            entityLabel="bar"
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
          onClick={handleCancel}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100">
            <Wine className="h-5 w-5 text-amber-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Nouveau bar</h1>
        </div>
      </div>

      <LoungeForm
        defaultValues={{ venue_type: ["BAR"] } as NightlifeVenueFormData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={createMutation.isPending}
        onServerError={(handleServerError) => {
          handleServerErrorRef.current = handleServerError;
        }}
      />
    </div>
  );
}
