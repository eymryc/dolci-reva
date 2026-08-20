"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResidenceForm } from "@/components/admin/residences/ResidenceForm";
import { ResidenceHostForm } from "@/components/admin/residences/ResidenceHostForm";
import { HostShell } from "@/components/admin/host/HostShell";
import { useCreateResidence, type ResidenceFormData } from "@/hooks/use-residences";
import { usePermissions } from "@/hooks/use-permissions";
import { useBackofficePath } from "@/hooks/use-host-view";
import { toast } from "sonner";

export default function NewResidencePage() {
  const router = useRouter();
  const { isOwner, isAnyAdmin } = usePermissions();
  const isHostView = isOwner() && !isAnyAdmin();
  const bo = useBackofficePath();
  const createResidenceMutation = useCreateResidence();
  const handleServerErrorRef = useRef<
    ((error: unknown) => { errorMessage: string; hasDetailedErrors: boolean }) | null
  >(null);

  const handleSubmit = (
    data: ResidenceFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ) => {
    createResidenceMutation.mutate(
      { data, images },
      {
        onSuccess: () => {
          toast.success("Résidence créée avec succès !");
          router.push(bo("/residences"));
        },
        onError: (error: unknown) => {
          if (handleServerErrorRef.current) {
            const { errorMessage, hasDetailedErrors } = handleServerErrorRef.current(error);
            if (!hasDetailedErrors) toast.error(errorMessage);
          } else {
            toast.error("Erreur lors de la création de la résidence");
          }
        },
      }
    );
  };

  const handleCancel = () => router.push(bo("/residences"));

  const Form = isHostView ? ResidenceHostForm : ResidenceForm;

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
            Toutes les résidences
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
              Ajouter une résidence
            </h1>
            <p className="relative mt-2.5 max-w-xl text-[15px] leading-relaxed text-slate-500">
              Quelques étapes guidées pour publier votre logement sur Dolci Rêva.
            </p>
          </header>

          <Form
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={createResidenceMutation.isPending}
            onServerError={(handleServerError) => {
              handleServerErrorRef.current = handleServerError;
            }}
          />
        </div>
      </HostShell>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Créer une résidence
          </h1>
          <p className="mt-1 text-sm text-slate-500">Remplissez les informations ci-dessous.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          className="h-9 rounded-none border-slate-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>

      <div className="rounded-2xl border border-gray-200/60 bg-white/90 p-4 shadow-xl sm:p-6 lg:p-8">
        <Form
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
