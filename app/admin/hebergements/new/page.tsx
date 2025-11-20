"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DwellingForm } from "@/components/admin/hebergements/DwellingForm";
import { useCreateDwelling, type DwellingFormData } from "@/hooks/use-dwellings";
import { toast } from "sonner";

export default function NewDwellingPage() {
  const router = useRouter();
  const createDwellingMutation = useCreateDwelling();

  const handleSubmit = (
    data: DwellingFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ) => {
    createDwellingMutation.mutate(
      { data, images },
      {
        onSuccess: () => {
          toast.success("Hébergement créé avec succès !");
          router.push("/admin/hebergements");
        },
        onError: (error: unknown) => {
          const errorMessage =
            (error as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.message ||
            (error as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.error ||
            "Erreur lors de la création de l'hébergement";
          toast.error(errorMessage);
        },
      }
    );
  };

  const handleCancel = () => {
    router.push("/admin/hebergements");
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-4 sm:pb-8 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-gray-200/50">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="p-2 sm:p-3 bg-[#f08400] rounded-xl sm:rounded-2xl shadow-lg shadow-[#f08400]/20 hover:shadow-xl hover:shadow-[#f08400]/30 transition-all duration-300">
            <Home className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#101828] mb-1 sm:mb-1.5">
              Créer un hébergement
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm font-medium">
              Remplissez les informations ci-dessous pour créer un nouvel hébergement
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
        <DwellingForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createDwellingMutation.isPending}
        />
      </div>
    </div>
  );
}

