/**
 * Service pour la gestion des hébergements (dwellings)
 */

import api from '@/lib/axios';
import {
  ApiResponse,
  SingleDataApiResponse,
  extractApiData,
} from '@/types/api-response.types';
import type {
  Dwelling,
  DwellingFormData,
  DwellingBookingData,
  DwellingBookingResponse,
} from '@/types/entities/dwelling.types';

export class DwellingService {
  /**
   * Récupère tous les hébergements (admin)
   */
  async getAll(params?: { owner_id?: number }): Promise<Dwelling[]> {
    const response = await api.get('/dwellings', { params });
    const data = extractApiData<Dwelling[]>(response.data);
    return data || [];
  }

  /**
   * Récupère les hébergements publics avec filtres
   */
  async getPublic(filters?: {
    search?: string;
    city?: string;
    type?: string;
    standing?: string;
    order_price?: 'asc' | 'desc';
  }): Promise<Dwelling[]> {
    const params: Record<string, string> = {};
    
    if (filters?.search) params.search = filters.search.trim();
    if (filters?.city) params.city = filters.city.trim();
    if (filters?.type) params.type = filters.type.trim();
    if (filters?.standing) params.standing = filters.standing.trim();
    if (filters?.order_price) params.order_price = filters.order_price.toLowerCase();
    
    const response = await api.get('/public/dwellings', { params });
    const data = extractApiData<Dwelling[]>(response.data);
    return data || [];
  }

  /**
   * Récupère un hébergement public par ID
   */
  async getPublicById(id: number): Promise<Dwelling> {
    const response = await api.get<SingleDataApiResponse<Dwelling>>(`/public/dwellings/${id}`);
    const dwelling = extractApiData<Dwelling>(response.data);
    if (!dwelling) throw new Error('Dwelling not found');
    return dwelling;
  }

  /**
   * Récupère un hébergement par ID (admin)
   */
  async getById(id: number): Promise<Dwelling> {
    const response = await api.get<SingleDataApiResponse<Dwelling>>(`/dwellings/${id}`);
    const dwelling = extractApiData<Dwelling>(response.data);
    if (!dwelling) throw new Error('Dwelling not found');
    return dwelling;
  }

  /**
   * Crée un nouvel hébergement
   */
  async create(
    data: DwellingFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ): Promise<Dwelling> {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
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
        formData.append('images[]', image);
      });
    }

    const response = await api.post<ApiResponse<Dwelling>>('/dwellings', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const dwelling = extractApiData<Dwelling>(response.data);
    if (!dwelling) throw new Error('Failed to create dwelling');
    return dwelling;
  }

  /**
   * Met à jour un hébergement
   */
  async update(
    id: number,
    data: DwellingFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ): Promise<Dwelling> {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
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
        formData.append('images[]', image);
      });
    }

    const response = await api.put<ApiResponse<Dwelling>>(`/dwellings/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const dwelling = extractApiData<Dwelling>(response.data);
    if (!dwelling) throw new Error('Failed to update dwelling');
    return dwelling;
  }

  /**
   * Supprime un hébergement
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/dwellings/${id}`);
  }

  /**
   * Bascule la disponibilité d'un hébergement
   */
  async toggleAvailability(id: number): Promise<Dwelling> {
    const response = await api.put<ApiResponse<Dwelling>>(`/dwellings/${id}/availability`);
    const dwelling = extractApiData<Dwelling>(response.data);
    if (!dwelling) throw new Error('Failed to toggle dwelling availability');
    return dwelling;
  }

  /**
   * Réserve un hébergement
   */
  async book(dwellingId: number, data: DwellingBookingData): Promise<DwellingBookingResponse> {
    const response = await api.post<ApiResponse<DwellingBookingResponse>>(
      `/dwellings/${dwellingId}/book`,
      data
    );
    return response.data;
  }
}

export const dwellingService = new DwellingService();






