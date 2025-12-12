/**
 * Service pour la gestion des résidences
 */

import api from '@/lib/axios';
import {
  ApiResponse,
  PaginatedApiResponse,
  SingleDataApiResponse,
  extractApiData,
} from '@/types/api-response.types';
import type {
  Residence,
  ResidenceFormData,
  ResidenceBookingData,
  ResidenceBookingResponse,
} from '@/types/entities/residence.types';

export class ResidenceService {
  /**
   * Récupère toutes les résidences (admin)
   */
  async getAll(params?: { owner_id?: number }): Promise<Residence[]> {
    const response = await api.get('/residences', { params });
    const data = extractApiData<Residence[]>(response.data);
    return data || [];
  }

  /**
   * Récupère les résidences publiques avec filtres
   */
  async getPublic(filters?: {
    search?: string;
    city?: string;
    type?: string;
    standing?: string;
    order_price?: 'asc' | 'desc';
  }): Promise<Residence[]> {
    const params: Record<string, string> = {};
    
    if (filters?.search) params.search = filters.search.trim();
    if (filters?.city) params.city = filters.city.trim();
    if (filters?.type) params.type = filters.type.trim();
    if (filters?.standing) params.standing = filters.standing.trim();
    if (filters?.order_price) params.order_price = filters.order_price.toLowerCase();
    
    const response = await api.get('/public/residences', { params });
    const data = extractApiData<Residence[]>(response.data);
    return data || [];
  }

  /**
   * Récupère une résidence publique par ID
   */
  async getPublicById(id: number): Promise<Residence> {
    const response = await api.get<SingleDataApiResponse<Residence>>(`/public/residences/${id}`);
    const residence = extractApiData<Residence>(response.data);
    if (!residence) throw new Error('Residence not found');
    return residence;
  }

  /**
   * Récupère une résidence par ID (admin)
   */
  async getById(id: number): Promise<Residence> {
    const response = await api.get<SingleDataApiResponse<Residence>>(`/residences/${id}`);
    const residence = extractApiData<Residence>(response.data);
    if (!residence) throw new Error('Residence not found');
    return residence;
  }

  /**
   * Crée une nouvelle résidence
   */
  async create(
    data: ResidenceFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ): Promise<Residence> {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'amenities') {
        if (Array.isArray(value) && value.length > 0) {
          value.forEach((id) => {
            formData.append('amenities[]', id.toString());
          });
        }
      } else if (value !== undefined && value !== null && value !== '') {
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

    const response = await api.post<ApiResponse<Residence>>('/residences', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const residence = extractApiData<Residence>(response.data);
    if (!residence) throw new Error('Failed to create residence');
    return residence;
  }

  /**
   * Met à jour une résidence
   */
  async update(
    id: number,
    data: ResidenceFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ): Promise<Residence> {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'amenities') {
        if (Array.isArray(value) && value.length > 0) {
          value.forEach((id) => {
            formData.append('amenities[]', id.toString());
          });
        }
      } else if (value !== undefined && value !== null && value !== '') {
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

    const response = await api.put<ApiResponse<Residence>>(`/residences/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const residence = extractApiData<Residence>(response.data);
    if (!residence) throw new Error('Failed to update residence');
    return residence;
  }

  /**
   * Supprime une résidence
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/residences/${id}`);
  }

  /**
   * Réserve une résidence
   */
  async book(residenceId: number, data: ResidenceBookingData): Promise<ResidenceBookingResponse> {
    const response = await api.post<ApiResponse<ResidenceBookingResponse>>(
      `/residences/${residenceId}/book`,
      data
    );
    return response.data;
  }
}

export const residenceService = new ResidenceService();






