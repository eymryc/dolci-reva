"use client";

import { ACCEPTED_IMAGE_TYPES } from "@/lib/image-upload";

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResidenceFormData } from "@/hooks/use-residences";
import { FeatureOptionsPicker } from "@/components/admin/shared/FeatureOptionsPicker";
import { useAddressAutocomplete } from "@/hooks/use-address-autocomplete";
import type { AddressSuggestion } from "@/hooks/use-address-autocomplete";
import { X, Image as ImageIcon, MapPin } from "lucide-react";
import { ServerErrorPanel } from "@/components/ui/ServerErrorPanel";
import { useServerErrors } from "@/hooks/use-server-errors";
import { createFieldLabels } from "@/lib/server-error-utils";
import { StepFormShell, type FormStep } from "@/components/admin/host/StepFormShell";
import { Button } from "@/components/ui/button";

const residenceSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().max(2000).optional().or(z.literal("")),
  address: z.string().min(1).max(500),
  city: z.string().min(1).max(100),
  country: z.string().min(1).max(100),
  latitude: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return null;
      const num = typeof val === "string" ? Number(val) : val;
      return isNaN(num as number) ? null : num;
    },
    z.number().min(-90).max(90).nullable().optional()
  ),
  longitude: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return null;
      const num = typeof val === "string" ? Number(val) : val;
      return isNaN(num as number) ? null : num;
    },
    z.number().min(-180).max(180).nullable().optional()
  ),
  type: z.enum(["STUDIO", "APPARTEMENT", "VILLA", "PENTHOUSE", "DUPLEX", "TRIPLEX"]),
  max_guests: z.number().int().min(1).max(20),
  bedrooms: z.number().int().min(0).max(20).nullable().optional(),
  bathrooms: z.number().int().min(0).max(20).nullable().optional(),
  piece_number: z.number().int().min(1).nullable().optional(),
  price: z.string().min(1),
  standing: z.enum([
    "STANDARD",
    "SUPERIEUR",
    "DELUXE",
    "EXECUTIVE",
    "SUITE",
    "SUITE_JUNIOR",
    "SUITE_EXECUTIVE",
    "SUITE_PRESIDENTIELLE",
  ]),
  owner_id: z.number().optional(),
  feature_option_ids: z.array(z.number().int()).min(1).max(20),
});

type FormValues = z.infer<typeof residenceSchema>;

const STEPS: FormStep[] = [
  { id: "identity", title: "Identité", description: "Nom et localisation" },
  { id: "details", title: "Tarifs & capacité", description: "Type et Personnes" },
  { id: "photos", title: "Photos", description: "Image principale" },
  { id: "features", title: "Équipements", description: "Services proposés" },
  { id: "publish", title: "Publication", description: "Vérifier et enregistrer" },
];

interface Props {
  onSubmit: (data: ResidenceFormData, images?: { mainImage?: File | null; galleryImages?: File[] }) => void;
  onCancel: () => void;
  defaultValues?: ResidenceFormData & {
    main_image_url?: string | null;
    gallery_images?: Array<{ url?: string } | string>;
  };
  isLoading?: boolean;
  onServerError?: (handleServerError: (error: unknown) => { errorMessage: string; hasDetailedErrors: boolean }) => void;
}

