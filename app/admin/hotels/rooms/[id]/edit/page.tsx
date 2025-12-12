"use client";

import React, { useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Bed, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoomForm } from "@/components/admin/hotels/RoomForm";
import { useHotelRoom, useUpdateHotelRoom, type HotelRoomFormData } from "@/hooks/use-hotels";
import { toast } from "sonner";

export default function EditRoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = parseInt(params.id as string);
  
  // Récupérer les détails complets de la chambre
  const { data: roomDetails, isLoading: isLoadingRoom, error } = useHotelRoom(roomId);
  const updateRoomMutation = useUpdateHotelRoom();
  const handleServerErrorRef = useRef<((error: unknown) => { errorMessage: string; hasDetailedErrors: boolean }) | null>(null);

  const handleSubmit = (
    data: HotelRoomFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ) => {
    updateRoomMutation.mutate(
      { roomId, data, images },
      {
        onSuccess: () => {
          toast.success("Chambre mise à jour avec succès !");
          router.push("/admin/hotels?tab=rooms");
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
                "Erreur lors de la mise à jour de la chambre"
            );
          }
        },
      }
    );
  };

  const handleCancel = () => {
    router.push("/admin/hotels?tab=rooms");
  };

  const isLoading = isLoadingRoom;
  const roomData = roomDetails;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-[#f08400] mb-6 mx-auto" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-[#f08400]/20 rounded-full mx-auto animate-pulse"></div>
          </div>
          <p className="text-gray-600 text-sm font-medium">Chargement de la chambre...</p>
        </div>
      </div>
    );
  }

  if (error || !roomData) {
    return (
      <div className="space-y-6 pb-8">
        <div className="flex items-start justify-between gap-4 pb-6 border-b border-gray-200/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-red-500 via-rose-500 to-red-600 rounded-2xl shadow-lg shadow-red-500/20">
              <Bed className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[#101828] mb-1.5">
                Erreur
              </h1>
              <p className="text-gray-600 text-sm font-medium">Impossible de charger la chambre</p>
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
          <p className="text-red-600 font-medium mb-6">Erreur lors du chargement de la chambre</p>
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
            <Bed className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-[#101828] mb-1.5">
              Modifier la chambre
            </h1>
            <p className="text-gray-600 text-sm font-medium">
              Mettez à jour les informations de la chambre ci-dessous
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
        <RoomForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          defaultValues={{
            hotel_id: roomData.hotel_id,
            name: roomData.name ?? undefined,
            description: roomData.description || "",
            room_number: roomData.room_number || "",
            type: (roomData as unknown as Record<string, unknown>).type as string || (roomData as unknown as Record<string, unknown>).room_type as string || "SINGLE",
            standing: (roomData as unknown as Record<string, unknown>).standing as string || "STANDARD",
            max_guests: roomData.max_guests,
            price: typeof roomData.price === "string" ? parseFloat(roomData.price) : (typeof roomData.price === "number" ? roomData.price : 0),
            amenities: roomData.amenities?.map((amenity) => amenity.id) || [],
            main_image_url: roomData.main_image_url || null,
            gallery_images: roomData.gallery_images || [],
          }}
          isLoading={updateRoomMutation.isPending}
          onServerError={(handleServerError) => {
            handleServerErrorRef.current = handleServerError;
          }}
        />
      </div>
    </div>
  );
}

