"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResidenceForm } from "@/components/admin/residences/ResidenceForm";
import { useCreateResidence, type ResidenceFormData } from "@/hooks/use-residences";
import { toast } from "sonner";

export default function NewResidencePage() {
  const router = useRouter();
  const createResidenceMutation = useCreateResidence();
  const handleServerErrorRef = useRef<((error: unknown) => { errorMessage: string; hasDetailedErrors: boolean }) | null>(null);

  const handleSubmit = (
    data: ResidenceFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ) => {
    createResidenceMutation.mutate(
      { data, images },
      {
        onSuccess: () => {
          toast.success("Résidence créée avec succès !");
          router.push("/admin/residences");
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
            const errorMessage =
              (error as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.message ||
              (error as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.error ||
              "Erreur lors de la création de la résidence";
            toast.error(errorMessage);
          }
        },
      }
    );
  };

  const handleCancel = () => {
    router.push("/admin/residences");
  };

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
              Créer une résidence
            </h1>
            <p className="text-gray-600 text-sm font-medium">
              Remplissez les informations ci-dessous pour créer une nouvelle résidence
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
          isLoading={createResidenceMutation.isPending}
          onServerError={(handleServerError) => {
            handleServerErrorRef.current = handleServerError;
          }}
        />
      </div>
    </div>
  );
}

