"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HotelRoomFormData } from "@/hooks/use-hotels";
import { useAmenities } from "@/hooks/use-amenities";
import { useHotels } from "@/hooks/use-hotels";
import { X, Image as ImageIcon, Check } from "lucide-react";
import { ServerErrorPanel } from "@/components/ui/ServerErrorPanel";
import { useServerErrors } from "@/hooks/use-server-errors";
import { createFieldLabels } from "@/lib/server-error-utils";

// Schema de validation
const roomSchema = z.object({
  hotel_id: z.number().int("L'ID de l'hôtel doit être un entier").min(1, "L'hôtel est requis"),
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(255, "Le nom ne peut pas dépasser 255 caractères").optional().or(z.literal("")),
  description: z.string().max(2000, "La description ne peut pas dépasser 2000 caractères").optional().or(z.literal("")),
  room_number: z.string().max(50, "Le numéro de chambre ne peut pas dépasser 50 caractères").optional().or(z.literal("")),
  type: z.enum(["SINGLE", "DOUBLE", "TWIN", "TRIPLE", "QUAD", "FAMILY"], {
    errorMap: () => ({ message: "Le type doit être : SINGLE, DOUBLE, TWIN, TRIPLE, QUAD ou FAMILY" }),
  }),
  max_guests: z.number().int("Le nombre maximum d'invités doit être un entier").min(1, "Le nombre maximum d'invités doit être au moins 1").max(20, "Le nombre maximum d'invités ne peut pas dépasser 20"),
  price: z.number().min(0.01, "Le prix doit être au moins 0.01").max(99999.99, "Le prix ne peut pas dépasser 99999.99"),
  standing: z.enum(["STANDARD", "SUPERIEUR", "DELUXE", "EXECUTIVE", "SUITE", "SUITE_JUNIOR", "SUITE_EXECUTIVE", "SUITE_PRESIDENTIELLE"], {
    errorMap: () => ({ message: "Le standing doit être : STANDARD, SUPERIEUR, DELUXE, EXECUTIVE, SUITE, SUITE_JUNIOR, SUITE_EXECUTIVE ou SUITE_PRESIDENTIELLE" }),
  }),
  amenities: z.array(z.number().int()).optional(),
});

type RoomFormValues = z.infer<typeof roomSchema>;

interface RoomFormProps {
  onSubmit: (data: HotelRoomFormData, images?: { mainImage?: File | null; galleryImages?: File[] }) => void;
  onCancel: () => void;
  defaultValues?: HotelRoomFormData & {
    main_image_url?: string | null;
    gallery_images?: Array<{ url?: string } | string>;
  };
  isLoading?: boolean;
  onServerError?: (handleServerError: (error: unknown) => { errorMessage: string; hasDetailedErrors: boolean }) => void;
}

