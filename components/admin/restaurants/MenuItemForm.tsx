"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { MenuItemFormData } from "@/types/entities/restaurant.types";
import { ServerErrorPanel } from "@/components/ui/ServerErrorPanel";
import { useServerErrors } from "@/hooks/use-server-errors";
import { createFieldLabels } from "@/lib/server-error-utils";
import type { MenuCategory } from "@/types/entities/restaurant.types";
import { Image as ImageIcon, X } from "lucide-react";

// Schema de validation
const menuItemSchema = z.object({
  category_id: z.number().min(1, "La catégorie est requise"),
  name: z.string().min(1, "Le nom est requis").min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z.string().optional(),
  price: z.number().min(0.01, "Le prix doit être supérieur à 0"),
});

type MenuItemFormValues = z.infer<typeof menuItemSchema>;

interface MenuItemFormProps {
  onSubmit: (data: MenuItemFormData, images?: { mainImage?: File | null; galleryImages?: File[] }) => void;
  onCancel: () => void;
  defaultValues?: MenuItemFormData & {
    main_image_url?: string | null;
    gallery_images?: Array<{ url?: string } | string>;
  };
  isLoading?: boolean;
  menuCategories: MenuCategory[];
}

export function MenuItemForm({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading = false,
  menuCategories,
}: MenuItemFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    setValue,
    watch,
  } = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: defaultValues ? {
      category_id: defaultValues.category_id,
      name: defaultValues.name,
      description: defaultValues.description || "",
      price: defaultValues.price,
  } : { category_id: undefined as unknown as number, name: "", description: "", price: 0 },
  });

  const categoryId = watch("category_id");

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
    // Dans galleryPreviews, on a les images existantes puis les nouvelles
    // On doit déterminer si l'image à supprimer est existante ou nouvelle
    const existingImagesCount = galleryPreviews.length - galleryImages.length;
    
    if (index < existingImagesCount) {
      // C'est une image existante, on la retire seulement de galleryPreviews
      setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
    } else {
      // C'est une nouvelle image, on la retire de galleryImages et galleryPreviews
      const realIndex = index - existingImagesCount;
      setGalleryImages((prev) => prev.filter((_, i) => i !== realIndex));
      setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Mapping des champs
  const fieldMapping: Record<string, keyof MenuItemFormValues> = {
    category_id: "category_id",
    name: "name",
    description: "description",
    price: "price",
  };

  // Labels personnalisés
  const fieldLabels = createFieldLabels({
    category_id: "Catégorie",
    name: "Nom",
    description: "Description",
    price: "Prix",
  });

  // Hook pour gérer les erreurs du serveur
  const { serverErrors, showErrorPanel, clearErrors: clearServerErrors, setShowErrorPanel } = useServerErrors<MenuItemFormValues>({
    setError,
    fieldMapping,
  });

  const handleFormSubmit = (data: MenuItemFormValues) => {
    clearServerErrors();
    clearErrors();
    setImageError("");

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

    // Trouver le restaurant_id à partir de la catégorie sélectionnée
    const selectedCategory = menuCategories.find(cat => cat.id === data.category_id);
    const restaurantId = selectedCategory?.restaurant_id || defaultValues?.restaurant_id || 0;
    
    // Convertir en MenuItemFormData (qui nécessite restaurant_id)
    const formData: MenuItemFormData = {
      restaurant_id: restaurantId,
      category_id: data.category_id,
      name: data.name,
      description: data.description,
      price: data.price,
    };
    onSubmit(formData, {
      mainImage,
      galleryImages,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
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
      
      <div className="space-y-2">
        <Label htmlFor="category_id">
          Catégorie <span className="text-red-500">*</span>
        </Label>
        <Select
          value={categoryId ? categoryId.toString() : ""}
          onValueChange={(value) => setValue("category_id", parseInt(value, 10), { shouldValidate: true })}
          disabled={isLoading}
        >
          <SelectTrigger
            id="category_id"
            className={errors.category_id ? "border-red-500 !h-10 sm:!h-12 w-full" : "!h-10 sm:!h-12 w-full"}
          >
            <SelectValue placeholder="Sélectionner une catégorie" />
          </SelectTrigger>
          <SelectContent>
            {menuCategories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category_id && (
          <p className="text-sm text-red-500">{errors.category_id.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">
          Nom <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Exemple : Poulet Braisé, Poisson Grillé"
          {...register("name")}
          className={errors.name ? "border-red-500 h-12" : "h-12"}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Description optionnelle"
          {...register("description")}
          className="min-h-[100px]"
          rows={4}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">
          Prix <span className="text-red-500">*</span>
        </Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="Exemple : 3500"
          {...register("price", { valueAsNumber: true })}
          className={errors.price ? "border-red-500 h-12" : "h-12"}
        />
        {errors.price && (
          <p className="text-sm text-red-500">{errors.price.message}</p>
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
              {galleryPreviews.map((preview, index) => {
                // Calculer l'index réel dans galleryPreviews (sans compter mainImagePreview)
                const galleryIndex = index;
                return (
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
                      onClick={() => removeGalleryImage(galleryIndex)}
                    >
                      <X className="w-2.5 h-2.5" />
                    </Button>
                  </div>
                );
              })}
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

      <div className="flex gap-2 justify-center pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="h-12"
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

