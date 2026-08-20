"use client";

import { ACCEPTED_IMAGE_TYPES } from "@/lib/image-upload";

import React, { useEffect, useState } from "react";
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
import { HotelRoomFormData, useHotels } from "@/hooks/use-hotels";
import { FeatureOptionsPicker } from "@/components/admin/shared/FeatureOptionsPicker";
import { X, Image as ImageIcon, BedDouble, Users } from "lucide-react";
import { ServerErrorPanel } from "@/components/ui/ServerErrorPanel";
import { useServerErrors } from "@/hooks/use-server-errors";
import { createFieldLabels } from "@/lib/server-error-utils";
import { StepFormShell, type FormStep } from "@/components/admin/host/StepFormShell";

const roomSchema = z.object({
  hotel_id: z.number().int().min(1, "L'hôtel est requis"),
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(255)
    .optional()
    .or(z.literal("")),
  description: z.string().max(2000).optional().or(z.literal("")),
  room_number: z.string().max(50).optional().or(z.literal("")),
  type: z.enum(["SINGLE", "DOUBLE", "TWIN", "TRIPLE", "QUAD", "FAMILY"]),
  max_guests: z.number().int().min(1).max(20),
  price: z.number().min(0.01, "Le prix est requis").max(99999.99),
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
  feature_option_ids: z.array(z.number().int()).optional(),
});

type FormValues = z.infer<typeof roomSchema>;

const STEPS: FormStep[] = [
  { id: "identity", title: "Identité", description: "Type et standing" },
  { id: "pricing", title: "Tarif", description: "Capacité et prix" },
  { id: "features", title: "Équipements", description: "Confort de la chambre" },
  { id: "photos", title: "Photos", description: "Galerie de la chambre" },
  { id: "publish", title: "Publication", description: "Vérifier et publier" },
];

const TYPE_LABELS: Record<string, string> = {
  SINGLE: "Simple",
  DOUBLE: "Double",
  TWIN: "Jumelle",
  TRIPLE: "Triple",
  QUAD: "Quadruple",
  FAMILY: "Familiale",
};

const STANDING_LABELS: Record<string, string> = {
  STANDARD: "Standard",
  SUPERIEUR: "Supérieur",
  DELUXE: "Deluxe",
  EXECUTIVE: "Executive",
  SUITE: "Suite",
  SUITE_JUNIOR: "Suite Junior",
  SUITE_EXECUTIVE: "Suite Executive",
  SUITE_PRESIDENTIELLE: "Suite Présidentielle",
};

interface Props {
  onSubmit: (
    data: HotelRoomFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ) => void;
  onCancel: () => void;
  defaultValues?: HotelRoomFormData & {
    main_image_url?: string | null;
    gallery_images?: Array<{ url?: string } | string>;
  };
  isLoading?: boolean;
  lockHotel?: boolean;
  isEdit?: boolean;
  onServerError?: (
    handleServerError: (error: unknown) => {
      errorMessage: string;
      hasDetailedErrors: boolean;
    }
  ) => void;
}

