"use client";

import React, { useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoomForm } from "@/components/admin/hotels/RoomForm";
import { RoomHostForm } from "@/components/admin/hotels/RoomHostForm";
import { useCreateHotelRoom, type HotelRoomFormData } from "@/hooks/use-hotels";
import { HostShell } from "@/components/admin/host/HostShell";
import { usePermissions } from "@/hooks/use-permissions";
import { useBackofficePath } from "@/hooks/use-host-view";
import { toast } from "sonner";

export default function NewRoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hotelIdParam = searchParams.get("hotelId");
  const hotelId = hotelIdParam ? parseInt(hotelIdParam, 10) : undefined;
  const { isOwner, isAnyAdmin } = usePermissions();
  const isHostView = isOwner() && !isAnyAdmin();
  const bo = useBackofficePath();
  const createRoomMutation = useCreateHotelRoom();
  const handleServerErrorRef = useRef<
    ((error: unknown) => { errorMessage: string; hasDetailedErrors: boolean }) | null
  >(null);

  const backPath = hotelId
    ? isHostView
      ? bo(`/hotels/${hotelId}`)
      : bo("/hotels")
    : bo("/hotels");

  const handleSubmit = (
    data: HotelRoomFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ) => {
    const finalData = hotelId ? { ...data, hotel_id: hotelId } : data;

    createRoomMutation.mutate(
      { data: finalData, images },
      {
        onSuccess: () => {
          toast.success("Chambre créée avec succès !");
          router.push(
            hotelId && isHostView ? bo(`/hotels/${hotelId}`) : bo("/hotels")
          );
        },
        onError: (error: unknown) => {
          if (handleServerErrorRef.current) {
            const { errorMessage, hasDetailedErrors } =
              handleServerErrorRef.current(error);
            if (!hasDetailedErrors) toast.error(errorMessage);
          } else {
            toast.error("Erreur lors de la création de la chambre");
          }
        },
      }
    );
  };

  const defaults = hotelId
    ? {
        hotel_id: hotelId,
        name: "",
        description: "",
        room_number: "",
        type: "SINGLE",
        standing: "STANDARD",
        max_guests: 2,
        price: 0,
        feature_option_ids: [],
      }
    : undefined;

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
            Retour à l&apos;hôtel
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
              Ajouter une chambre
            </h1>
            <p className="relative mt-2.5 max-w-xl text-[15px] leading-relaxed text-slate-500">
              Quelques étapes guidées pour publier une chambre sur Dolci Rêva.
            </p>
          </header>

          <RoomHostForm
            onSubmit={handleSubmit}
            onCancel={() => router.push(backPath)}
            isLoading={createRoomMutation.isPending}
            defaultValues={defaults}
            lockHotel={Boolean(hotelId)}
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
      <div className="flex flex-col items-start justify-between gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Créer une chambre
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Remplissez les informations ci-dessous.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(backPath)}
          className="h-9 rounded-none border-slate-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>
      <div className="border border-gray-200/60 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
        <RoomForm
          onSubmit={handleSubmit}
          onCancel={() => router.push(backPath)}
          isLoading={createRoomMutation.isPending}
          defaultValues={defaults}
          onServerError={(handleServerError) => {
            handleServerErrorRef.current = handleServerError;
          }}
        />
      </div>
    </div>
  );
}
