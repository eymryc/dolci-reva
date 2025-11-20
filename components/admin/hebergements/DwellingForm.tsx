"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
import { useServerErrors } from "@/hooks/use-server-errors";

// Schema de validation
const dwellingSchema = z.object({
  phone: z.string().min(8, "Le numéro de téléphone est invalide"),
  whatsapp: z.string().min(8, "Le numéro WhatsApp est invalide"),
  security_deposit_month_number: z.number().int("Le nombre de mois de caution doit être un entier").min(0, "Le nombre de mois de caution doit être au moins 0").max(12, "Le nombre de mois de caution ne peut pas dépasser 12").nullable().optional(),
  visite_price: z.string().min(1, "Le prix de visite est requis").max(1000000000, "Le prix de visite ne peut pas dépasser 1000000000"),
  rent_advance_amount_number: z.number().int("Le nombre de mois d'avance doit être un entier").min(0, "Le nombre de mois d'avance doit être au moins 0").max(12, "Le nombre de mois d'avance ne peut pas dépasser 12").nullable().optional(),
  rent: z.string().min(1, "Le loyer est requis").max(1000000000, "Le loyer ne peut pas dépasser 1000000000"),
  description: z.string().min(1, "La description est requise").max(2000, "La description ne peut pas dépasser 2000 caractères"),
  address: z.string().min(1, "L'adresse est requise").max(500, "L'adresse ne peut pas dépasser 500 caractères"),
  city: z.string().min(1, "La ville est requise").max(100, "La ville ne peut pas dépasser 100 caractères"),
  country: z.string().min(1, "Le pays est requis").max(100, "Le pays ne peut pas dépasser 100 caractères"),
  latitude: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return null;
      const num = typeof val === "string" ? Number(val) : val;
      return isNaN(num as number) ? null : num;
    },
    z.number().min(-90, "La latitude doit être entre -90 et 90").max(90, "La latitude doit être entre -90 et 90").nullable().optional()
  ),
  longitude: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return null;
      const num = typeof val === "string" ? Number(val) : val;
      return isNaN(num as number) ? null : num;
    },
    z.number().min(-180, "La longitude doit être entre -180 et 180").max(180, "La longitude doit être entre -180 et 180").nullable().optional()
  ),
  type: z.enum(["STUDIO", "APPARTEMENT", "VILLA", "PENTHOUSE", "DUPLEX", "TRIPLEX"], {
    errorMap: () => ({ message: "Le type doit être : STUDIO, APPARTEMENT, VILLA, PENTHOUSE, DUPLEX ou TRIPLEX" }),
  }),
  rooms: z.number().int("Le nombre de chambres doit être un entier").min(0, "Le nombre de chambres doit être au moins 0").max(20, "Le nombre de chambres ne peut pas dépasser 20").nullable().optional(),
  bathrooms: z.number().int("Le nombre de salles de bain doit être un entier").min(0, "Le nombre de salles de bain doit être au moins 0").max(20, "Le nombre de salles de bain ne peut pas dépasser 20").nullable().optional(),
  piece_number: z.number().int("Le nombre de pièces doit être un entier").min(1, "Le nombre de pièces doit être au moins 1").nullable().optional(),
  living_room: z.number().int("Le nombre de salons doit être un entier").min(0, "Le nombre de salons doit être au moins 0").max(20, "Le nombre de salons ne peut pas dépasser 20").nullable().optional(),
  structure_type: z.enum(["MAISON_BASSE", "IMMEUBLE"], {
    errorMap: () => ({ message: "Le type de structure doit être : MAISON_BASSE ou IMMEUBLE" }),
  }),
  construction_type: z.enum(["NOUVELLE_CONSTRUCTION", "ANCIENNE"], {
    errorMap: () => ({ message: "Le type de construction doit être : NOUVELLE_CONSTRUCTION ou ANCIENNE" }),
  }),
  agency_fees_month_number: z.number().int("Le nombre de mois de frais d'agence doit être un entier").min(0, "Le nombre de mois de frais d'agence doit être au moins 0").max(12, "Le nombre de mois de frais d'agence ne peut pas dépasser 12").nullable().optional(),
  owner_id: z.number().optional(),
});

type DwellingFormValues = z.infer<typeof dwellingSchema>;

