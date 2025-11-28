/**
 * Section de gestion des images du formulaire d'hébergement
 */

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Image as ImageIcon } from "lucide-react";

interface ImagesSectionProps {
  mainImagePreview: string | null;
  galleryPreviews: string[];
  imageError: string;
  onMainImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGalleryImagesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveMainImage: () => void;
  onRemoveGalleryImage: (index: number) => void;
  defaultMainImageUrl?: string | null;
  defaultGalleryImages?: Array<{ url?: string } | string>;
}

export function ImagesSection({
  mainImagePreview,
  galleryPreviews,
  imageError,
  onMainImageChange,
  onGalleryImagesChange,
  onRemoveMainImage,
  onRemoveGalleryImage,
  defaultMainImageUrl,
  defaultGalleryImages,
}: ImagesSectionProps) {
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);
  const [galleryImageUrls, setGalleryImageUrls] = useState<string[]>([]);

  useEffect(() => {
    if (defaultMainImageUrl) {
      setMainImageUrl(defaultMainImageUrl);
    }
    if (defaultGalleryImages && defaultGalleryImages.length > 0) {
      const urls = defaultGalleryImages.map((img) =>
        typeof img === "string" ? img : img.url || ""
      );
      setGalleryImageUrls(urls);
    }
  }, [defaultMainImageUrl, defaultGalleryImages]);

  const displayMainImage = mainImagePreview || mainImageUrl;
  const displayGalleryImages = galleryPreviews.length > 0 ? galleryPreviews : galleryImageUrls;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
        Images
      </h3>

      {/* Image principale */}
      <div>
        <Label>Image principale *</Label>
        <div className="mt-2">
          {displayMainImage ? (
            <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200">
              <Image
                src={displayMainImage}
                alt="Image principale"
                fill
                className="object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onRemoveMainImage}
                className="absolute top-2 right-2"
                aria-label="Supprimer l'image principale"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <Label htmlFor="main-image" className="mt-4 cursor-pointer">
                <span className="text-sm font-medium text-gray-700">
                  Cliquez pour ajouter une image principale
                </span>
                <input
                  id="main-image"
                  type="file"
                  accept="image/*"
                  onChange={onMainImageChange}
                  className="hidden"
                />
              </Label>
            </div>
          )}
        </div>
      </div>

      {/* Galerie d'images */}
      <div>
        <Label>Galerie d&apos;images</Label>
        <div className="mt-2">
          {displayGalleryImages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {displayGalleryImages.map((preview, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200"
                >
                  <Image
                    src={preview}
                    alt={`Image galerie ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => onRemoveGalleryImage(index)}
                    className="absolute top-1 right-1"
                    aria-label={`Supprimer l'image ${index + 1}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
          <div className="mt-4">
            <Label htmlFor="gallery-images" className="cursor-pointer">
              <Button type="button" variant="outline" asChild>
                <span>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Ajouter des images à la galerie
                </span>
              </Button>
              <input
                id="gallery-images"
                type="file"
                accept="image/*"
                multiple
                onChange={onGalleryImagesChange}
                className="hidden"
              />
            </Label>
          </div>
        </div>
      </div>

      {imageError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{imageError}</p>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Maximum 10 images au total. Taille maximale par image : 5 Mo.
      </p>
    </div>
  );
}

