"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Home, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DwellingForm } from "@/components/admin/hebergements/DwellingForm";
import { useDwelling, useUpdateDwelling, type DwellingFormData } from "@/hooks/use-dwellings";
import { toast } from "sonner";

export default function EditDwellingPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  
  const { data: dwelling, isLoading, error } = useDwelling(id);
  const updateDwellingMutation = useUpdateDwelling();
  
  // Référence pour stocker handleServerError du formulaire
  const handleServerErrorRef = React.useRef<
    ((error: unknown) => { errorMessage: string; hasDetailedErrors: boolean }) | null
  >(null);

  const handleSubmit = (
    data: DwellingFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ) => {
    updateDwellingMutation.mutate(
      { id, data, images },
      {
        onSuccess: () => {
          toast.success("Hébergement mis à jour avec succès !");
          router.push("/admin/hebergements");
        },
        onError: (error: unknown) => {
          // Utiliser handleServerError du formulaire si disponible
          if (handleServerErrorRef.current) {
            const { errorMessage, hasDetailedErrors } = handleServerErrorRef.current(error);
            // Afficher le toast seulement s'il n'y a pas d'erreurs détaillées
            if (!hasDetailedErrors) {
              toast.error(errorMessage);
            }
          } else {
            // Fallback si handleServerError n'est pas disponible
            const axiosError = error as { response?: { data?: { message?: string; error?: string } } };
            toast.error(
              axiosError.response?.data?.message ||
                axiosError.response?.data?.error ||
                "Erreur lors de la mise à jour de l'hébergement"
            );
          }
        },
      }
    );
  };
  
  const handleServerErrorCallback = React.useCallback(
    (handleServerError: (error: unknown) => { errorMessage: string; hasDetailedErrors: boolean }) => {
      handleServerErrorRef.current = handleServerError;
    },
    []
  );

  const handleCancel = () => {
    router.push("/admin/hebergements");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-[#f08400] mb-6 mx-auto" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-[#f08400]/20 rounded-full mx-auto animate-pulse"></div>
          </div>
          <p className="text-gray-600 text-sm font-medium">Chargement de l&apos;hébergement...</p>
        </div>
      </div>
    );
  }

  if (error || !dwelling) {
    return (
      <div className="space-y-6 pb-8">
        <div className="flex items-start justify-between gap-4 pb-6 border-b border-gray-200/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-red-500 via-rose-500 to-red-600 rounded-2xl shadow-lg shadow-red-500/20">
              <Home className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[#101828] mb-1.5">
                Erreur
              </h1>
              <p className="text-gray-600 text-sm font-medium">Impossible de charger l&apos;hébergement</p>
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
          <p className="text-red-600 font-medium mb-6">Erreur lors du chargement de l&apos;hébergement</p>
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
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-6 border-b border-gray-200/50">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#f08400] rounded-2xl shadow-lg shadow-[#f08400]/20 hover:shadow-xl hover:shadow-[#f08400]/30 transition-all duration-300">
            <Home className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-[#101828] mb-1.5">
              Modifier l&apos;hébergement
            </h1>
            <p className="text-gray-600 text-sm font-medium">
              Mettez à jour les informations de l&apos;hébergement ci-dessous
            </p>
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

      {/* Form */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-200/60 hover:shadow-2xl hover:shadow-gray-200/70 transition-all duration-300">
        <DwellingForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onServerError={handleServerErrorCallback}
          defaultValues={{
            phone: dwelling.phone || "",
            whatsapp: dwelling.whatsapp || "",
            security_deposit_month_number: dwelling.security_deposit_month_number ?? null,
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
          }}
          isLoading={updateDwellingMutation.isPending}
        />
      </div>
    </div>
  );
}

