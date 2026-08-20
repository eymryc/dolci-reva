import type {
  NightlifeVenueFormData,
  OpeningHours,
} from "@/types/entities/nightlife-venue.types";

/**
 * Serialize nightlife venue fields for Laravel multipart validation.
 * Nested opening_hours + feature_option_ids[] (not JSON strings / toString arrays).
 */
export function appendNightlifeVenueFormData(
  formData: FormData,
  data: NightlifeVenueFormData,
  options?: { forceVenueType?: string }
): void {
  if (options?.forceVenueType) {
    formData.append("venue_type", options.forceVenueType);
  }

  Object.entries(data).forEach(([key, value]) => {
    if (key === "feature_option_ids" || key === "amenities") {
      if (Array.isArray(value) && value.length > 0) {
        value.forEach((id) => {
          formData.append("feature_option_ids[]", String(id));
        });
      }
      return;
    }

    if (key === "venue_type") {
      if (options?.forceVenueType) return;
      if (Array.isArray(value) && value.length > 0) {
        // DB column is a single string (LOUNGE | BAR | NIGHT_CLUB)
        formData.append("venue_type", String(value[0]));
      } else if (typeof value === "string" && value) {
        formData.append("venue_type", value);
      }
      return;
    }

    if (key === "opening_hours") {
      appendOpeningHours(formData, value as OpeningHours | undefined);
      return;
    }

    if (key === "age_restriction") {
      if (value === 18 || value === 21 || value === "18" || value === "21") {
        formData.append("age_restriction", String(value));
      }
      return;
    }

    if (key === "area_feature_options") {
      if (Array.isArray(value) && value.length > 0) {
        formData.append("area_feature_options", JSON.stringify(value));
      }
      return;
    }

    if (typeof value === "boolean") {
      formData.append(key, value ? "1" : "0");
      return;
    }

    if (value === undefined || value === null || value === "") return;
    if (typeof value === "number" && !Number.isFinite(value)) return;
    if (Array.isArray(value)) return;

    formData.append(key, String(value));
  });
}

/**
 * Normalize opening_hours from API (object or legacy JSON list) for edit forms.
 */
export function parseOpeningHours(
  openingHours?: OpeningHours | string | null
): OpeningHours | undefined {
  if (!openingHours) return undefined;

  if (typeof openingHours === "string") {
    try {
      const parsed = JSON.parse(openingHours);
      if (Array.isArray(parsed)) {
        return parsed.reduce((acc: OpeningHours, item: { day: string; open: string; close: string }) => {
          if (item?.day) {
            acc[item.day as keyof OpeningHours] = {
              open: item.open,
              close: item.close,
            };
          }
          return acc;
        }, {} as OpeningHours);
      }
      if (parsed && typeof parsed === "object") {
        return parsed as OpeningHours;
      }
    } catch {
      return undefined;
    }
    return undefined;
  }

  return openingHours;
}

export function appendOpeningHours(
  formData: FormData,
  openingHours?: OpeningHours | null
): void {
  if (!openingHours || typeof openingHours !== "object") return;

  let appended = false;
  Object.entries(openingHours).forEach(([day, hours]) => {
    if (!hours || typeof hours !== "object") return;
    const open = hours.open?.trim();
    const close = hours.close?.trim();
    if (open) {
      formData.append(`opening_hours[${day}][open]`, open);
      appended = true;
    }
    if (close) {
      formData.append(`opening_hours[${day}][close]`, close);
      appended = true;
    }
  });

  // Ensure Laravel receives an array even when all days are empty
  if (!appended) {
    formData.append("opening_hours[monday][open]", "");
    formData.append("opening_hours[monday][close]", "");
  }
}

export function appendNightlifeImages(
  formData: FormData,
  images?: { mainImage?: File | null; galleryImages?: File[] }
): void {
  const allImages: File[] = [];
  if (images?.mainImage) allImages.push(images.mainImage);
  if (images?.galleryImages?.length) allImages.push(...images.galleryImages);
  allImages.forEach((image) => {
    formData.append("images[]", image);
  });
}
