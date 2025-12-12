/**
 * Service pour la gestion des lounges, catégories de produits et produits
 */

import api from "@/lib/axios";
import {
  ApiResponse,
  SingleDataApiResponse,
  extractApiData,
} from "@/types/api-response.types";
import type {
  NightlifeVenue,
  NightlifeVenueFormData,
  NightlifeVenueProductCategory,
  NightlifeVenueProductCategoryFormData,
  NightlifeVenueProduct,
  NightlifeVenueProductFormData,
} from "@/types/entities/nightlife-venue.types";

export class NightlifeVenueService {
  /**
   * Récupère tous les lounges
   */
  async getAll(params?: { owner_id?: number }): Promise<NightlifeVenue[]> {
    const response = await api.get("/nightlife-venues", { params });
    const data = extractApiData<NightlifeVenue[]>(response.data);
    return data || [];
  }

  /**
   * Récupère un venue par ID
   */
  async getById(id: number): Promise<NightlifeVenue> {
    const response = await api.get<SingleDataApiResponse<NightlifeVenue>>(
      `/nightlife-venues/${id}`
    );
    const venue = extractApiData<NightlifeVenue>(response.data);
    if (!venue) throw new Error("Nightlife venue not found");
    return venue;
  }

  /**
   * Crée un nouveau venue
   */
  async create(
    data: NightlifeVenueFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ): Promise<NightlifeVenue> {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === "amenities") {
        if (Array.isArray(value) && value.length > 0) {
          value.forEach((id) => {
            formData.append("amenities[]", id.toString());
          });
        }
      } else if (key === "venue_type") {
        if (Array.isArray(value) && value.length > 0) {
          value.forEach((type) => {
            formData.append("venue_type[]", type);
          });
        }
      } else if (key === "opening_hours" && value) {
        // Convertir l'objet opening_hours en tableau pour l'API
        const openingHoursArray = Object.entries(value).map(([day, hours]) => ({
          day,
          ...(hours as { open: string; close: string }),
        }));
        formData.append("opening_hours", JSON.stringify(openingHoursArray));
      } else if (typeof value === "boolean") {
        // Convertir les booléens en "1" ou "0" pour Laravel
        formData.append(key, value ? "1" : "0");
      } else if (value !== undefined && value !== null && value !== "") {
        formData.append(key, value.toString());
      }
    });

    const allImages: File[] = [];
    if (images?.mainImage) allImages.push(images.mainImage);
    if (images?.galleryImages && images.galleryImages.length > 0) {
      allImages.push(...images.galleryImages);
    }

    if (allImages.length > 0) {
      allImages.forEach((image) => {
        formData.append("images[]", image);
      });
    }

    const response = await api.post<ApiResponse<NightlifeVenue>>(
      "/nightlife-venues",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    const venue = extractApiData<NightlifeVenue>(response.data);
    if (!venue) throw new Error("Failed to create nightlife venue");
    return venue;
  }

  /**
   * Met à jour un venue
   */
  async update(
    id: number,
    data: NightlifeVenueFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ): Promise<NightlifeVenue> {
    const formData = new FormData();
    formData.append("_method", "PUT");

    Object.entries(data).forEach(([key, value]) => {
      if (key === "amenities") {
        if (Array.isArray(value) && value.length > 0) {
          value.forEach((id) => {
            formData.append("amenities[]", id.toString());
          });
        }
      } else if (key === "venue_type") {
        if (Array.isArray(value) && value.length > 0) {
          value.forEach((type) => {
            formData.append("venue_type[]", type);
          });
        }
      } else if (key === "opening_hours" && value) {
        // Convertir l'objet opening_hours en tableau pour l'API
        const openingHoursArray = Object.entries(value).map(([day, hours]) => ({
          day,
          ...(hours as { open: string; close: string }),
        }));
        formData.append("opening_hours", JSON.stringify(openingHoursArray));
      } else if (typeof value === "boolean") {
        // Convertir les booléens en "1" ou "0" pour Laravel
        formData.append(key, value ? "1" : "0");
      } else if (value !== undefined && value !== null && value !== "") {
        formData.append(key, value.toString());
      }
    });

    const allImages: File[] = [];
    if (images?.mainImage) allImages.push(images.mainImage);
    if (images?.galleryImages && images.galleryImages.length > 0) {
      allImages.push(...images.galleryImages);
    }

    if (allImages.length > 0) {
      allImages.forEach((image) => {
        formData.append("images[]", image);
      });
    }

    const response = await api.post<ApiResponse<NightlifeVenue>>(
      `/nightlife-venues/${id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    const venue = extractApiData<NightlifeVenue>(response.data);
    if (!venue) throw new Error("Failed to update nightlife venue");
    return venue;
  }

  /**
   * Supprime un venue
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/nightlife-venues/${id}`);
  }

  // ========== Nightlife Venue Product Categories ==========

  /**
   * Récupère toutes les catégories de produits d'un venue
   */
  async getLoungeProductCategories(
    loungeId: number
  ): Promise<NightlifeVenueProductCategory[]> {
    const response = await api.get(
      `/nightlife-venues/${loungeId}/product-categories`
    );
    const data = extractApiData<NightlifeVenueProductCategory[]>(response.data);
    return data || [];
  }

  /**
   * Récupère une catégorie de produit par ID
   */
  async getLoungeProductCategoryById(
    loungeId: number,
    categoryId: number
  ): Promise<NightlifeVenueProductCategory> {
    const response = await api.get<
      SingleDataApiResponse<NightlifeVenueProductCategory>
    >(`/nightlife-venue-product-categories/${categoryId}`);
    const category = extractApiData<NightlifeVenueProductCategory>(
      response.data
    );
    if (!category)
      throw new Error("Nightlife venue product category not found");
    return category;
  }

  /**
   * Crée une nouvelle catégorie de produit
   */
  async createLoungeProductCategory(
    loungeId: number,
    data: NightlifeVenueProductCategoryFormData
  ): Promise<NightlifeVenueProductCategory> {
    const response = await api.post<ApiResponse<NightlifeVenueProductCategory>>(
      `/nightlife-venues/${loungeId}/product-categories`,
      data
    );
    const category = extractApiData<NightlifeVenueProductCategory>(
      response.data
    );
    if (!category)
      throw new Error("Failed to create nightlife venue product category");
    return category;
  }

  /**
   * Met à jour une catégorie de produit
   */
  async updateLoungeProductCategory(
    loungeId: number,
    categoryId: number,
    data: NightlifeVenueProductCategoryFormData
  ): Promise<NightlifeVenueProductCategory> {
    const response = await api.put<ApiResponse<NightlifeVenueProductCategory>>(
      `/nightlife-venue-product-categories/${categoryId}`,
      data
    );
    const category = extractApiData<NightlifeVenueProductCategory>(
      response.data
    );
    if (!category)
      throw new Error("Failed to update nightlife venue product category");
    return category;
  }

  /**
   * Supprime une catégorie de produit
   */
  async deleteLoungeProductCategory(
    loungeId: number,
    categoryId: number
  ): Promise<void> {
    await api.delete(
      `/nightlife-venue-product-categories/${categoryId}`
    );
  }

  // ========== Nightlife Venue Products ==========

  /**
   * Récupère tous les produits d'un venue
   */
  async getLoungeProducts(
    loungeId: number,
    params?: { category_id?: number }
  ): Promise<NightlifeVenueProduct[]> {
    const response = await api.get(`/nightlife-venues/${loungeId}/products`, {
      params,
    });
    const data = extractApiData<NightlifeVenueProduct[]>(response.data);
    return data || [];
  }

  /**
   * Récupère un produit par ID
   */
  async getLoungeProductById(
    loungeId: number,
    productId: number
  ): Promise<NightlifeVenueProduct> {
    const response = await api.get<
      SingleDataApiResponse<NightlifeVenueProduct>
    >(`/nightlife-venue-products/${productId}`);
    const product = extractApiData<NightlifeVenueProduct>(response.data);
    if (!product) throw new Error("Nightlife venue product not found");
    return product;
  }

  /**
   * Crée un nouveau produit
   */
  async createLoungeProduct(
    loungeId: number,
    data: NightlifeVenueProductFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ): Promise<NightlifeVenueProduct> {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === "variants" && Array.isArray(value)) {
        formData.append("variants", JSON.stringify(value));
      } else if (key === "options" && Array.isArray(value)) {
        formData.append("options", JSON.stringify(value));
      } else if (value !== undefined && value !== null && value !== "") {
        formData.append(key, value.toString());
      }
    });

    const allImages: File[] = [];
    if (images?.mainImage) allImages.push(images.mainImage);
    if (images?.galleryImages && images.galleryImages.length > 0) {
      allImages.push(...images.galleryImages);
    }

    if (allImages.length > 0) {
      allImages.forEach((image) => {
        formData.append("images[]", image);
      });
    }

    const response = await api.post<ApiResponse<NightlifeVenueProduct>>(
      `/nightlife-venues/${loungeId}/products`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    const product = extractApiData<NightlifeVenueProduct>(response.data);
    if (!product) throw new Error("Failed to create nightlife venue product");
    return product;
  }

  /**
   * Met à jour un produit
   */
  async updateLoungeProduct(
    loungeId: number,
    productId: number,
    data: NightlifeVenueProductFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ): Promise<NightlifeVenueProduct> {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === "variants" && Array.isArray(value)) {
        formData.append("variants", JSON.stringify(value));
      } else if (key === "options" && Array.isArray(value)) {
        formData.append("options", JSON.stringify(value));
      } else if (value !== undefined && value !== null && value !== "") {
        formData.append(key, value.toString());
      }
    });

    const allImages: File[] = [];
    if (images?.mainImage) allImages.push(images.mainImage);
    if (images?.galleryImages && images.galleryImages.length > 0) {
      allImages.push(...images.galleryImages);
    }

    if (allImages.length > 0) {
      allImages.forEach((image) => {
        formData.append("images[]", image);
      });
    }

    const response = await api.put<ApiResponse<NightlifeVenueProduct>>(
      `/nightlife-venue-products/${productId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    const product = extractApiData<NightlifeVenueProduct>(response.data);
    if (!product) throw new Error("Failed to update nightlife venue product");
    return product;
  }

  /**
   * Supprime un produit
   */
  async deleteLoungeProduct(
    loungeId: number,
    productId: number
  ): Promise<void> {
    await api.delete(`/nightlife-venue-products/${productId}`);
  }
}

export const nightlifeVenueService = new NightlifeVenueService();
