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
import PhoneInput from "@/components/ui/PhoneInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DwellingFormData } from "@/hooks/use-dwellings";
import { useAddressAutocomplete } from "@/hooks/use-address-autocomplete";
import type { AddressSuggestion } from "@/hooks/use-address-autocomplete";
import { X, Image as ImageIcon, MapPin } from "lucide-react";
import { ServerErrorPanel } from "@/components/ui/ServerErrorPanel";
import { useServerErrors } from "@/hooks/use-server-errors";
import { createFieldLabels } from "@/lib/server-error-utils";
import { StepFormShell, type FormStep } from "@/components/admin/host/StepFormShell";

const dwellingSchema = z.object({
  phone: z.string().min(8, "Le numéro de téléphone est invalide"),
  whatsapp: z.string().min(8, "Le numéro WhatsApp est invalide"),
  security_deposit_month_number: z
    .number()
    .int()
    .min(0)
    .max(12)
    .nullable()
    .optional(),
  visite_price: z.string().min(1, "Le prix de visite est requis"),
  rent_advance_amount_number: z
    .number()
    .int()
    .min(0)
    .max(12)
    .nullable()
    .optional(),
  rent: z.string().min(1, "Le loyer est requis"),
  description: z.string().min(1, "La description est requise").max(2000),
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
  type: z.enum([
    "STUDIO",
    "APPARTEMENT",
    "VILLA",
    "PENTHOUSE",
    "DUPLEX",
    "TRIPLEX",
  ]),
  rooms: z.number().int().min(0).max(20).nullable().optional(),
  bathrooms: z.number().int().min(0).max(20).nullable().optional(),
  piece_number: z.number().int().min(1).nullable().optional(),
  living_room: z.number().int().min(0).max(20).nullable().optional(),
  structure_type: z.enum(["MAISON_BASSE", "IMMEUBLE"]),
  construction_type: z.enum(["NOUVELLE_CONSTRUCTION", "ANCIENNE"]),
  agency_fees_month_number: z
    .number()
    .int()
    .min(0)
    .max(12)
    .nullable()
    .optional(),
  owner_id: z.number().optional(),
});

type FormValues = z.infer<typeof dwellingSchema>;

const STEPS: FormStep[] = [
  { id: "contact", title: "Contact", description: "Coordonnées" },
  { id: "finances", title: "Finances", description: "Loyer et frais" },
  { id: "location", title: "Localisation", description: "Adresse" },
  { id: "details", title: "Bien", description: "Caractéristiques" },
  { id: "photos", title: "Photos", description: "Galerie" },
  { id: "publish", title: "Publication", description: "Vérifier et publier" },
];

const TYPE_LABELS: Record<string, string> = {
  STUDIO: "Studio",
  APPARTEMENT: "Appartement",
  VILLA: "Villa",
  PENTHOUSE: "Penthouse",
  DUPLEX: "Duplex",
  TRIPLEX: "Triplex",
};

const STRUCTURE_LABELS: Record<string, string> = {
  MAISON_BASSE: "Maison basse",
  IMMEUBLE: "Immeuble",
};

const CONSTRUCTION_LABELS: Record<string, string> = {
  NOUVELLE_CONSTRUCTION: "Nouvelle construction",
  ANCIENNE: "Ancienne",
};

