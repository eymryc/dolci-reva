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
import type {
  RestaurantFormData,
  OpeningHours,
} from "@/types/entities/restaurant.types";
import { FeatureOptionsPicker } from "@/components/admin/shared/FeatureOptionsPicker";
import { useAddressAutocomplete } from "@/hooks/use-address-autocomplete";
import type { AddressSuggestion } from "@/hooks/use-address-autocomplete";
import { X, Image as ImageIcon, MapPin, Clock } from "lucide-react";
import { ServerErrorPanel } from "@/components/ui/ServerErrorPanel";
import { useServerErrors } from "@/hooks/use-server-errors";
import { createFieldLabels } from "@/lib/server-error-utils";
import { StepFormShell, type FormStep } from "@/components/admin/host/StepFormShell";

const restaurantSchema = z.object({
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
  feature_option_ids: z.array(z.number().int()).optional(),
});

type FormValues = z.infer<typeof restaurantSchema>;

const STEPS: FormStep[] = [
  { id: "identity", title: "Identité", description: "Nom et description" },
  { id: "location", title: "Localisation", description: "Adresse et horaires" },
  { id: "features", title: "Équipements", description: "Services proposés" },
  { id: "photos", title: "Photos", description: "Galerie du restaurant" },
  { id: "publish", title: "Publication", description: "Vérifier et publier" },
];

const DAYS = [
  { key: "monday", label: "Lundi" },
  { key: "tuesday", label: "Mardi" },
  { key: "wednesday", label: "Mercredi" },
  { key: "thursday", label: "Jeudi" },
  { key: "friday", label: "Vendredi" },
  { key: "saturday", label: "Samedi" },
  { key: "sunday", label: "Dimanche" },
] as const;

interface Props {
  onSubmit: (
    data: RestaurantFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ) => void;
  onCancel: () => void;
  defaultValues?: RestaurantFormData & {
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

export function RestaurantHostForm({
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
    resolver: zodResolver(restaurantSchema),
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          description: defaultValues.description || "",
          address: defaultValues.address,
          city: defaultValues.city,
          country: defaultValues.country,
          latitude: defaultValues.latitude
            ? Number(defaultValues.latitude)
            : null,
          longitude: defaultValues.longitude
            ? Number(defaultValues.longitude)
            : null,
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
          feature_option_ids: [],
        },
  });

  const selectedFeatureOptionIds = watch("feature_option_ids") || [];
  const name = watch("name");
  const city = watch("city");
  const country = watch("country");
  const address = watch("address");

  const [openingHours, setOpeningHours] = useState<OpeningHours>(
    defaultValues?.opening_hours || {}
  );

  const fieldLabels = createFieldLabels({
    name: "Nom",
    description: "Description",
    address: "Adresse",
    city: "Ville",
    country: "Pays",
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

  const handleDayHoursChange = (
    day: string,
    field: "open" | "close",
    value: string
  ) => {
    setOpeningHours((prev) => ({
      ...prev,
      [day]: { ...prev[day as keyof OpeningHours], [field]: value },
    }));
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
      const ok = await trigger(["name", "description"]);
      if (!ok) return;
    } else if (step === 1) {
      const ok = await trigger(["address", "city", "country"]);
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
        opening_hours:
          Object.keys(openingHours).length > 0 ? openingHours : undefined,
        feature_option_ids: selectedFeatureOptionIds,
      },
      { mainImage, galleryImages }
    );
  };

  const inputClass = "h-11 rounded-none border-slate-200";
  const photoCount =
    (mainImagePreview ? 1 : 0) + galleryPreviews.length;

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
        submitLabel={defaultValues ? "Enregistrer" : "Publier le restaurant"}
      >
        {step === 0 && (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-800">
                Nom du restaurant <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("name")}
                className={inputClass}
                placeholder="Exemple : Restaurant Le Gourmet"
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-800">
                Description
              </Label>
              <Textarea
                {...register("description")}
                rows={5}
                className="rounded-none border-slate-200"
                placeholder="Cuisine, ambiance, spécialités…"
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

            <div className="space-y-3 border border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500" />
                <Label className="text-sm font-semibold text-slate-800">
                  Horaires d&apos;ouverture
                </Label>
              </div>
              <div className="space-y-2">
                {DAYS.map((day) => {
                  const dayHours = openingHours[day.key as keyof OpeningHours];
                  return (
                    <div
                      key={day.key}
                      className="grid grid-cols-3 items-center gap-2"
                    >
                      <Label className="text-xs text-slate-600">
                        {day.label}
                      </Label>
                      <Input
                        type="time"
                        value={dayHours?.open || ""}
                        onChange={(e) =>
                          handleDayHoursChange(day.key, "open", e.target.value)
                        }
                        className="h-9 rounded-none border-slate-200 text-xs"
                      />
                      <Input
                        type="time"
                        value={dayHours?.close || ""}
                        onChange={(e) =>
                          handleDayHoursChange(day.key, "close", e.target.value)
                        }
                        className="h-9 rounded-none border-slate-200 text-xs"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">
              Sélectionnez les équipements et services de votre restaurant.
            </p>
            <FeatureOptionsPicker
              establishmentType="RESTAURANT"
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
                        setGalleryPreviews((p) =>
                          p.filter((_, i) => i !== index)
                        );
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
              htmlFor="restaurant-images"
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
                id="restaurant-images"
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
                <span className="border border-[#f08400]/20 bg-white px-2.5 py-1">
                  {selectedFeatureOptionIds.length} équipement
                  {selectedFeatureOptionIds.length > 1 ? "s" : ""}
                </span>
                <span className="border border-[#f08400]/20 bg-white px-2.5 py-1">
                  {photoCount} photo{photoCount > 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-500">
              Vérifiez les informations puis publiez. Vous pourrez ensuite
              gérer les tables depuis le dossier.
            </p>
          </div>
        )}
      </StepFormShell>
    </form>
  );
}
