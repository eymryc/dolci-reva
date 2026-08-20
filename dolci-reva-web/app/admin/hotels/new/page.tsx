"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HotelForm } from "@/components/admin/hotels/HotelForm";
import { HotelHostForm } from "@/components/admin/hotels/HotelHostForm";
import { HostShell } from "@/components/admin/host/HostShell";
import { useCreateHotel, type HotelFormData } from "@/hooks/use-hotels";
import { usePermissions } from "@/hooks/use-permissions";
import { useBackofficePath } from "@/hooks/use-host-view";
import { toast } from "sonner";

export default function NewHotelPage() {
  const router = useRouter();
  const { isOwner, isAnyAdmin } = usePermissions();
  const isHostView = isOwner() && !isAnyAdmin();
  const bo = useBackofficePath();
  const createHotelMutation = useCreateHotel();
  const handleServerErrorRef = useRef<
    ((error: unknown) => { errorMessage: string; hasDetailedErrors: boolean }) | null
  >(null);

  const handleSubmit = (
    data: HotelFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ) => {
    createHotelMutation.mutate(
      { data, images },
      {
        onSuccess: () => {
          toast.success("Hôtel créé avec succès !");
          router.push(bo("/hotels"));
        },
        onError: (error: unknown) => {
          if (handleServerErrorRef.current) {
            const { errorMessage, hasDetailedErrors } =
              handleServerErrorRef.current(error);
            if (!hasDetailedErrors) toast.error(errorMessage);
          } else {
            toast.error("Erreur lors de la création de l'hôtel");
          }
        },
      }
    );
  };

  const handleCancel = () => router.push(bo("/hotels"));

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
            Tous les hôtels
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
              Ajouter un hôtel
            </h1>
            <p className="relative mt-2.5 max-w-xl text-[15px] leading-relaxed text-slate-500">
              Présentez votre établissement étape par étape, puis ajoutez vos
              chambres.
            </p>
          </header>

          <HotelHostForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={createHotelMutation.isPending}
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
      <div className="flex flex-col items-start justify-between gap-3 border-b border-gray-200/50 pb-4 sm:flex-row sm:items-center sm:gap-4 sm:pb-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="bg-[#f08400] p-2 sm:p-3">
            <Building2 className="h-5 w-5 text-white sm:h-7 sm:w-7" />
          </div>
          <div>
            <h1 className="mb-1 text-2xl font-bold text-[#101828] sm:mb-1.5 sm:text-3xl lg:text-4xl">
              Créer un hôtel
            </h1>
            <p className="text-xs font-medium text-gray-600 sm:text-sm">
              Remplissez les informations ci-dessous pour créer un nouvel hôtel
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          className="h-9 w-full rounded-none text-xs sm:h-10 sm:w-auto sm:text-sm"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
          Retour
        </Button>
      </div>

      <div className="border border-gray-200/60 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
        <HotelForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createHotelMutation.isPending}
          onServerError={(handleServerError) => {
            handleServerErrorRef.current = handleServerError;
          }}
        />
      </div>
    </div>
  );
}