export function RoomHostForm({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading = false,
  lockHotel = false,
  isEdit = false,
  onServerError,
}: Props) {
  const [step, setStep] = useState(0);
  const { data: hotels = [] } = useHotels();

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
    resolver: zodResolver(roomSchema),
    defaultValues: defaultValues
      ? {
          hotel_id: defaultValues.hotel_id,
          name: defaultValues.name || "",
          description: defaultValues.description || "",
          room_number: defaultValues.room_number || "",
          type: defaultValues.type as FormValues["type"],
          standing: defaultValues.standing as FormValues["standing"],
          max_guests: defaultValues.max_guests,
          price: defaultValues.price,
          feature_option_ids: defaultValues.feature_option_ids || [],
        }
      : {
          hotel_id: undefined as unknown as number,
          name: "",
          description: "",
          room_number: "",
          type: "SINGLE",
          standing: "STANDARD",
          max_guests: 2,
          price: 0,
          feature_option_ids: [],
        },
  });

  const hotelId = watch("hotel_id");
  const roomType = watch("type");
  const standing = watch("standing");
  const name = watch("name");
  const roomNumber = watch("room_number");
  const maxGuests = watch("max_guests");
  const price = watch("price");
  const selectedFeatureOptionIds = watch("feature_option_ids") || [];

  const hotelName = hotels.find((h) => h.id === hotelId)?.name;

  const fieldLabels = createFieldLabels({
    hotel_id: "Hôtel",
    name: "Nom",
    description: "Description",
    room_number: "Numéro",
    type: "Type",
    standing: "Standing",
    max_guests: "Invités max",
    price: "Prix",
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
      hotel_id: "hotel_id",
      name: "name",
      description: "description",
      room_number: "room_number",
      type: "type",
      standing: "standing",
      max_guests: "max_guests",
      price: "price",
      feature_option_ids: "feature_option_ids",
    },
  });

  useEffect(() => {
    if (onServerError) onServerError(handleServerError);
  }, [handleServerError, onServerError]);

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
      const ok = await trigger([
        "hotel_id",
        "name",
        "description",
        "room_number",
        "type",
        "standing",
      ]);
      if (!ok) return;
    } else if (step === 1) {
      const ok = await trigger(["max_guests", "price"]);
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
        hotel_id: data.hotel_id,
        name: data.name || undefined,
        description: data.description || undefined,
        room_number: data.room_number || undefined,
        type: data.type,
        standing: data.standing,
        max_guests: data.max_guests,
        price: data.price,
        feature_option_ids:
          selectedFeatureOptionIds.length > 0
            ? selectedFeatureOptionIds
            : undefined,
      },
      { mainImage, galleryImages }
    );
  };

  const inputClass = "h-11 rounded-none border-slate-200";

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(n || 0);

  return (
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
        onSubmit={() => handleSubmit(finish)()}
        submitLabel={isEdit ? "Enregistrer" : "Publier la chambre"}
      >
        {step === 0 && (
          <div className="space-y-5">
            {!lockHotel ? (
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-800">
                  Hôtel <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={hotelId ? String(hotelId) : undefined}
                  onValueChange={(v) => setValue("hotel_id", Number(v))}
                >
                  <SelectTrigger className={`!h-11 w-full ${inputClass}`}>
                    <SelectValue placeholder="Sélectionner un hôtel" />
                  </SelectTrigger>
                  <SelectContent>
                    {hotels.map((h) => (
                      <SelectItem key={h.id} value={String(h.id)}>
                        {h.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.hotel_id && (
                  <p className="text-xs text-red-500">{errors.hotel_id.message}</p>
                )}
              </div>
            ) : hotelName ? (
              <div className="border border-[#f08400]/20 bg-[#fffaf5] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f08400]">
                  Hôtel
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{hotelName}</p>
              </div>
            ) : null}

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-800">
                Nom de la chambre
              </Label>
              <Input
                {...register("name")}
                className={inputClass}
                placeholder="Exemple : Chambre Deluxe Vue Mer"
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-800">
                  Numéro
                </Label>
                <Input
                  {...register("room_number")}
                  className={inputClass}
                  placeholder="101"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-800">
                  Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={roomType}
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
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-800">
                  Standing <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={standing}
                  onValueChange={(v) =>
                    setValue("standing", v as FormValues["standing"])
                  }
                >
                  <SelectTrigger className={`!h-11 w-full ${inputClass}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STANDING_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-800">
                Description
              </Label>
              <Textarea
                {...register("description")}
                rows={4}
                className="rounded-none border-slate-200"
                placeholder="Décrivez la chambre, la vue, le confort…"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-800">
                  Invités max <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  {...register("max_guests", { valueAsNumber: true })}
                  className={inputClass}
                />
                {errors.max_guests && (
                  <p className="text-xs text-red-500">
                    {errors.max_guests.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-800">
                  Prix / nuit (F CFA) <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0.01}
                  {...register("price", { valueAsNumber: true })}
                  className={inputClass}
                  placeholder="50000"
                />
                {errors.price && (
                  <p className="text-xs text-red-500">{errors.price.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-[#f08400]/20 bg-gradient-to-br from-[#fff4e8] to-white px-4 py-4">
                <Users className="h-4 w-4 text-[#f08400]" />
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Capacité
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {maxGuests || "—"}{" "}
                  <span className="text-sm font-normal text-slate-400">
                    pers.
                  </span>
                </p>
              </div>
              <div className="border border-[#f08400]/20 bg-gradient-to-br from-[#fff8eb] to-white px-4 py-4">
                <BedDouble className="h-4 w-4 text-[#f08400]" />
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Tarif
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {price > 0 ? formatPrice(price) : "—"}
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">
              Sélectionnez les équipements propres à cette chambre.
            </p>
            <FeatureOptionsPicker
              establishmentType="HOTEL_ROOM"
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
              htmlFor="room-images"
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
                id="room-images"
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
                {name ||
                  (roomNumber ? `Chambre ${roomNumber}` : "Nouvelle chambre")}
              </h3>
              {hotelName ? (
                <p className="mt-1 text-sm text-slate-500">{hotelName}</p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="border border-[#f08400]/20 bg-white px-2.5 py-1">
                  {TYPE_LABELS[roomType] || roomType}
                </span>
                <span className="border border-[#f08400]/20 bg-white px-2.5 py-1">
                  {STANDING_LABELS[standing] || standing}
                </span>
                <span className="border border-[#f08400]/20 bg-white px-2.5 py-1">
                  {maxGuests} pers.
                </span>
                <span className="border border-[#f08400]/20 bg-white px-2.5 py-1">
                  {formatPrice(price)} / nuit
                </span>
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
              Vérifiez les informations puis publiez la chambre sur Dolci Rêva.
            </p>
          </div>
        )}
      </StepFormShell>
    </form>
  );
}
