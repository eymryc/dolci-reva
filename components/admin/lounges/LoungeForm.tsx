"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { NightlifeVenueFormData, OpeningHours } from "@/types/entities/nightlife-venue.types";
import { useAmenities } from "@/hooks/use-amenities";
import { useAddressAutocomplete } from "@/hooks/use-address-autocomplete";
import type { AddressSuggestion } from "@/hooks/use-address-autocomplete";
import { X, Image as ImageIcon, Check, MapPin, Clock } from "lucide-react";
import { ServerErrorPanel } from "@/components/ui/ServerErrorPanel";
import { useServerErrors } from "@/hooks/use-server-errors";
import { createFieldLabels } from "@/lib/server-error-utils";

// Schema de validation
const loungeSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(255, "Le nom ne peut pas dépasser 255 caractères"),
  description: z.string().max(2000, "La description ne peut pas dépasser 2000 caractères").optional().or(z.literal("")),
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
  amenities: z.array(z.number().int()).optional(),
  age_restriction: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return null;
      const num = typeof val === "string" ? Number(val) : val;
      return isNaN(num as number) ? null : num;
    },
    z.number().int().min(0, "L'âge doit être positif").max(120, "L'âge doit être raisonnable").nullable().optional()
  ),
  smoking_area: z.boolean().optional().default(false),
  outdoor_seating: z.boolean().optional().default(false),
  parking: z.boolean().optional().default(false),
  venue_type: z.array(z.enum(["LOUNGE", "NIGHT_CLUB", "BAR"])).optional().default([]),
});

type LoungeFormValues = z.infer<typeof loungeSchema>;

interface LoungeFormProps {
  onSubmit: (data: NightlifeVenueFormData, images?: { mainImage?: File | null; galleryImages?: File[] }) => void;
  onCancel: () => void;
  defaultValues?: NightlifeVenueFormData & {
    main_image_url?: string | null;
    gallery_images?: Array<{ url?: string } | string>;
  };
  isLoading?: boolean;
  onServerError?: (handleServerError: (error: unknown) => { errorMessage: string; hasDetailedErrors: boolean }) => void;
}

const DAYS = [
  { key: "monday", label: "Lundi" },
  { key: "tuesday", label: "Mardi" },
  { key: "wednesday", label: "Mercredi" },
  { key: "thursday", label: "Jeudi" },
  { key: "friday", label: "Vendredi" },
  { key: "saturday", label: "Samedi" },
  { key: "sunday", label: "Dimanche" },
] as const;

