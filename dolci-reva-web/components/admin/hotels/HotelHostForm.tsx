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
import { HotelFormData } from "@/hooks/use-hotels";
import { FeatureOptionsPicker } from "@/components/admin/shared/FeatureOptionsPicker";
import { useAddressAutocomplete } from "@/hooks/use-address-autocomplete";
import type { AddressSuggestion } from "@/hooks/use-address-autocomplete";
import { X, Image as ImageIcon, MapPin, Star } from "lucide-react";
import { ServerErrorPanel } from "@/components/ui/ServerErrorPanel";
import { useServerErrors } from "@/hooks/use-server-errors";
import { createFieldLabels } from "@/lib/server-error-utils";
import { StepFormShell, type FormStep } from "@/components/admin/host/StepFormShell";

const hotelSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(255),
  description: z.string().max(2000).optional().or(z.literal("")),
  address: z.string().min(1, "L'adresse est requise").max(500),
  city: z.string().min(1, "La ville est requise").max(100),
  country: z.string().min(1, "Le pays est requis").max(100),
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
  star_rating: z
    .number()
    .int()
    .min(1, "Choisissez au moins 1 étoile")
    .max(5)
    .nullable()
    .optional(),
  owner_id: z.number().optional(),
  feature_option_ids: z
    .array(z.number().int())
    .min(1, "Sélectionnez au moins un équipement")
    .max(20, "Maximum 20 équipements"),
});

type FormValues = z.infer<typeof hotelSchema>;

const STEPS: FormStep[] = [
  { id: "identity", title: "Identité", description: "Nom et standing" },
  { id: "location", title: "Localisation", description: "Adresse de l'hôtel" },
  { id: "features", title: "Équipements", description: "Services proposés" },
  { id: "photos", title: "Photos", description: "Galerie de l'hôtel" },
  { id: "publish", title: "Publication", description: "Vérifier et publier" },
];

interface Props {
  onSubmit: (
    data: HotelFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ) => void;
  onCancel: () => void;
  defaultValues?: HotelFormData & {
    main_image_url?: string | null;
    gallery_images?: Array<{ url?: string } | string>;
  };
  isLoading?: boolean;
  onServerError?: (
    handleServerError: (error: unknown) => {
      errorMessage: string;
      hasDetailedErrors: boolean;
    }
  ) => void;
}

