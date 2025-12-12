"use client";

import React, { useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Coffee, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoungeForm } from "@/components/admin/lounges/LoungeForm";
import { useNightlifeVenue, useUpdateNightlifeVenue, type NightlifeVenueFormData } from "@/hooks/use-nightlife-venues";
import type { OpeningHours } from "@/types/entities/nightlife-venue.types";
import { toast } from "sonner";

export default function EditLoungePage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  
  const { data: lounge, isLoading, error } = useNightlifeVenue(id);
  const updateLoungeMutation = useUpdateNightlifeVenue();
  const handleServerErrorRef = useRef<((error: unknown) => { errorMessage: string; hasDetailedErrors: boolean }) | null>(null);

  const handleSubmit = (
    data: NightlifeVenueFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ) => {
    updateLoungeMutation.mutate(
      { id, data, images },
      {
        onSuccess: () => {
          toast.success("Espace mis à jour avec succès !");
          router.push("/admin/lounges");
        },
        onError: (error: unknown) => {
          if (handleServerErrorRef.current) {
            const { errorMessage, hasDetailedErrors } = handleServerErrorRef.current(error);
            if (!hasDetailedErrors) {
              toast.error(errorMessage);
            }
          } else {
            const axiosError = error as { response?: { data?: { message?: string; error?: string } } };
            toast.error(
              axiosError.response?.data?.message ||
                axiosError.response?.data?.error ||
                "Erreur lors de la mise à jour de l'espace"
            );
          }
        },
      }
    );
  };

  const handleCancel = () => {
    router.push("/admin/lounges");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-[#f08400] mb-6 mx-auto" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-[#f08400]/20 rounded-full mx-auto animate-pulse"></div>
          </div>
          <p className="text-gray-600 text-sm font-medium">Chargement de l&apos;espace...</p>
        </div>
      </div>
    );
  }

  if (error || !lounge) {
    return (
      <div className="space-y-6 pb-8">
        <div className="flex items-start justify-between gap-4 pb-6 border-b border-gray-200/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-red-500 via-rose-500 to-red-600 rounded-2xl shadow-lg shadow-red-500/20">
              <Coffee className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[#101828] mb-1.5">
                Erreur
              </h1>
              <p className="text-gray-600 text-sm font-medium">Impossible de charger l&apos;espace</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-red-200/60 text-center">
          <p className="text-red-600 font-medium mb-6">Erreur lors du chargement de l&apos;espace</p>
          <Button 
            onClick={handleCancel} 
            className="bg-[#f08400] hover:bg-[#d87200] text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-4 sm:pb-8 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-gray-200/50">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="p-2 sm:p-3 bg-[#f08400] rounded-xl sm:rounded-2xl shadow-lg shadow-[#f08400]/20 hover:shadow-xl hover:shadow-[#f08400]/30 transition-all duration-300">
            <Coffee className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#101828] mb-1 sm:mb-1.5">
              Modifier mon espace
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm font-medium">
              {lounge.name}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          className="hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          Retour
        </Button>
      </div>

      {/* Form */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl shadow-gray-200/50 border border-gray-200/60 hover:shadow-2xl hover:shadow-gray-200/70 transition-all duration-300">
        <LoungeForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          defaultValues={{
            name: lounge.name,
            description: lounge.description || undefined,
            address: lounge.address,
            city: lounge.city,
            country: lounge.country,
            latitude: lounge.latitude || undefined,
            longitude: lounge.longitude || undefined,
            opening_hours: typeof lounge.opening_hours === 'string' 
              ? JSON.parse(lounge.opening_hours).reduce((acc: OpeningHours, item: { day: string; open: string; close: string }) => {
                  acc[item.day as keyof OpeningHours] = { open: item.open, close: item.close };
                  return acc;
                }, {} as OpeningHours)
              : (lounge.opening_hours || undefined),
            amenities: lounge.amenities?.map((amenity) => amenity.id) || [],
            age_restriction: lounge.age_restriction ?? null,
            smoking_area: lounge.smoking_area ?? false,
            outdoor_seating: lounge.outdoor_seating ?? false,
            parking: lounge.parking ?? false,
            venue_type: Array.isArray(lounge.venue_type) ? lounge.venue_type : (lounge.venue_type ? [lounge.venue_type] : []),
            main_image_url: lounge.main_image_url || null,
            gallery_images: lounge.gallery_images || [],
          }}
          isLoading={updateLoungeMutation.isPending}
          onServerError={(handleServerError) => {
            handleServerErrorRef.current = handleServerError;
          }}
        />
      </div>
    </div>
  );
}

