"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoungeForm } from "@/components/admin/lounges/LoungeForm";
import { LoungeHostForm } from "@/components/admin/lounges/LoungeHostForm";
import { HostShell } from "@/components/admin/host/HostShell";
import {
  useCreateNightlifeVenue,
  type NightlifeVenueFormData,
} from "@/hooks/use-nightlife-venues";
import { usePermissions } from "@/hooks/use-permissions";
import { useBackofficePath } from "@/hooks/use-host-view";
import { toast } from "sonner";

export default function NewLoungePage() {
  const router = useRouter();
  const { isOwner, isAnyAdmin } = usePermissions();
  const isHostView = isOwner() && !isAnyAdmin();
  const bo = useBackofficePath();
  const createLoungeMutation = useCreateNightlifeVenue();
  const handleServerErrorRef = useRef<
    ((error: unknown) => { errorMessage: string; hasDetailedErrors: boolean }) | null
  >(null);

  const handleSubmit = (
    data: NightlifeVenueFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ) => {
    createLoungeMutation.mutate(
      { data, images },
      {
        onSuccess: () => {
          toast.success("Espace créé avec succès !");
          router.push(bo("/lounges"));
        },
        onError: (error: unknown) => {
          if (handleServerErrorRef.current) {
            const { errorMessage, hasDetailedErrors } =
              handleServerErrorRef.current(error);
            if (!hasDetailedErrors) toast.error(errorMessage);
          } else {
            toast.error("Erreur lors de la création de l'espace");
          }
        },
      }
    );
  };

  const handleCancel = () => router.push(bo("/lounges"));

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
            Tous les espaces
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
              Ajouter mon espace
            </h1>
            <p className="relative mt-2.5 max-w-xl text-[15px] leading-relaxed text-slate-500">
              Quelques étapes guidées pour publier votre lounge sur Dolci Rêva.
            </p>
          </header>

          <LoungeHostForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={createLoungeMutation.isPending}
            lockedVenueType={["LOUNGE"]}
            entityLabel="espace"
            onServerError={(handleServerError) => {
              handleServerErrorRef.current = handleServerError;
            }}
          />
        </div>
      </HostShell>
    );
  }

  return (
    <div className="space-y-4 px-2 pb-4 sm:space-y-6 sm:px-0 sm:pb-8">
      <div className="flex flex-col items-start justify-between gap-3 border-b border-gray-200/50 pb-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="bg-[#f08400] p-2 sm:p-3">
            <Coffee className="h-5 w-5 text-white sm:h-7 sm:w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#101828] sm:text-3xl">
              Créer mon espace
            </h1>
            <p className="text-sm text-gray-600">
              Remplissez les informations ci-dessous
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          className="h-9 rounded-none"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>
      <div className="border border-gray-200/60 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
        <LoungeForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createLoungeMutation.isPending}
          onServerError={(handleServerError) => {
            handleServerErrorRef.current = handleServerError;
          }}
        />
      </div>
    </div>
  );
}