interface Props {
  onSubmit: (
    data: DwellingFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ) => void;
  onCancel: () => void;
  defaultValues?: DwellingFormData & {
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

export function DwellingHostForm({
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
    resolver: zodResolver(dwellingSchema),
    defaultValues: defaultValues
      ? {
          phone: defaultValues.phone || "",
          whatsapp: defaultValues.whatsapp || "",
          security_deposit_month_number:
            defaultValues.security_deposit_month_number ?? null,
          visite_price: defaultValues.visite_price || "",
          rent_advance_amount_number:
            defaultValues.rent_advance_amount_number ?? null,
          rent: defaultValues.rent || "",
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
          type: defaultValues.type as FormValues["type"],
          rooms: defaultValues.rooms ?? null,
          bathrooms: defaultValues.bathrooms ?? null,
          piece_number: defaultValues.piece_number ?? null,
          living_room: defaultValues.living_room ?? null,
          structure_type:
            defaultValues.structure_type as FormValues["structure_type"],
          construction_type:
            defaultValues.construction_type as FormValues["construction_type"],
          agency_fees_month_number:
            defaultValues.agency_fees_month_number ?? null,
          owner_id: defaultValues.owner_id,
        }
      : {
          phone: "",
          whatsapp: "",
          security_deposit_month_number: null,
          visite_price: "",
          rent_advance_amount_number: null,
          rent: "",
          description: "",
          address: "",
          city: "",
          country: "",
          latitude: null,
          longitude: null,
          type: "APPARTEMENT",
          rooms: null,
          bathrooms: null,
          piece_number: null,
          living_room: null,
          structure_type: "IMMEUBLE",
          construction_type: "NOUVELLE_CONSTRUCTION",
          agency_fees_month_number: null,
        },
  });

  const dwellingType = watch("type");
  const structureType = watch("structure_type");
  const constructionType = watch("construction_type");
  const rent = watch("rent");
  const city = watch("city");
  const country = watch("country");
  const address = watch("address");
  const isStudio = dwellingType === "STUDIO";

  const fieldLabels = createFieldLabels({
    phone: "Téléphone",
    whatsapp: "WhatsApp",
    rent: "Loyer",
    visite_price: "Prix de visite",
    description: "Description",
    address: "Adresse",
    city: "Ville",
    country: "Pays",
    type: "Type",
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
      phone: "phone",
      whatsapp: "whatsapp",
      rent: "rent",
      visite_price: "visite_price",
      description: "description",
      address: "address",
      city: "city",
      country: "country",
      type: "type",
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
      const ok = await trigger(["phone", "whatsapp", "description"]);
      if (!ok) return;
    } else if (step === 1) {
      const ok = await trigger([
        "rent",
        "visite_price",
        "security_deposit_month_number",
        "rent_advance_amount_number",
      ]);
      if (!ok) return;
    } else if (step === 2) {
      const ok = await trigger(["address", "city", "country"]);
      if (!ok) return;
    } else if (step === 3) {
      const ok = await trigger([
        "type",
        "structure_type",
        "construction_type",
      ]);
      if (!ok) return;
    } else if (step === 4) {
      if (!validateImages()) return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const finish = (data: FormValues) => {
    clearServerErrors();
    if (!validateImages()) {
      setStep(4);
      return;
    }
    onSubmit(
      {
        phone: data.phone,
        whatsapp: data.whatsapp,
        security_deposit_month_number:
          data.security_deposit_month_number ?? 0,
        visite_price: data.visite_price,
        rent_advance_amount_number: data.rent_advance_amount_number ?? 0,
        rent: data.rent,
        description: data.description,
        address: data.address,
        city: data.city,
        country: data.country,
        latitude:
          data.latitude != null ? String(data.latitude) : undefined,
        longitude:
          data.longitude != null ? String(data.longitude) : undefined,
        type: data.type,
        rooms: isStudio ? null : data.rooms,
        bathrooms: isStudio ? null : data.bathrooms,
        piece_number: isStudio ? null : data.piece_number,
        living_room: isStudio ? null : data.living_room,
        structure_type: data.structure_type,
        construction_type: data.construction_type,
        agency_fees_month_number: data.agency_fees_month_number ?? undefined,
        owner_id: data.owner_id,
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
        submitLabel={
          defaultValues ? "Enregistrer" : "Publier l'hébergement"
        }
      >
        {step === 0 && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-800">
                  Téléphone <span className="text-red-500">*</span>
                </Label>
                <PhoneInput
                  value={watch("phone") || ""}
                  onChange={(value) => {
                    setValue("phone", value, {
                      shouldValidate: false,
                      shouldDirty: true,
                    });
                  }}
                  placeholder="Entrez votre numéro"
                  defaultCountry="ci"
                  error={!!errors.phone}
                  className={inputClass}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500">{errors.phone.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-800">
                  WhatsApp <span className="text-red-500">*</span>
                </Label>
                <PhoneInput
                  value={watch("whatsapp") || ""}
                  onChange={(value) => {
                    setValue("whatsapp", value, {
                      shouldValidate: false,
                      shouldDirty: true,
                    });
                  }}
                  placeholder="Entrez votre numéro WhatsApp"
                  defaultCountry="ci"
                  error={!!errors.whatsapp}
                  className={inputClass}
                />
                {errors.whatsapp && (
                  <p className="text-xs text-red-500">{errors.whatsapp.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-800">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                {...register("description")}
                rows={5}
                className="rounded-none border-slate-200"
                placeholder="Décrivez le logement…"
              />
              {errors.description && (
                <p className="text-xs text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-800">
                  Loyer (FCFA) <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register("rent")}
                  className={inputClass}
                  placeholder="150000"
                />
                {errors.rent && (
                  <p className="text-xs text-red-500">{errors.rent.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-800">
                  Prix de visite (FCFA){" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register("visite_price")}
                  className={inputClass}
                  placeholder="5000"
                />
                {errors.visite_price && (
                  <p className="text-xs text-red-500">
                    {errors.visite_price.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-800">
                  Mois de caution
                </Label>
                <Input
                  type="number"
                  {...register("security_deposit_month_number", {
                    valueAsNumber: true,
                  })}
                  className={inputClass}
                  min={0}
                  max={12}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-800">
                  Mois d&apos;avance
                </Label>
                <Input
                  type="number"
                  {...register("rent_advance_amount_number", {
                    valueAsNumber: true,
                  })}
                  className={inputClass}
                  min={0}
                  max={12}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-800">
                  Mois de frais d&apos;agence
                </Label>
                <Input
                  type="number"
                  {...register("agency_fees_month_number", {
                    valueAsNumber: true,
                  })}
                  className={inputClass}
                  min={0}
                  max={12}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
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

        {step === 3 && (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-800">
                Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={dwellingType}
                onValueChange={(v) =>
                  setValue("type", v as FormValues["type"])
                }
              >
                <SelectTrigger className={`!h-11 w-full ${inputClass}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-800">
                  Structure <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={structureType}
                  onValueChange={(v) =>
                    setValue(
                      "structure_type",
                      v as FormValues["structure_type"]
                    )
                  }
                >
                  <SelectTrigger className={`!h-11 w-full ${inputClass}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STRUCTURE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-800">
                  Construction <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={constructionType}
                  onValueChange={(v) =>
                    setValue(
                      "construction_type",
                      v as FormValues["construction_type"]
                    )
                  }
                >
                  <SelectTrigger className={`!h-11 w-full ${inputClass}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CONSTRUCTION_LABELS).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {!isStudio && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-800">
                    Chambres
                  </Label>
                  <Input
                    type="number"
                    {...register("rooms", { valueAsNumber: true })}
                    className={inputClass}
                    min={0}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-800">
                    Salles de bain
                  </Label>
                  <Input
                    type="number"
                    {...register("bathrooms", { valueAsNumber: true })}
                    className={inputClass}
                    min={0}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-800">
                    Salons
                  </Label>
                  <Input
                    type="number"
                    {...register("living_room", { valueAsNumber: true })}
                    className={inputClass}
                    min={0}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-800">
                    Pièces
                  </Label>
                  <Input
                    type="number"
                    {...register("piece_number", { valueAsNumber: true })}
                    className={inputClass}
                    min={1}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
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
              htmlFor="dwelling-images"
              className={`flex cursor-pointer flex-col items-center justify-center border-2 border-dashed py-10 transition-colors hover:bg-[#fffaf5] ${
                imageError ? "border-red-400" : "border-[#f08400]/30"
              }`}
            >
              <ImageIcon className="mb-2 h-8 w-8 text-[#f08400]" />
              <p className="text-sm font-semibold text-slate-700">
                Ajouter des photos
              </p>
              <p className="mt-1 text-xs text-slate-400">
                PNG, JPG · la 1ʳᵉ devient principale
              </p>
              <Input
                id="dwelling-images"
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

        {step === 5 && (
          <div className="space-y-5">
            <div className="border border-[#f08400]/20 bg-gradient-to-br from-[#fff4e8] to-white p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f08400]">
                Récapitulatif
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">
                {TYPE_LABELS[dwellingType] || "Hébergement"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {[address, city, country].filter(Boolean).join(", ") ||
                  "Adresse non renseignée"}
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                {rent && (
                  <span className="border border-[#f08400]/20 bg-white px-2.5 py-1">
                    {rent} FCFA / mois
                  </span>
                )}
                <span className="border border-[#f08400]/20 bg-white px-2.5 py-1">
                  {STRUCTURE_LABELS[structureType]}
                </span>
                <span className="border border-[#f08400]/20 bg-white px-2.5 py-1">
                  {photoCount} photo{photoCount > 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-500">
              Vérifiez les informations puis publiez.
            </p>
          </div>
        )}
      </StepFormShell>
    </form>
  );
}
