"use client";

import React, { useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, UtensilsCrossed, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RestaurantForm } from "@/components/admin/restaurants/RestaurantForm";
import { RestaurantHostForm } from "@/components/admin/restaurants/RestaurantHostForm";
import { HostShell } from "@/components/admin/host/HostShell";
import {
  useRestaurant,
  useUpdateRestaurant,
  type RestaurantFormData,
} from "@/hooks/use-restaurants";
import type { OpeningHours } from "@/types/entities/restaurant.types";
import { usePermissions } from "@/hooks/use-permissions";
import { useBackofficePath } from "@/hooks/use-host-view";
import { toast } from "sonner";
import { flattenFeatureOptions } from "@/lib/features";

export default function EditRestaurantPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const { isOwner, isAnyAdmin } = usePermissions();
  const isHostView = isOwner() && !isAnyAdmin();
  const bo = useBackofficePath();

  const { data: restaurant, isLoading, error } = useRestaurant(id);
  const updateRestaurantMutation = useUpdateRestaurant();
  const handleServerErrorRef = useRef<
    ((error: unknown) => { errorMessage: string; hasDetailedErrors: boolean }) | null
  >(null);

  const backPath = isHostView ? bo(`/restaurants/${id}`) : bo("/restaurants");

  const handleSubmit = (
    data: RestaurantFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ) => {
    updateRestaurantMutation.mutate(
      { id, data, images },
      {
        onSuccess: () => {
          toast.success("Restaurant mis à jour avec succès !");
          router.push(backPath);
        },
        onError: (error: unknown) => {
          if (handleServerErrorRef.current) {
            const { errorMessage, hasDetailedErrors } =
              handleServerErrorRef.current(error);
            if (!hasDetailedErrors) toast.error(errorMessage);
          } else {
            toast.error("Erreur lors de la mise à jour du restaurant");
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

  if (error || !restaurant) {
    return (
      <div className="space-y-6 pb-8 text-center">
        <p className="text-red-600">Impossible de charger le restaurant</p>
        <Button onClick={handleCancel}>Retour</Button>
      </div>
    );
  }

  const defaults = {
    name: restaurant.name,
    description: restaurant.description || undefined,
    address: restaurant.address,
    city: restaurant.city,
    country: restaurant.country,
    latitude: restaurant.latitude || undefined,
    longitude: restaurant.longitude || undefined,
    opening_hours:
      typeof restaurant.opening_hours === "string"
        ? JSON.parse(restaurant.opening_hours).reduce(
            (
              acc: OpeningHours,
              item: { day: string; open: string; close: string }
            ) => {
              acc[item.day as keyof OpeningHours] = {
                open: item.open,
                close: item.close,
              };
              return acc;
            },
            {} as OpeningHours
          )
        : restaurant.opening_hours || undefined,
    feature_option_ids: flattenFeatureOptions(
      restaurant.feature_categories
    ).map((option) => option.id),
    main_image_url: restaurant.main_image_url || null,
    gallery_images: restaurant.gallery_images || [],
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
              Modifier le restaurant
            </h1>
            <p className="relative mt-2.5 max-w-xl text-[15px] leading-relaxed text-slate-500">
              {restaurant.name}
            </p>
          </header>

          <RestaurantHostForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            defaultValues={defaults}
            isLoading={updateRestaurantMutation.isPending}
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
            <UtensilsCrossed className="h-5 w-5 text-white sm:h-7 sm:w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#101828] sm:text-3xl">
              Modifier le restaurant
            </h1>
            <p className="text-sm text-gray-600">{restaurant.name}</p>
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
        <RestaurantForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          defaultValues={defaults}
          isLoading={updateRestaurantMutation.isPending}
          onServerError={(handleServerError) => {
            handleServerErrorRef.current = handleServerError;
          }}
        />
      </div>
    </div>
  );
}