export function RoomForm({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading = false,
  onServerError,
}: RoomFormProps) {
  const { data: amenities = [], isLoading: isLoadingAmenities } = useAmenities();
  const { data: hotels = [], isLoading: isLoadingHotels } = useHotels();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: defaultValues ? {
      hotel_id: defaultValues.hotel_id,
      name: defaultValues.name,
      description: defaultValues.description || "",
      room_number: defaultValues.room_number || "",
      type: defaultValues.type as "SINGLE" | "DOUBLE" | "TWIN" | "TRIPLE" | "QUAD" | "FAMILY",
      standing: defaultValues.standing as "STANDARD" | "SUPERIEUR" | "DELUXE" | "EXECUTIVE" | "SUITE" | "SUITE_JUNIOR" | "SUITE_EXECUTIVE" | "SUITE_PRESIDENTIELLE",
      max_guests: defaultValues.max_guests,
      price: defaultValues.price,
      amenities: defaultValues.amenities || [],
    } : {
      hotel_id: undefined,
      name: "",
      description: "",
      room_number: "",
      type: "SINGLE",
      standing: "STANDARD",
      max_guests: 1,
      price: 0,
      amenities: [],
    },
  });

  const hotelId = watch("hotel_id");
  const roomType = watch("type");
  const standing = watch("standing");
  const selectedAmenities = watch("amenities") || [];

  // Mapping des champs
  const fieldMapping: Record<string, keyof RoomFormValues> = {
    hotel_id: "hotel_id",
    name: "name",
    description: "description",
    room_number: "room_number",
    type: "type",
    standing: "standing",
    max_guests: "max_guests",
    price: "price",
    amenities: "amenities",
  };

  // Labels personnalisés
  const fieldLabels = createFieldLabels({
    hotel_id: "Hôtel",
    name: "Nom",
    description: "Description",
    room_number: "Numéro de chambre",
    type: "Type",
    standing: "Standing",
    max_guests: "Invités max",
    price: "Prix",
    amenities: "Équipements",
  });

  // Hook pour gérer les erreurs du serveur
  const { serverErrors, showErrorPanel, handleServerError, clearErrors: clearServerErrors, setShowErrorPanel } = useServerErrors<RoomFormValues>({
    setError,
    fieldMapping,
  });

  // Exposer handleServerError au parent via callback
  useEffect(() => {
    if (onServerError) {
      onServerError(handleServerError);
    }
  }, [handleServerError, onServerError]);
  
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

  const handleFormSubmit = (data: RoomFormValues) => {
    // Effacer les erreurs précédentes
    clearServerErrors();
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

    // Convert form values to HotelRoomFormData format
    const formData: HotelRoomFormData = {
      hotel_id: data.hotel_id,
      name: data.name,
      description: data.description || undefined,
      room_number: data.room_number || undefined,
      type: data.type,
      standing: data.standing,
      max_guests: data.max_guests,
      price: data.price,
      amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
    };

    onSubmit(formData, {
      mainImage,
      galleryImages,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="container mx-auto">
      {/* Panneau d'erreurs du serveur */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="hotel_id" className="text-xs sm:text-sm">
                Hôtel <span className="text-red-500">*</span>
              </Label>
              <Select
                value={hotelId?.toString() || undefined}
                onValueChange={(value) => setValue("hotel_id", parseInt(value))}
                disabled={!!defaultValues?.hotel_id}
              >
                <SelectTrigger className={`${errors.hotel_id ? "border-red-500" : ""} !h-10 sm:!h-12 text-xs sm:text-sm w-full`}>
                  <SelectValue placeholder="Sélectionner un hôtel" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingHotels ? (
                    <SelectItem value="loading" disabled>Chargement...</SelectItem>
                  ) : hotels.length === 0 ? (
                    <SelectItem value="empty" disabled>Aucun hôtel disponible</SelectItem>
                  ) : (
                    hotels.map((hotel) => (
                      <SelectItem key={hotel.id} value={hotel.id.toString()}>
                        {hotel.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.hotel_id && (
                <p className="text-xs sm:text-sm text-red-500">{errors.hotel_id.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs sm:text-sm">
                Nom de la chambre
              </Label>
              <Input
                id="name"
                placeholder="Exemple : Chambre Deluxe Vue Mer"
                {...register("name")}
                className={`${errors.name ? "border-red-500" : ""} h-10 sm:h-12 text-xs sm:text-sm`}
              />
              {errors.name && (
                <p className="text-xs sm:text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs sm:text-sm">Description</Label>
            <Textarea
              id="description"
              placeholder="Description de la chambre"
              {...register("description")}
              className={`${errors.description ? "border-red-500" : ""} min-h-[80px] sm:min-h-[100px] text-xs sm:text-sm`}
              rows={4}
            />
            {errors.description && (
              <p className="text-xs sm:text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="room_number" className="text-xs sm:text-sm">
                Numéro de chambre
              </Label>
              <Input
                id="room_number"
                placeholder="Exemple : 101"
                {...register("room_number")}
                className={`${errors.room_number ? "border-red-500" : ""} h-10 sm:h-12 text-xs sm:text-sm`}
              />
              {errors.room_number && (
                <p className="text-xs sm:text-sm text-red-500">{errors.room_number.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="type" className="text-xs sm:text-sm">
                Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={roomType || ""}
                onValueChange={(value) => setValue("type", value as "SINGLE" | "DOUBLE" | "TWIN" | "TRIPLE" | "QUAD" | "FAMILY")}
              >
                <SelectTrigger className={`${errors.type ? "border-red-500" : ""} !h-10 sm:!h-12 text-xs sm:text-sm w-full`}>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SINGLE">Simple</SelectItem>
                  <SelectItem value="DOUBLE">Double</SelectItem>
                  <SelectItem value="TWIN">Jumelle</SelectItem>
                  <SelectItem value="TRIPLE">Triple</SelectItem>
                  <SelectItem value="QUAD">Quadruple</SelectItem>
                  <SelectItem value="FAMILY">Familiale</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-xs sm:text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="standing" className="text-xs sm:text-sm">
                Standing <span className="text-red-500">*</span>
              </Label>
              <Select
                value={standing || ""}
                onValueChange={(value) => setValue("standing", value as "STANDARD" | "SUPERIEUR" | "DELUXE" | "EXECUTIVE" | "SUITE" | "SUITE_JUNIOR" | "SUITE_EXECUTIVE" | "SUITE_PRESIDENTIELLE")}
              >
                <SelectTrigger className={`${errors.standing ? "border-red-500" : ""} !h-10 sm:!h-12 text-xs sm:text-sm w-full`}>
                  <SelectValue placeholder="Sélectionner un standing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STANDARD">Standard</SelectItem>
                  <SelectItem value="SUPERIEUR">Supérieur</SelectItem>
                  <SelectItem value="DELUXE">Deluxe</SelectItem>
                  <SelectItem value="EXECUTIVE">Executive</SelectItem>
                  <SelectItem value="SUITE">Suite</SelectItem>
                  <SelectItem value="SUITE_JUNIOR">Suite Junior</SelectItem>
                  <SelectItem value="SUITE_EXECUTIVE">Suite Executive</SelectItem>
                  <SelectItem value="SUITE_PRESIDENTIELLE">Suite Présidentielle</SelectItem>
                </SelectContent>
              </Select>
              {errors.standing && (
                <p className="text-xs sm:text-sm text-red-500">{errors.standing.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="max_guests" className="text-xs sm:text-sm">
                Invités max <span className="text-red-500">*</span>
              </Label>
              <Input
                id="max_guests"
                type="number"
                min="1"
                placeholder="Exemple : 2"
                {...register("max_guests", { valueAsNumber: true })}
                className={errors.max_guests ? "border-red-500 h-12" : "h-12"}
              />
              {errors.max_guests && (
                <p className="text-xs sm:text-sm text-red-500">{errors.max_guests.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="price" className="text-xs sm:text-sm">
                Prix (FCFA) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                max="99999.99"
                placeholder="Exemple : 150.00"
                {...register("price", { valueAsNumber: true })}
                className={`${errors.price ? "border-red-500" : ""} h-10 sm:h-12 text-xs sm:text-sm`}
              />
              {errors.price && (
                <p className="text-xs sm:text-sm text-red-500">{errors.price.message}</p>
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