export function ResidenceHostForm({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading = false,
  onServerError,
}: Props) {
  const [step, setStep] = useState(0);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
    setError,
    clearErrors: clearFormErrors,
  } = useForm<FormValues>({
    // @ts-expect-error zod/rhf
    resolver: zodResolver(residenceSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      address: defaultValues?.address || "",
      city: defaultValues?.city || "",
      country: defaultValues?.country || "Côte d'Ivoire",
      latitude: defaultValues?.latitude ? Number(defaultValues.latitude) : null,
      longitude: defaultValues?.longitude ? Number(defaultValues.longitude) : null,
      type: (defaultValues?.type as FormValues["type"]) || "APPARTEMENT",
      max_guests: defaultValues?.max_guests || 2,
      bedrooms: defaultValues?.bedrooms ?? null,
      bathrooms: defaultValues?.bathrooms ?? null,
      piece_number: defaultValues?.piece_number ?? null,
      price: defaultValues?.price || "",
      standing: (defaultValues?.standing as FormValues["standing"]) || "STANDARD",
      owner_id: defaultValues?.owner_id,
      feature_option_ids: defaultValues?.feature_option_ids || [],
    },
  });

  const type = watch("type");
  const standing = watch("standing");
  const selectedFeatureOptionIds = watch("feature_option_ids") || [];
  const name = watch("name");
  const city = watch("city");
  const price = watch("price");

  const {
    serverErrors,
    showErrorPanel,
    setShowErrorPanel,
    clearErrors: clearServerErrors,
    handleServerError,
  } = useServerErrors<FormValues>({ setError });
  const fieldLabels = createFieldLabels({
    name: "Nom",
    address: "Adresse",
    city: "Ville",
    country: "Pays",
    price: "Prix",
    type: "Type",
    standing: "Standing",
    max_guests: "Invités",
    feature_option_ids: "Équipements",
  });

  useEffect(() => {
    if (onServerError) onServerError(handleServerError);
  }, [onServerError, handleServerError]);

  const [localAddressValue, setLocalAddressValue] = useState(defaultValues?.address || "");
  const [addressSelected, setAddressSelected] = useState(() => Boolean(defaultValues?.address?.trim()));
  const [showSuggestions, setShowSuggestions] = useState(false);
  const addressInputRef = useRef<HTMLDivElement>(null);
  const { suggestions, loading: loadingAddress, formatAddress, error: addressError } =
    useAddressAutocomplete(addressSelected ? "" : localAddressValue, 200);

  useEffect(() => {
    if (addressSelected) {
      setShowSuggestions(false);
      return;
    }
    setShowSuggestions(localAddressValue.trim().length >= 2);
  }, [suggestions.length, loadingAddress, addressError, localAddressValue, addressSelected]);

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    if (defaultValues?.main_image_url) setMainImagePreview(defaultValues.main_image_url);
    if (defaultValues?.gallery_images) {
      setGalleryPreviews(
        defaultValues.gallery_images
          .map((img) => (typeof img === "string" ? img : img.url || ""))
          .filter(Boolean)
      );
    }
  }, [defaultValues]);

  const handleAddressSelect = (suggestion: AddressSuggestion) => {
    const props = suggestion.properties;
    const [lon, lat] = suggestion.geometry.coordinates;
    const formattedAddress = formatAddress(suggestion);
    setLocalAddressValue(formattedAddress);
    setValue("address", formattedAddress);
    setValue("city", props.city || props.name || "");
    setValue("country", props.country || "Côte d'Ivoire");
    setValue("latitude", lat ? Number(lat) : null);
    setValue("longitude", lon ? Number(lon) : null);
    setAddressSelected(true);
    setShowSuggestions(false);
  };

  const validateImages = () => {
    const hasImages =
      !!mainImage ||
      !!mainImagePreview ||
      galleryImages.length > 0 ||
      galleryPreviews.length > 0;
    if (!hasImages) {
      setImageError("Au moins une image est requise");
      return false;
    }
    setImageError("");
    return true;
  };

  const goNext = async () => {
    if (step === 0) {
      const ok = await trigger(["name", "address", "city", "country"]);
      if (!ok) return;
    } else if (step === 1) {
      const ok = await trigger(["type", "standing", "price", "max_guests"]);
      if (!ok) return;
    } else if (step === 2) {
      if (!validateImages()) return;
    } else if (step === 3) {
      const ok = await trigger(["feature_option_ids"]);
      if (!ok) return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const finish = (data: FormValues) => {
    clearServerErrors();
    if (!validateImages()) {
      setStep(2);
      return;
    }
    onSubmit(
      {
        name: data.name,
        description: data.description || undefined,
        address: data.address,
        city: data.city,
        country: data.country,
        latitude:
          data.latitude !== null && data.latitude !== undefined ? String(data.latitude) : undefined,
        longitude:
          data.longitude !== null && data.longitude !== undefined
            ? String(data.longitude)
            : undefined,
        type: data.type,
        max_guests: data.max_guests,
        bedrooms: data.bedrooms ?? null,
        bathrooms: data.bathrooms ?? null,
        piece_number: data.piece_number ?? null,
        price: String(data.price),
        standing: data.standing,
        owner_id: data.owner_id,
        feature_option_ids: selectedFeatureOptionIds,
      },
      { mainImage, galleryImages }
    );
  };

  return (
    // @ts-expect-error rhf types
    <form onSubmit={handleSubmit(finish)} className="space-y-4">
      <ServerErrorPanel
        errors={serverErrors}
        fieldLabels={fieldLabels}
        show={showErrorPanel}
        onClose={() => {
          setShowErrorPanel(false);
          clearServerErrors();
          clearFormErrors();
        }}
      />

      <StepFormShell
        steps={STEPS}
        currentStep={step}
        onStepChange={setStep}
        isFirst={step === 0}
        isLast={step === STEPS.length - 1}
        isLoading={isLoading}
        onBack={() => (step === 0 ? onCancel() : setStep((s) => s - 1))}
        onNext={goNext}
        // @ts-expect-error rhf/zod resolver typing
        onSubmit={() => handleSubmit(finish)()}
        submitLabel={defaultValues ? "Enregistrer" : "Publier la résidence"}
      >
        {step === 0 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nom *</Label>
              <Input {...register("name")} className="h-11 rounded-none" placeholder="Résidence Les Palmiers" />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea {...register("description")} rows={4} className="rounded-none" />
            </div>
            <div className="relative space-y-1.5" ref={addressInputRef}>
              <Label>Adresse *</Label>
              <div className="relative">
                <Input
                  value={localAddressValue}
                  onChange={(e) => {
                    setLocalAddressValue(e.target.value);
                    setValue("address", e.target.value);
                    setAddressSelected(false);
                  }}
                  className="h-11 rounded-none pr-10"
                  placeholder="Commencez à taper…"
                />
                <MapPin className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
              {showSuggestions && !addressSelected && suggestions.length > 0 && (
                <div className="absolute z-20 mt-1 w-full border border-slate-200 bg-white shadow-lg">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                      onClick={() => handleAddressSelect(s)}
                    >
                      {formatAddress(s)}
                    </button>
                  ))}
                </div>
              )}
              {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Ville *</Label>
                <Input {...register("city")} className="h-11 rounded-none" />
                {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Pays *</Label>
                <Input {...register("country")} className="h-11 rounded-none" />
                {errors.country && <p className="text-xs text-red-500">{errors.country.message}</p>}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Type *</Label>
                <Select value={type} onValueChange={(v) => setValue("type", v as FormValues["type"])}>
                  <SelectTrigger className="!h-11 w-full rounded-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["STUDIO", "APPARTEMENT", "VILLA", "PENTHOUSE", "DUPLEX", "TRIPLEX"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Standing *</Label>
                <Select
                  value={standing}
                  onValueChange={(v) => setValue("standing", v as FormValues["standing"])}
                >
                  <SelectTrigger className="!h-11 w-full rounded-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "STANDARD",
                      "SUPERIEUR",
                      "DELUXE",
                      "EXECUTIVE",
                      "SUITE",
                      "SUITE_JUNIOR",
                      "SUITE_EXECUTIVE",
                      "SUITE_PRESIDENTIELLE",
                    ].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Prix / nuit (FCFA) *</Label>
              <Input type="number" {...register("price")} className="h-11 rounded-none" />
              {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
            </div>
            <div className={`grid gap-4 ${type !== "STUDIO" ? "sm:grid-cols-4" : "sm:grid-cols-1"}`}>
              <div className="space-y-1.5">
                <Label>Invités max *</Label>
                <Input type="number" {...register("max_guests", { valueAsNumber: true })} className="h-11 rounded-none" />
              </div>
              {type !== "STUDIO" && (
                <>
                  <div className="space-y-1.5">
                    <Label>Chambres</Label>
                    <Input type="number" {...register("bedrooms", { valueAsNumber: true })} className="h-11 rounded-none" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>SDB</Label>
                    <Input type="number" {...register("bathrooms", { valueAsNumber: true })} className="h-11 rounded-none" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Pièces</Label>
                    <Input type="number" {...register("piece_number", { valueAsNumber: true })} className="h-11 rounded-none" />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {(mainImagePreview || galleryPreviews.length > 0) && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {mainImagePreview && (
                  <div className="relative aspect-square overflow-hidden border border-slate-200">
                    <Image src={mainImagePreview} alt="" fill className="object-cover" unoptimized />
                    <Button type="button" size="sm" variant="destructive" className="absolute right-1 top-1 h-6 w-6 rounded-none p-0" onClick={() => { setMainImage(null); setMainImagePreview(null); }}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {galleryPreviews.map((p, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden border border-slate-200">
                    <Image src={p} alt="" fill className="object-cover" unoptimized />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute right-1 top-1 h-6 w-6 rounded-none p-0"
                      onClick={() => {
                        setGalleryImages((prev) => prev.filter((_, idx) => idx !== i));
                        setGalleryPreviews((prev) => prev.filter((_, idx) => idx !== i));
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <label className={`flex h-32 cursor-pointer flex-col items-center justify-center border-2 border-dashed ${imageError ? "border-red-400" : "border-slate-200"} bg-slate-50`}>
              <ImageIcon className="mb-2 h-6 w-6 text-slate-400" />
              <span className="text-xs text-slate-500">Ajouter des photos</span>
              <Input
                type="file"
                accept={ACCEPTED_IMAGE_TYPES}
                multiple
                className="hidden"
                onChange={(e) => {
                  setImageError("");
                  const files = Array.from(e.target.files || []);
                  if (!files.length) return;
                  setMainImage(files[0]);
                  const reader = new FileReader();
                  reader.onloadend = () => setMainImagePreview(reader.result as string);
                  reader.readAsDataURL(files[0]);
                  if (files.length > 1) {
                    const rest = files.slice(1);
                    setGalleryImages((prev) => [...prev, ...rest]);
                    rest.forEach((file) => {
                      const r = new FileReader();
                      r.onloadend = () => setGalleryPreviews((prev) => [...prev, r.result as string]);
                      r.readAsDataURL(file);
                    });
                  }
                }}
              />
            </label>
            {imageError && <p className="text-xs text-red-500">{imageError}</p>}
          </div>
        )}

        {step === 3 && (
          <FeatureOptionsPicker
            establishmentType="RESIDENCE"
            selectedIds={selectedFeatureOptionIds}
            onChange={(ids) => setValue("feature_option_ids", ids)}
            error={errors.feature_option_ids?.message}
          />
        )}

        {step === 4 && (
          <div className="space-y-4 text-sm text-slate-700">
            <p>
              <span className="text-slate-400">Nom · </span>
              <span className="font-medium text-slate-900">{name || "—"}</span>
            </p>
            <p>
              <span className="text-slate-400">Ville · </span>
              {city || "—"}
            </p>
            <p>
              <span className="text-slate-400">Prix · </span>
              {price ? `${price} FCFA / nuit` : "—"}
            </p>
            <p>
              <span className="text-slate-400">Type · </span>
              {type} · {standing}
            </p>
            <p>
              <span className="text-slate-400">Équipements · </span>
              {selectedFeatureOptionIds.length} sélectionné(s)
            </p>
            <p>
              <span className="text-slate-400">Photos · </span>
              {(mainImagePreview ? 1 : 0) + galleryPreviews.length} image(s)
            </p>
            <p className="border border-slate-100 bg-slate-50 px-3 py-3 text-xs text-slate-500">
              Vérifiez ces informations puis publiez. Vous pourrez modifier la fiche ensuite.
            </p>
          </div>
        )}
      </StepFormShell>
    </form>
  );
}