export function LoungeForm({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading = false,
  onServerError,
}: LoungeFormProps) {
  const { data: amenities = [], isLoading: isLoadingAmenities } = useAmenities();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<LoungeFormValues>({
    // @ts-expect-error - Type compatibility issue between react-hook-form and zod
    resolver: zodResolver(loungeSchema),
    defaultValues: defaultValues ? {
      name: defaultValues.name,
      description: defaultValues.description || "",
      address: defaultValues.address,
      city: defaultValues.city,
      country: defaultValues.country,
      latitude: defaultValues.latitude ? Number(defaultValues.latitude) : null,
      longitude: defaultValues.longitude ? Number(defaultValues.longitude) : null,
      amenities: defaultValues.amenities || [],
      age_restriction: defaultValues.age_restriction ?? null,
      smoking_area: defaultValues.smoking_area ?? false,
      outdoor_seating: defaultValues.outdoor_seating ?? false,
      parking: defaultValues.parking ?? false,
      venue_type: Array.isArray(defaultValues.venue_type) ? defaultValues.venue_type : (defaultValues.venue_type ? [defaultValues.venue_type] : []),
    } : {
      name: "",
      description: "",
      address: "",
      city: "",
      country: "",
      latitude: null,
      longitude: null,
      amenities: [],
      age_restriction: null,
      smoking_area: false,
      outdoor_seating: false,
      parking: false,
      venue_type: [],
    },
  });

  const selectedAmenities = watch("amenities") || [];

  // État pour les horaires d'ouverture
  const [openingHours, setOpeningHours] = useState<OpeningHours>(
    defaultValues?.opening_hours || {}
  );

  // Mapping des champs
  const fieldMapping: Record<string, keyof LoungeFormValues> = {
    name: "name",
    description: "description",
    address: "address",
    city: "city",
    country: "country",
    latitude: "latitude",
    longitude: "longitude",
    amenities: "amenities",
    age_restriction: "age_restriction",
    smoking_area: "smoking_area",
    outdoor_seating: "outdoor_seating",
    parking: "parking",
    venue_type: "venue_type",
  };

  // Labels personnalisés
  const fieldLabels = createFieldLabels({
    name: "Nom",
    description: "Description",
    address: "Adresse",
    city: "Ville",
    country: "Pays",
    latitude: "Latitude",
    longitude: "Longitude",
    amenities: "Équipements",
    age_restriction: "Restriction d'âge",
    smoking_area: "Espace fumeur",
    outdoor_seating: "Sièges en extérieur",
    parking: "Parking",
    venue_type: "Type de lieu",
  });

  // Hook pour gérer les erreurs du serveur
  const { serverErrors, showErrorPanel, handleServerError, clearErrors: clearServerErrors, setShowErrorPanel } = useServerErrors<LoungeFormValues>({
    setError,
    fieldMapping,
  });

  // Exposer handleServerError au parent via callback
  useEffect(() => {
    if (onServerError) {
      onServerError(handleServerError);
    }
  }, [handleServerError, onServerError]);
  
  // État local pour la valeur de l'adresse pour une mise à jour immédiate
  const [localAddressValue, setLocalAddressValue] = useState(defaultValues?.address || "");
  
  // Synchroniser la valeur locale avec la valeur du formulaire quand defaultValues change
  useEffect(() => {
    if (defaultValues?.address) {
      setLocalAddressValue(defaultValues.address);
      setAddressSelected(false);
    }
  }, [defaultValues?.address]);
  
  // Address autocomplete
  const { suggestions, loading: loadingAddress, formatAddress, error: addressError } = useAddressAutocomplete(localAddressValue, 200);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addressSelected, setAddressSelected] = useState(false);
  const addressInputRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (addressSelected) {
      setShowSuggestions(false);
      return;
    }
    if (localAddressValue.trim().length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [suggestions.length, loadingAddress, addressError, localAddressValue, addressSelected]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addressInputRef.current && !addressInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setAddressSelected(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSuggestions]);
  
  // Image states
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string>("");

  // Initialiser les images existantes en mode édition
  useEffect(() => {
    if (defaultValues && 'main_image_url' in defaultValues && defaultValues.main_image_url) {
      setMainImagePreview(defaultValues.main_image_url as string);
    }
    if (defaultValues && 'gallery_images' in defaultValues && Array.isArray(defaultValues.gallery_images)) {
      const galleryUrls = defaultValues.gallery_images.map((img: { url?: string } | string) => 
        typeof img === 'string' ? img : (img.url || '')
      ).filter(Boolean);
      setGalleryPreviews(galleryUrls);
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

  const toggleAmenity = (amenityId: number) => {
    const currentIds = selectedAmenities;
    const newIds = currentIds.includes(amenityId)
      ? currentIds.filter((id) => id !== amenityId)
      : [...currentIds, amenityId];
    setValue("amenities", newIds);
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

  const handleDayHoursChange = (day: string, field: "open" | "close", value: string) => {
    setOpeningHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day as keyof OpeningHours],
        [field]: value,
      },
    }));
  };

  const handleFormSubmit = (data: LoungeFormValues) => {
    clearServerErrors();
    clearErrors();
    
    // Validate images
    const hasExistingMainImage = mainImagePreview && !mainImage;
    const hasNewMainImage = mainImage;
    const hasExistingGalleryImages = galleryPreviews.length > 0 && galleryImages.length === 0;
    const hasNewGalleryImages = galleryImages.length > 0;
    
    const hasImages = hasExistingMainImage || hasNewMainImage || hasExistingGalleryImages || hasNewGalleryImages;
    
    if (!hasImages) {
      setImageError("Au moins une image est requise");
      return;
    }
    
    const totalNewImages = (mainImage ? 1 : 0) + galleryImages.length;
    if (totalNewImages > 10) {
      setImageError("Vous ne pouvez pas uploader plus de 10 images");
      return;
    }
    setImageError("");

    // Convert form values to NightlifeVenueFormData format
    const formData: NightlifeVenueFormData = {
      name: data.name,
      description: data.description || undefined,
      address: data.address,
      city: data.city,
      country: data.country,
      latitude: data.latitude !== null && data.latitude !== undefined ? String(data.latitude) : undefined,
      longitude: data.longitude !== null && data.longitude !== undefined ? String(data.longitude) : undefined,
      opening_hours: Object.keys(openingHours).length > 0 ? openingHours : undefined,
      amenities: selectedAmenities,
      age_restriction: data.age_restriction ?? null,
      smoking_area: data.smoking_area ?? false,
      outdoor_seating: data.outdoor_seating ?? false,
      parking: data.parking ?? false,
      venue_type: Array.isArray(data.venue_type) && data.venue_type.length > 0 ? data.venue_type : null,
    };

    onSubmit(formData, {
      mainImage,
      galleryImages,
    });
  };

  return (
    // @ts-expect-error - Type compatibility issue between react-hook-form handler types
    <form onSubmit={handleSubmit(handleFormSubmit)} className="container mx-auto">
      <ServerErrorPanel
        errors={serverErrors}
        fieldLabels={fieldLabels}
        show={showErrorPanel}
        onClose={() => {
          setShowErrorPanel(false);
          clearServerErrors();
          clearErrors();
        }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-3 p-2 sm:p-3">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs sm:text-sm">
              Nom de l&apos;espace <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Exemple : Lounge Le Rooftop"
              {...register("name")}
              className={`${errors.name ? "border-red-500" : ""} h-10 sm:h-12 text-xs sm:text-sm`}
            />
            {errors.name && (
              <p className="text-xs sm:text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs sm:text-sm">Description</Label>
            <Textarea
              id="description"
              placeholder="Description du lounge"
              {...register("description")}
              className={`${errors.description ? "border-red-500" : ""} min-h-[80px] sm:min-h-[100px] text-xs sm:text-sm`}
              rows={4}
            />
            {errors.description && (
              <p className="text-xs sm:text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <div className="space-y-1.5 relative" ref={addressInputRef}>
              <Label htmlFor="address" className="text-sm">
                Adresse <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="address"
                  placeholder="Commencez à taper une adresse..."
                  {...register("address")}
                  onFocus={() => {
                    if (localAddressValue.length >= 2) {
                      setShowSuggestions(true);
                    }
                  }}
                  onChange={(e) => {
                    const value = e.target.value;
                    setLocalAddressValue(value);
                    setValue("address", value);
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
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                {localAddressValue.trim().length >= 2 && !addressSelected && (
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
                            onMouseDown={(e) => e.preventDefault()}
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

          {/* Horaires d'ouverture */}
          <div className="space-y-3 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <Label className="text-sm font-semibold">Horaires d&apos;ouverture</Label>
            </div>
            <div className="space-y-2">
              {DAYS.map((day) => {
                const dayHours = openingHours[day.key as keyof OpeningHours];
                return (
                  <div key={day.key} className="grid grid-cols-3 gap-2 items-center">
                    <Label className="text-xs sm:text-sm text-gray-700">{day.label}</Label>
                    <Input
                      type="time"
                      value={dayHours?.open || ""}
                      onChange={(e) => handleDayHoursChange(day.key, "open", e.target.value)}
                      className="h-9 text-xs sm:text-sm"
                      placeholder="Ouverture"
                    />
                    <Input
                      type="time"
                      value={dayHours?.close || ""}
                      onChange={(e) => handleDayHoursChange(day.key, "close", e.target.value)}
                      className="h-9 text-xs sm:text-sm"
                      placeholder="Fermeture"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Restriction d'âge */}
          <div className="space-y-1.5">
            <Label htmlFor="age_restriction" className="text-xs sm:text-sm">
              Restriction d&apos;âge (ans)
            </Label>
            <Input
              id="age_restriction"
              type="number"
              min="0"
              max="120"
              placeholder="Ex: 18, 21 (laisser vide pour aucune restriction)"
              {...register("age_restriction", {
                setValueAs: (value) => {
                  if (value === "" || value === null || value === undefined) return null;
                  const num = Number(value);
                  return isNaN(num) ? null : num;
                },
              })}
              value={watch("age_restriction")?.toString() || ""}
              onChange={(e) => {
                const value = e.target.value;
                setValue("age_restriction", value === "" ? null : Number(value), { shouldValidate: true });
              }}
              className={`${errors.age_restriction ? "border-red-500" : ""} h-10 sm:h-12 text-xs sm:text-sm`}
            />
            {errors.age_restriction && (
              <p className="text-xs sm:text-sm text-red-500">{errors.age_restriction.message}</p>
            )}
          </div>

          {/* Options et Type de lieu sur la même ligne */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Options */}
            <div className="space-y-3 border border-gray-200 rounded-lg p-4">
              <Label className="text-sm font-semibold">Options</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="smoking_area"
                    checked={watch("smoking_area") || false}
                    onCheckedChange={(checked) => {
                      setValue("smoking_area", checked === true);
                    }}
                  />
                  <Label
                    htmlFor="smoking_area"
                    className="text-xs sm:text-sm font-normal cursor-pointer"
                  >
                    Espace fumeur
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="outdoor_seating"
                    checked={watch("outdoor_seating") || false}
                    onCheckedChange={(checked) => {
                      setValue("outdoor_seating", checked === true);
                    }}
                  />
                  <Label
                    htmlFor="outdoor_seating"
                    className="text-xs sm:text-sm font-normal cursor-pointer"
                  >
                    Sièges en extérieur
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="parking"
                    checked={watch("parking") || false}
                    onCheckedChange={(checked) => {
                      setValue("parking", checked === true);
                    }}
                  />
                  <Label
                    htmlFor="parking"
                    className="text-xs sm:text-sm font-normal cursor-pointer"
                  >
                    Parking
                  </Label>
                </div>
              </div>
            </div>

            {/* Type de lieu */}
            <div className="space-y-3 border border-gray-200 rounded-lg p-4">
              <Label className="text-sm font-semibold">Type de lieu</Label>
              <div className="space-y-3">
                {(["LOUNGE", "NIGHT_CLUB", "BAR"] as const).map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`venue_type_${type}`}
                      checked={(watch("venue_type") || []).includes(type)}
                      onCheckedChange={(checked) => {
                        const currentTypes = watch("venue_type") || [];
                        if (checked) {
                          setValue("venue_type", [...currentTypes, type]);
                        } else {
                          setValue("venue_type", currentTypes.filter((t) => t !== type));
                        }
                      }}
                    />
                    <Label
                      htmlFor={`venue_type_${type}`}
                      className="text-xs sm:text-sm font-normal cursor-pointer"
                    >
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.venue_type && (
                <p className="text-xs sm:text-sm text-red-500">{errors.venue_type.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3 p-2">
          {/* Amenities Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">
                Commodités
              </Label>
              {selectedAmenities.length > 0 && (
                <span className="text-xs text-gray-500">
                  {selectedAmenities.length} sélectionnée{selectedAmenities.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            {isLoadingAmenities ? (
              <div className="flex items-center justify-center py-4 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500">Chargement des commodités...</p>
              </div>
            ) : amenities.length === 0 ? (
              <div className="flex items-center justify-center py-4 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500">Aucune commodité disponible</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-3 bg-white max-h-64 overflow-y-auto">
                <div className="flex flex-wrap gap-1.5">
                  {amenities.map((amenity) => {
                    const isSelected = selectedAmenities.includes(amenity.id);
                    return (
                      <button
                        key={amenity.id}
                        type="button"
                        onClick={() => toggleAmenity(amenity.id)}
                        className={`
                          relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
                          transition-all duration-200 ease-in-out
                          border-2
                          ${
                            isSelected
                              ? "bg-[#f08400]/10 border-[#f08400] text-[#f08400] shadow-sm shadow-[#f08400]/20"
                              : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                          }
                          focus:outline-none
                          active:scale-95
                        `}
                      >
                        {isSelected && (
                          <div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#f08400] text-white">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                        <span>{amenity.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {errors.amenities && (
              <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                <span className="text-red-500">•</span>
                {errors.amenities.message}
              </p>
            )}
          </div>

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
                  onChange={(e) => {
                    setImageError("");
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      // La première image est l'image principale
                      const firstFile = files[0];
                      setMainImage(firstFile);
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setMainImagePreview(reader.result as string);
                      };
                      reader.readAsDataURL(firstFile);
                      
                      // Les autres images sont la galerie
                      if (files.length > 1) {
                        const galleryFiles = files.slice(1);
                        setGalleryImages((prev) => [...prev, ...galleryFiles]);
                        galleryFiles.forEach((file) => {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setGalleryPreviews((prev) => [...prev, reader.result as string]);
                          };
                          reader.readAsDataURL(file);
                        });
                      }
                    }
                  }}
                />
              </label>
              {imageError && (
                <p className="text-sm text-red-500">{imageError}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="h-10 sm:h-12 text-xs sm:text-sm w-full sm:w-auto"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-[#f08400] hover:bg-[#d87200] text-white h-10 sm:h-12 text-xs sm:text-sm w-full sm:w-auto"
        >
          {isLoading ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}