interface DwellingFormProps {
  onSubmit: (data: DwellingFormData, images?: { mainImage?: File | null; galleryImages?: File[] }) => void;
  onCancel: () => void;
  defaultValues?: DwellingFormData & {
    main_image_url?: string | null;
    gallery_images?: Array<{ url?: string } | string>;
  };
  isLoading?: boolean;
  onServerError?: (error: unknown) => { errorMessage: string; hasDetailedErrors: boolean };
}

export function DwellingForm({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading = false,
  onServerError,
}: DwellingFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<DwellingFormValues>({
    // @ts-expect-error - Type compatibility issue between react-hook-form and zod
    resolver: zodResolver(dwellingSchema),
    defaultValues: defaultValues ? {
      phone: defaultValues.phone || "",
      whatsapp: defaultValues.whatsapp || "",
      security_deposit_month_number: defaultValues.security_deposit_month_number ?? null,
      visite_price: defaultValues.visite_price || "",
      rent_advance_amount_number: defaultValues.rent_advance_amount_number ?? null,
      rent: defaultValues.rent || "",
      description: defaultValues.description || "",
      address: defaultValues.address,
      city: defaultValues.city,
      country: defaultValues.country,
      latitude: defaultValues.latitude ? Number(defaultValues.latitude) : null,
      longitude: defaultValues.longitude ? Number(defaultValues.longitude) : null,
      type: defaultValues.type as "STUDIO" | "APPARTEMENT" | "VILLA" | "PENTHOUSE" | "DUPLEX" | "TRIPLEX",
      rooms: defaultValues.rooms ?? null,
      bathrooms: defaultValues.bathrooms ?? null,
      piece_number: defaultValues.piece_number ?? null,
      living_room: defaultValues.living_room ?? null,
      structure_type: defaultValues.structure_type as "MAISON_BASSE" | "IMMEUBLE" || "MAISON_BASSE",
      construction_type: defaultValues.construction_type as "NOUVELLE_CONSTRUCTION" | "ANCIENNE" || "NOUVELLE_CONSTRUCTION",
      agency_fees_month_number: defaultValues.agency_fees_month_number ?? null,
      owner_id: defaultValues.owner_id,
    } : {
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
      type: "STUDIO",
      rooms: null,
      bathrooms: null,
      piece_number: null,
      living_room: null,
      structure_type: "MAISON_BASSE",
      construction_type: "NOUVELLE_CONSTRUCTION",
      agency_fees_month_number: null,
      owner_id: undefined,
    },
  });

  const type = watch("type");
  const structureType = watch("structure_type");
  const constructionType = watch("construction_type");

  // Mapping des champs
  const fieldMapping: Record<string, keyof DwellingFormValues> = {
    phone: "phone",
    whatsapp: "whatsapp",
    security_deposit_month_number: "security_deposit_month_number",
    visite_price: "visite_price",
    rent_advance_amount_number: "rent_advance_amount_number",
    rent: "rent",
    description: "description",
    address: "address",
    city: "city",
    country: "country",
    latitude: "latitude",
    longitude: "longitude",
    type: "type",
    rooms: "rooms",
    bathrooms: "bathrooms",
    piece_number: "piece_number",
    living_room: "living_room",
    structure_type: "structure_type",
    construction_type: "construction_type",
    agency_fees_month_number: "agency_fees_month_number",
    owner_id: "owner_id",
  };

  // Hook pour gérer les erreurs du serveur
  const { handleServerError } = useServerErrors<DwellingFormValues>({
    setError,
    fieldMapping,
  });

  // Exposer handleServerError au parent via callback
  React.useEffect(() => {
    if (onServerError) {
      // Créer un objet mutable pour stocker la fonction
      const errorHandler = {
        handle: handleServerError,
      };
      // Stocker dans window pour que le parent puisse y accéder
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__dwellingFormHandleServerError = errorHandler.handle;
    }
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).__dwellingFormHandleServerError;
    };
  }, [handleServerError, onServerError]);

  // États pour les images
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [imageError, setImageError] = useState("");

  // États pour l'autocomplétion d'adresse
  const addressInputRef = useRef<HTMLDivElement>(null);
  const [localAddressValue, setLocalAddressValue] = useState(defaultValues?.address || "");
  const [addressSelected, setAddressSelected] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { suggestions, loading: loadingAddress, error: addressError } = useAddressAutocomplete(
    localAddressValue,
    2
  );

  // Charger les images existantes si en mode édition
  useEffect(() => {
    if (defaultValues?.main_image_url) {
      setMainImagePreview(defaultValues.main_image_url);
    }
    if (defaultValues?.gallery_images && defaultValues.gallery_images.length > 0) {
      const galleryUrls = defaultValues.gallery_images.map((img) =>
        typeof img === "string" ? img : img.url || ""
      );
      setGalleryPreviews(galleryUrls);
    }
    if (defaultValues?.address) {
      setLocalAddressValue(defaultValues.address);
    }
  }, [defaultValues]);

  const removeMainImage = () => {
    setMainImage(null);
    setMainImagePreview(null);
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

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

  const formatAddress = (suggestion: AddressSuggestion): string => {
    const props = suggestion.properties;
    const parts = [props.name];
    if (props.street) parts.push(props.street);
    if (props.city && props.city !== props.name) parts.push(props.city);
    return parts.join(", ");
  };

  // Gérer les changements de fichiers
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setImageError("L'image principale ne peut pas dépasser 5 Mo");
        return;
      }
      setMainImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setImageError("");
    }
  };

  const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const validFiles = files.filter((file) => file.size <= 5 * 1024 * 1024);
      if (validFiles.length !== files.length) {
        setImageError("Certaines images dépassent 5 Mo et ont été ignorées");
      }
      setGalleryImages((prev) => [...prev, ...validFiles]);
      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setGalleryPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
      setImageError("");
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const mainFile = files[0];
      const galleryFiles = files.slice(1);
      if (mainFile) {
        const mainEvent = { target: { files: [mainFile] } } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleMainImageChange(mainEvent);
      }
      if (galleryFiles.length > 0) {
        const galleryEvent = { target: { files: galleryFiles } } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleGalleryImagesChange(galleryEvent);
      }
    }
  };

  const handleFormSubmit = (data: DwellingFormValues) => {
    clearErrors();
    
    // Validate images - en mode édition, on accepte les images existantes ou les nouvelles
    const hasExistingMainImage = mainImagePreview && !mainImage;
    const hasNewMainImage = mainImage;
    const hasExistingGalleryImages = galleryPreviews.length > 0 && galleryImages.length === 0;
    const hasNewGalleryImages = galleryImages.length > 0;
    
    // Si on est en mode édition et qu'il y a des images existantes, on accepte
    const hasImages = hasExistingMainImage || hasNewMainImage || hasExistingGalleryImages || hasNewGalleryImages;
    
    if (!hasImages) {
      setImageError("Au moins une image est requise");
      return;
    }
    
    // Calculer le total des nouvelles images uploadées
    const totalNewImages = (mainImage ? 1 : 0) + galleryImages.length;
    if (totalNewImages > 10) {
      setImageError("Vous ne pouvez pas uploader plus de 10 images");
      return;
    }
    setImageError("");

    // Convert form values to DwellingFormData format
    const formData: DwellingFormData = {
      phone: data.phone,
      whatsapp: data.whatsapp,
      security_deposit_month_number: data.security_deposit_month_number ?? 0,
      visite_price: String(data.visite_price),
      rent_advance_amount_number: data.rent_advance_amount_number ?? 0,
      rent: String(data.rent),
      description: data.description,
      address: data.address,
      city: data.city,
      country: data.country,
      latitude: data.latitude !== null && data.latitude !== undefined ? String(data.latitude) : undefined,
      longitude: data.longitude !== null && data.longitude !== undefined ? String(data.longitude) : undefined,
      type: data.type,
      rooms: data.rooms ?? null,
      bathrooms: data.bathrooms ?? null,
      piece_number: data.piece_number ?? null,
      living_room: data.living_room ?? null,
      structure_type: data.structure_type,
      construction_type: data.construction_type,
      agency_fees_month_number: data.agency_fees_month_number ?? undefined,
      owner_id: data.owner_id,
    };

    onSubmit(formData, {
      mainImage,
      galleryImages,
    });
  };

  return (
    // @ts-expect-error - Type compatibility issue between react-hook-form and zod
    <form onSubmit={handleSubmit(handleFormSubmit)} className="container mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-3 p-2 sm:p-3">
          {/* Champs téléphone et contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs sm:text-sm">
                Téléphone <span className="text-red-500">*</span>
              </Label>
              <PhoneInput
                onChange={(value) => {
                  if (value) {
                    setValue("phone", value, { shouldValidate: false });
                    setTimeout(() => {
                      setValue("phone", value, { shouldValidate: true });
                    }, 500);
                  }
                }}
                register={register("phone")}
                placeholder="Entrez votre numéro"
                defaultCountry="ci"
                error={!!errors.phone}
                className={`h-10 sm:h-12 border-2 text-xs sm:text-sm ${
                  errors.phone
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-200"
                }`}
              />
              {errors.phone && (
                <p className="text-xs sm:text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="whatsapp" className="text-xs sm:text-sm">
                WhatsApp <span className="text-red-500">*</span>
              </Label>
              <PhoneInput
                onChange={(value) => {
                  if (value) {
                    setValue("whatsapp", value, { shouldValidate: false });
                    setTimeout(() => {
                      setValue("whatsapp", value, { shouldValidate: true });
                    }, 500);
                  }
                }}
                register={register("whatsapp")}
                placeholder="Entrez votre numéro WhatsApp"
                defaultCountry="ci"
                error={!!errors.whatsapp}
                className={`h-10 sm:h-12 border-2 text-xs sm:text-sm ${
                  errors.whatsapp
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-200"
                }`}
              />
              {errors.whatsapp && (
                <p className="text-xs sm:text-sm text-red-500">{errors.whatsapp.message}</p>
              )}
            </div>
          </div>

          {/* Champs prix et loyer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="visite_price" className="text-sm">
                Prix de visite (FCFA) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="visite_price"
                type="number"
                step="0.01"
                placeholder="Exemple : 5000"
                {...register("visite_price")}
                className={`${errors.visite_price ? "border-red-500" : ""} h-10 sm:h-12 text-xs sm:text-sm`}
              />
              {errors.visite_price && (
                <p className="text-xs sm:text-sm text-red-500">{errors.visite_price.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rent" className="text-sm">
                Loyer (FCFA) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="rent"
                type="number"
                step="0.01"
                placeholder="Exemple : 150000"
                {...register("rent")}
                className={errors.rent ? "border-red-500 h-12" : "h-12"}
              />
              {errors.rent && (
                <p className="text-sm text-red-500">{errors.rent.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="security_deposit_month_number" className="text-sm">
                Nombre de mois de caution <span className="text-red-500">*</span>
              </Label>
              <Input
                id="security_deposit_month_number"
                type="number"
                min="0"
                max="12"
                placeholder="Exemple : 2 mois"
                {...register("security_deposit_month_number", { valueAsNumber: true })}
                className={errors.security_deposit_month_number ? "border-red-500 h-12" : "h-12"}
              />
              {errors.security_deposit_month_number && (
                <p className="text-sm text-red-500">{errors.security_deposit_month_number.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="rent_advance_amount_number" className="text-sm">
                Nombre de mois d&apos;avance <span className="text-red-500">*</span>
              </Label>
              <Input
                id="rent_advance_amount_number"
                type="number"
                min="0"
                max="12"
                placeholder="Exemple : 1 mois"
                {...register("rent_advance_amount_number", { valueAsNumber: true })}
                className={errors.rent_advance_amount_number ? "border-red-500 h-12" : "h-12"}
              />
              {errors.rent_advance_amount_number && (
                <p className="text-sm text-red-500">{errors.rent_advance_amount_number.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="agency_fees_month_number" className="text-sm">
                Mois de frais d&apos;agence
              </Label>
              <Input
                id="agency_fees_month_number"
                type="number"
                min="0"
                max="12"
                placeholder="Exemple : 1"
                {...register("agency_fees_month_number", { valueAsNumber: true })}
                className={errors.agency_fees_month_number ? "border-red-500 h-12" : "h-12"}
              />
              {errors.agency_fees_month_number && (
                <p className="text-sm text-red-500">{errors.agency_fees_month_number.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm">Description <span className="text-red-500">*</span></Label>
            <Textarea
              id="description"
              placeholder="Description de l'hébergement"
              {...register("description")}
              className={errors.description ? "border-red-500 min-h-[100px]" : "min-h-[100px]"}
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <div className="space-y-1.5 relative" ref={addressInputRef}>
              <Label htmlFor="address" className="text-sm">
                Adresse <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="address"
                      placeholder="Commencez à taper une adresse..."
                      {...field}
                      value={localAddressValue || field.value || ""}
                      onFocus={() => {
                        if (localAddressValue.length >= 2) {
                          setShowSuggestions(true);
                        }
                      }}
                      onChange={(e) => {
                        const value = e.target.value;
                        setLocalAddressValue(value);
                        field.onChange(value);
                        setAddressSelected(false);
                        if (value.length >= 2) {
                          setShowSuggestions(true);
                        } else {
                          setShowSuggestions(false);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          e.stopPropagation();
                          if (suggestions.length > 0) {
                            handleAddressSelect(suggestions[0]);
                          }
                          return false;
                        }
                      }}
                      className={errors.address ? "border-red-500 h-12 pr-10" : "h-12 pr-10"}
                    />
                  )}
                />
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                {showSuggestions && localAddressValue.trim().length >= 2 && !addressSelected && (
                  <>
                    {loadingAddress && (
                      <div className="address-suggestions absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-3">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-sm text-gray-500">Recherche en cours...</p>
                        </div>
                      </div>
                    )}
                    {!loadingAddress && suggestions.length > 0 && (
                      <div className="address-suggestions absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAddressSelect(suggestion);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-[#f08400] mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {formatAddress(suggestion)}
                                </p>
                                <p className="text-xs text-gray-500 truncate mt-0.5">
                                  {suggestion.properties.name} {suggestion.properties.city && `- ${suggestion.properties.city}`}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {!loadingAddress && suggestions.length === 0 && localAddressValue.trim().length >= 2 && !addressError && (
                      <div className="address-suggestions absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-3">
                        <p className="text-sm text-gray-500 text-center">Aucune adresse trouvée</p>
                      </div>
                    )}
                    {addressError && (
                      <div className="address-suggestions absolute z-[9999] w-full mt-1 bg-white border border-red-200 rounded-lg shadow-xl p-3">
                        <p className="text-sm text-red-500 text-center">
                          Erreur: {addressError}
                        </p>
                        <p className="text-xs text-gray-400 text-center mt-1">
                          Vous pouvez continuer à saisir manuellement
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-sm">
                Ville <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                placeholder="Exemple : Abidjan"
                {...register("city")}
                className={errors.city ? "border-red-500 h-12" : "h-12"}
              />
              {errors.city && (
                <p className="text-sm text-red-500">{errors.city.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="country" className="text-sm">
                Pays <span className="text-red-500">*</span>
              </Label>
              <Input
                id="country"
                placeholder="Exemple : Côte d'Ivoire"
                {...register("country")}
                className={errors.country ? "border-red-500 h-12" : "h-12"}
              />
              {errors.country && (
                <p className="text-sm text-red-500">{errors.country.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="type" className="text-sm">
                Type <span className="text-red-500">*</span>
              </Label>
              <Select value={type || ""} onValueChange={(value) => setValue("type", value as "STUDIO" | "APPARTEMENT" | "VILLA" | "PENTHOUSE" | "DUPLEX" | "TRIPLEX")}>
                <SelectTrigger className={`!h-12 w-full ${errors.type ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDIO">Studio</SelectItem>
                  <SelectItem value="APPARTEMENT">Appartement</SelectItem>
                  <SelectItem value="VILLA">Villa</SelectItem>
                  <SelectItem value="PENTHOUSE">Penthouse</SelectItem>
                  <SelectItem value="DUPLEX">Duplex</SelectItem>
                  <SelectItem value="TRIPLEX">Triplex</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="structure_type" className="text-sm">
                Type de structure <span className="text-red-500">*</span>
              </Label>
              <Select value={structureType || ""} onValueChange={(value) => setValue("structure_type", value as "MAISON_BASSE" | "IMMEUBLE")}>
                <SelectTrigger className={`!h-12 w-full ${errors.structure_type ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Sélectionner un type de structure" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MAISON_BASSE">Maison basse</SelectItem>
                  <SelectItem value="IMMEUBLE">Immeuble</SelectItem>
                </SelectContent>
              </Select>
              {errors.structure_type && (
                <p className="text-sm text-red-500">{errors.structure_type.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="construction_type" className="text-sm">
                Type de construction <span className="text-red-500">*</span>
              </Label>
              <Select value={constructionType || ""} onValueChange={(value) => setValue("construction_type", value as "NOUVELLE_CONSTRUCTION" | "ANCIENNE")}>
                <SelectTrigger className={`!h-12 w-full ${errors.construction_type ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Sélectionner un type de construction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NOUVELLE_CONSTRUCTION">Nouvelle construction</SelectItem>
                  <SelectItem value="ANCIENNE">Ancienne</SelectItem>
                </SelectContent>
              </Select>
              {errors.construction_type && (
                <p className="text-sm text-red-500">{errors.construction_type.message}</p>
              )}
            </div>
          </div>

          {type !== "STUDIO" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="rooms" className="text-sm">Chambres</Label>
                <Input
                  id="rooms"
                  type="number"
                  placeholder="Exemple : 2"
                  {...register("rooms", { valueAsNumber: true })}
                  className={errors.rooms ? "border-red-500 h-12" : "h-12"}
                />
                {errors.rooms && (
                  <p className="text-sm text-red-500">{errors.rooms.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bathrooms" className="text-sm">Salles de bain</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  placeholder="Exemple : 1"
                  {...register("bathrooms", { valueAsNumber: true })}
                  className={errors.bathrooms ? "border-red-500 h-12" : "h-12"}
                />
                {errors.bathrooms && (
                  <p className="text-sm text-red-500">{errors.bathrooms.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="living_room" className="text-sm">Salons</Label>
                <Input
                  id="living_room"
                  type="number"
                  placeholder="Exemple : 1"
                  {...register("living_room", { valueAsNumber: true })}
                  className={errors.living_room ? "border-red-500 h-12" : "h-12"}
                />
                {errors.living_room && (
                  <p className="text-sm text-red-500">{errors.living_room.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="piece_number" className="text-sm">Nombre de pièces</Label>
                <Input
                  id="piece_number"
                  type="number"
                  placeholder="Exemple : 3"
                  {...register("piece_number", { valueAsNumber: true })}
                  className={errors.piece_number ? "border-red-500 h-12" : "h-12"}
                />
                {errors.piece_number && (
                  <p className="text-sm text-red-500">{errors.piece_number.message}</p>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="space-y-3 p-2">
          {/* Images Section */}
          <div className="space-y-2">
            <Label htmlFor="images" className="text-sm">
              Images <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-2">
              {/* Preview Images */}
              {(mainImagePreview || galleryPreviews.length > 0) && (
                <div className="grid grid-cols-4 gap-1.5">
                  {mainImagePreview && (
                    <div className="relative w-full h-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                      <Image
                        src={mainImagePreview}
                        alt="Image principale"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute top-1 left-1">
                        <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded text-[10px]">Principale</span>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-5 w-5 p-0"
                        onClick={removeMainImage}
                      >
                        <X className="w-2.5 h-2.5" />
                      </Button>
                    </div>
                  )}
                  {galleryPreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative w-full h-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm"
                    >
                      <Image
                        src={preview}
                        alt={`Image ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-5 w-5 p-0"
                        onClick={() => removeGalleryImage(index)}
                      >
                        <X className="w-2.5 h-2.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Upload Zone */}
              <label
                htmlFor="images"
                className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${
                  imageError ? "border-red-500" : "border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-2 pb-2">
                  <ImageIcon className="w-5 h-5 mb-1.5 text-gray-400" />
                  <p className="mb-1 text-xs text-gray-500">
                    <span className="font-semibold">Cliquez pour uploader</span> ou glissez-déposez
                  </p>
                  <p className="text-[10px] text-gray-400">PNG, JPG, GIF, WEBP (MAX. 10 images)</p>
                </div>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileInputChange}
                />
              </label>
              {imageError && (
                <p className="text-sm text-red-500">{imageError}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center pt-4 border-t border-gray-200 mt-4 sm:mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="h-10 sm:h-12 px-4 sm:px-8 text-xs sm:text-sm w-full sm:w-auto"
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          className="h-10 sm:h-12 px-4 sm:px-8 bg-[#f08400] hover:bg-[#d87200] text-white text-xs sm:text-sm w-full sm:w-auto"
          disabled={isLoading}
        >
          {isLoading ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}

