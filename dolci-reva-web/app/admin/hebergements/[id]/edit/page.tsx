"use client";

import React, { useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Home, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DwellingForm } from "@/components/admin/hebergements/DwellingForm";
import { DwellingHostForm } from "@/components/admin/hebergements/DwellingHostForm";
import { HostShell } from "@/components/admin/host/HostShell";
import {
  useDwelling,
  useUpdateDwelling,
  type DwellingFormData,
} from "@/hooks/use-dwellings";
import { usePermissions } from "@/hooks/use-permissions";
import { useBackofficePath } from "@/hooks/use-host-view";
import { toast } from "sonner";

export default function EditDwellingPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const { isOwner, isAnyAdmin } = usePermissions();
  const isHostView = isOwner() && !isAnyAdmin();
  const bo = useBackofficePath();

  const { data: dwelling, isLoading, error } = useDwelling(id);
  const updateDwellingMutation = useUpdateDwelling();
  const handleServerErrorRef = useRef<
    ((error: unknown) => { errorMessage: string; hasDetailedErrors: boolean }) | null
  >(null);

  const backPath = isHostView
    ? bo(`/hebergements/${id}`)
    : bo("/hebergements");

  const handleSubmit = (
    data: DwellingFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ) => {
    updateDwellingMutation.mutate(
      { id, data, images },
      {
        onSuccess: () => {
          toast.success("Hébergement mis à jour avec succès !");
          router.push(backPath);
        },
        onError: (error: unknown) => {
          if (handleServerErrorRef.current) {
            const { errorMessage, hasDetailedErrors } =
              handleServerErrorRef.current(error);
            if (!hasDetailedErrors) toast.error(errorMessage);
          } else {
            toast.error("Erreur lors de la mise à jour de l'hébergement");
          }
        },
      }
    );
  };

  const handleCancel = () => router.push(backPath);

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#f08400]" />
      </div>
    );
  }

  if (error || !dwelling) {
    return (
      <div className="space-y-6 pb-8 text-center">
        <p className="text-red-600">Impossible de charger l&apos;hébergement</p>
        <Button onClick={handleCancel}>Retour</Button>
      </div>
    );
  }

  const defaults = {
    phone: dwelling.phone || "",
    whatsapp: dwelling.whatsapp || "",
    security_deposit_month_number:
      dwelling.security_deposit_month_number ?? null,
    visite_price: dwelling.visite_price ? String(dwelling.visite_price) : "",
    rent_advance_amount_number: dwelling.rent_advance_amount_number ?? null,
    rent: dwelling.rent ? String(dwelling.rent) : "",
    description: dwelling.description || "",
    address: dwelling.address,
    city: dwelling.city,
    country: dwelling.country,
    latitude: dwelling.latitude || "",
    longitude: dwelling.longitude || "",
    type: dwelling.type,
    rooms: dwelling.rooms,
    bathrooms: dwelling.bathrooms,
    piece_number: dwelling.piece_number,
    living_room: dwelling.living_room ?? null,
    structure_type: dwelling.structure_type,
    construction_type: dwelling.construction_type,
    agency_fees_month_number: dwelling.agency_fees_month_number ?? null,
    owner_id: dwelling.owner_id,
    main_image_url: dwelling.main_image_url || null,
    gallery_images: dwelling.gallery_images || [],
  };

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
              Modifier l&apos;hébergement
            </h1>
            <p className="relative mt-2.5 max-w-xl text-[15px] leading-relaxed text-slate-500">
              {dwelling.address || `Hébergement #${dwelling.id}`}
            </p>
          </header>

          <DwellingHostForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            defaultValues={defaults}
            isLoading={updateDwellingMutation.isPending}
            onServerError={(handleServerError) => {
              handleServerErrorRef.current = handleServerError;
            }}
          />
        </div>
      </HostShell>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-start justify-between gap-4 border-b border-gray-200/50 pb-6">
        <div className="flex items-center gap-4">
          <div className="bg-[#f08400] p-3">
            <Home className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-[#101828]">
              Modifier l&apos;hébergement
            </h1>
            <p className="text-sm text-gray-600">
              Mettez à jour les informations de l&apos;hébergement
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          className="rounded-none"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>

      <div className="border border-gray-200/60 bg-white p-8 shadow-sm">
        <DwellingForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          defaultValues={defaults}
          isLoading={updateDwellingMutation.isPending}
          onServerError={(handleServerError) => {
            handleServerErrorRef.current = handleServerError;
          }}
        />
      </div>
    </div>
  );
}