export function HotelHostForm({
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
    // @ts-expect-error rhf/zod
    resolver: zodResolver(hotelSchema),
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          description: defaultValues.description || "",
          address: defaultValues.address,
          city: defaultValues.city,
          country: defaultValues.country,
          latitude: defaultValues.latitude ? Number(defaultValues.latitude) : null,
          longitude: defaultValues.longitude ? Number(defaultValues.longitude) : null,
          star_rating: defaultValues.star_rating ?? null,
          owner_id: defaultValues.owner_id,
          feature_option_ids: defaultValues.feature_option_ids || [],
        }
      : {
          name: "",
          description: "",
          address: "",
          city: "",
          country: "",
          latitude: null,
          longitude: null,
          star_rating: null,
          feature_option_ids: [],
        },
  });

  const starRating = watch("star_rating");
  const selectedFeatureOptionIds = watch("feature_option_ids") || [];
  const name = watch("name");
  const city = watch("city");
  const country = watch("country");
  const address = watch("address");

  const fieldLabels = createFieldLabels({
    name: "Nom",
    description: "Description",
    address: "Adresse",
    city: "Ville",
    country: "Pays",
    star_rating: "Étoiles",
    feature_option_ids: "Équipements",
  });

  const {
    serverErrors,
    showErrorPanel,
    handleServerError,
    clearErrors: clearServerErrors,
    setShowErrorPanel,
  } = useServerErrors<FormValues>({
    setError,
    fieldMapping: {
      name: "name",
      description: "description",
      address: "address",
      city: "city",
      country: "country",
      star_rating: "star_rating",
      feature_option_ids: "feature_option_ids",
    },
  });

  useEffect(() => {
    if (onServerError) onServerError(handleServerError);
  }, [handleServerError, onServerError]);

  const [localAddressValue, setLocalAddressValue] = useState(
    defaultValues?.address || ""
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addressSelected, setAddressSelected] = useState(() => Boolean(defaultValues?.address?.trim()));
  const addressInputRef = useRef<HTMLDivElement>(null);
  const { suggestions, loading: loadingAddress, formatAddress } =
    useAddressAutocomplete(addressSelected ? "" : localAddressValue, 200);

  useEffect(() => {
    if (addressSelected) {
      setShowSuggestions(false);
      return;
    }
    setShowSuggestions(localAddressValue.trim().length >= 2);
  }, [suggestions.length, loadingAddress, localAddressValue, addressSelected]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        addressInputRef.current &&
        !addressInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    if (defaultValues?.main_image_url)
      setMainImagePreview(defaultValues.main_image_url);
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
      const ok = await trigger(["name", "description", "star_rating"]);
      if (!ok) return;
    } else if (step === 1) {
      const ok = await trigger(["address", "city", "country"]);
      if (!ok) return;
    } else if (step === 2) {
      const ok = await trigger(["feature_option_ids"]);
      if (!ok) return;
    } else if (step === 3) {
      if (!validateImages()) return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const finish = (data: FormValues) => {
    clearServerErrors();
    if (!validateImages()) {
      setStep(3);
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
          data.latitude != null ? String(data.latitude) : undefined,
        longitude:
          data.longitude != null ? String(data.longitude) : undefined,
        star_rating: data.star_rating ?? undefined,
        owner_id: data.owner_id,
        feature_option_ids: selectedFeatureOptionIds,
      },
      { mainImage, galleryImages }
    );
  };

  const inputClass = "h-11 rounded-none border-slate-200";

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
        submitLabel={defaultValues ? "Enregistrer" : "Publier l'hôtel"}
      >
        {step === 0 && (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-800">
                Nom de l&apos;hôtel <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("name")}
                className={inputClass}
                placeholder="Exemple : Hôtel Les Palmiers"
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-800">
                Nombre d&apos;étoiles
              </Label>
              <Select
                value={starRating != null ? String(starRating) : undefined}
                onValueChange={(v) => setValue("star_rating", Number(v))}
              >
                <SelectTrigger className={`!h-11 w-full ${inputClass}`}>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      <span className="inline-flex items-center gap-1.5">
                        {Array.from({ length: n }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                          />
                        ))}
                        <span className="text-slate-600">
                          {n} étoile{n > 1 ? "s" : ""}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-800">
                Description
              </Label>
              <Textarea
                {...register("description")}
                rows={5}
                className="rounded-none border-slate-200"
                placeholder="Décrivez l'ambiance, les points forts, le cadre…"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div className="relative space-y-1.5" ref={addressInputRef}>
              <Label className="text-sm font-semibold text-slate-800">
                Adresse <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  value={localAddressValue}
                  onChange={(e) => {
                    setLocalAddressValue(e.target.value);
                    setValue("address", e.target.value);
                    setAddressSelected(false);
                  }}
                  className={`${inputClass} pr-10`}
                  placeholder="Commencez à taper une adresse"
                />
                <MapPin className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
              {showSuggestions && !addressSelected && suggestions.length > 0 && (
                <div className="absolute z-20 mt-1 w-full border border-slate-200 bg-white shadow-lg">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      className="block w-full px-3 py-2.5 text-left text-sm hover:bg-[#fffaf5]"
                      onClick={() => handleAddressSelect(s)}
                    >
                      {formatAddress(s)}
                    </button>
                  ))}
                </div>
              )}
              {errors.address && (
                <p className="text-xs text-red-500">{errors.address.message}</p>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-800">
                  Ville <span className="text-red-500">*</span>
                </Label>
                <Input {...register("city")} className={inputClass} />
                {errors.city && (
                  <p className="text-xs text-red-500">{errors.city.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-800">
                  Pays <span className="text-red-500">*</span>
                </Label>
                <Input {...register("country")} className={inputClass} />
                {errors.country && (
                  <p className="text-xs text-red-500">{errors.country.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">
              Sélectionnez les équipements et services proposés par votre hôtel
              (1 à 20).
            </p>
            <FeatureOptionsPicker
              establishmentType="HOTEL"
              selectedIds={selectedFeatureOptionIds}
              onChange={(ids) => setValue("feature_option_ids", ids)}
              error={errors.feature_option_ids?.message}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            {(mainImagePreview || galleryPreviews.length > 0) && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {mainImagePreview && (
                  <div className="relative aspect-[4/3] overflow-hidden border border-slate-200">
                    <Image
                      src={mainImagePreview}
                      alt="Principale"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <span className="absolute left-1.5 top-1.5 bg-[#f08400] px-1.5 py-0.5 text-[10px] font-bold text-white">
                      Principale
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setMainImage(null);
                        setMainImagePreview(null);
                      }}
                      className="absolute right-1.5 top-1.5 bg-red-500 p-1 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {galleryPreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative aspect-[4/3] overflow-hidden border border-slate-200"
                  >
                    <Image
                      src={preview}
                      alt={`Galerie ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setGalleryImages((p) => p.filter((_, i) => i !== index));
                        setGalleryPreviews((p) => p.filter((_, i) => i !== index));
                      }}
                      className="absolute right-1.5 top-1.5 bg-red-500 p-1 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label
              htmlFor="hotel-images"
              className={`flex cursor-pointer flex-col items-center justify-center border-2 border-dashed py-10 transition-colors hover:bg-[#fffaf5] ${
                imageError ? "border-red-400" : "border-[#f08400]/30"
              }`}
            >
              <ImageIcon className="mb-2 h-8 w-8 text-[#f08400]" />
              <p className="text-sm font-semibold text-slate-700">
                Ajouter des photos
              </p>
              <p className="mt-1 text-xs text-slate-400">
                PNG, JPG · max. 10 · la 1ʳᵉ devient principale
              </p>
              <Input
                id="hotel-images"
                type="file"
                accept={ACCEPTED_IMAGE_TYPES}
                multiple
                className="hidden"
                onChange={(e) => {
                  setImageError("");
                  const files = Array.from(e.target.files || []);
                  if (files.length === 0) return;
                  const first = files[0];
                  setMainImage(first);
                  const reader = new FileReader();
                  reader.onloadend = () =>
                    setMainImagePreview(reader.result as string);
                  reader.readAsDataURL(first);
                  if (files.length > 1) {
                    const rest = files.slice(1);
                    setGalleryImages((prev) => [...prev, ...rest]);
                    rest.forEach((file) => {
                      const r = new FileReader();
                      r.onloadend = () =>
                        setGalleryPreviews((prev) => [
                          ...prev,
                          r.result as string,
                        ]);
                      r.readAsDataURL(file);
                    });
                  }
                }}
              />
            </label>
            {imageError && (
              <p className="text-xs text-red-500">{imageError}</p>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <div className="border border-[#f08400]/20 bg-gradient-to-br from-[#fff4e8] to-white p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f08400]">
                Récapitulatif
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">
                {name || "Sans nom"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {[address, city, country].filter(Boolean).join(", ") ||
                  "Adresse non renseignée"}
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                {starRating != null && (
                  <span className="inline-flex items-center gap-1 border border-[#f08400]/20 bg-white px-2.5 py-1">
                    {Array.from({ length: starRating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </span>
                )}
                <span className="border border-[#f08400]/20 bg-white px-2.5 py-1">
                  {selectedFeatureOptionIds.length} équipement
                  {selectedFeatureOptionIds.length > 1 ? "s" : ""}
                </span>
                <span className="border border-[#f08400]/20 bg-white px-2.5 py-1">
                  {(mainImagePreview ? 1 : 0) + galleryPreviews.length} photo
                  {(mainImagePreview ? 1 : 0) + galleryPreviews.length > 1
                    ? "s"
                    : ""}
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-500">
              Vérifiez les informations puis publiez. Vous pourrez ensuite
              ajouter les chambres de l&apos;hôtel.
            </p>
          </div>
        )}
      </StepFormShell>
    </form>
  );
}
