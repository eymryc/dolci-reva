"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Home, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResidenceForm } from "@/components/admin/residences/ResidenceForm";
import { useResidence, useUpdateResidence, type ResidenceFormData } from "@/hooks/use-residences";
import { toast } from "sonner";

export default function EditResidencePage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  
  const { data: residence, isLoading, error } = useResidence(id);
  const updateResidenceMutation = useUpdateResidence();

  const handleSubmit = (
    data: ResidenceFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ) => {
    updateResidenceMutation.mutate(
      { id, data, images },
      {
        onSuccess: () => {
          toast.success("Résidence mise à jour avec succès !");
          router.push("/admin/residences");
        },
        onError: (error: unknown) => {
          const axiosError = error as { response?: { data?: { message?: string; error?: string } } };
          toast.error(
            axiosError.response?.data?.message ||
              axiosError.response?.data?.error ||
              "Erreur lors de la mise à jour de la résidence"
          );
        },
      }
    );
  };

  const handleCancel = () => {
    router.push("/admin/residences");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-[#f08400] mb-6 mx-auto" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-[#f08400]/20 rounded-full mx-auto animate-pulse"></div>
          </div>
          <p className="text-gray-600 text-sm font-medium">Chargement de la résidence...</p>
        </div>
      </div>
    );
  }

  if (error || !residence) {
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
              <p className="text-gray-600 text-sm font-medium">Impossible de charger la résidence</p>
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
          <p className="text-red-600 font-medium mb-6">Erreur lors du chargement de la résidence</p>
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
              Modifier la résidence
            </h1>
            <p className="text-gray-600 text-sm font-medium">
              Mettez à jour les informations de la résidence ci-dessous
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
        <ResidenceForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          defaultValues={{
            name: residence.name,
            description: residence.description || "",
            address: residence.address,
            city: residence.city,
            country: residence.country,
            latitude: residence.latitude || "",
            longitude: residence.longitude || "",
            type: residence.type,
            max_guests: residence.max_guests,
            bedrooms: residence.bedrooms,
            bathrooms: residence.bathrooms,
            piece_number: residence.piece_number,
            price: residence.price,
            standing: residence.standing,
            owner_id: residence.owner_id,
            amenities: residence.amenities?.map((amenity) => amenity.id) || [],
            main_image_url: residence.main_image_url || null,
            gallery_images: residence.gallery_images || [],
          }}
          isLoading={updateResidenceMutation.isPending}
        />
      </div>
    </div>
  );
}

