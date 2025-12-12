/**
 * Service pour la gestion des hôtels et chambres
 */

import api from '@/lib/axios';
import {
  ApiResponse,
  SingleDataApiResponse,
  extractApiData,
} from '@/types/api-response.types';
import type {
  Hotel,
  HotelFormData,
  HotelRoom,
  HotelRoomFormData,
} from '@/types/entities/hotel.types';

export class HotelService {
  /**
   * Récupère tous les hôtels (admin)
   */
  async getAll(params?: { owner_id?: number }): Promise<Hotel[]> {
    const response = await api.get('/hotels', { params });
    const data = extractApiData<Hotel[]>(response.data);
    return data || [];
  }

  /**
   * Récupère un hôtel par ID
   */
  async getById(id: number): Promise<Hotel> {
    const response = await api.get<SingleDataApiResponse<Hotel>>(`/hotels/${id}`);
    const hotel = extractApiData<Hotel>(response.data);
    if (!hotel) throw new Error('Hotel not found');
    return hotel;
  }

  /**
   * Crée un nouvel hôtel
   */
  async create(
    data: HotelFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ): Promise<Hotel> {
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

    const response = await api.post<ApiResponse<Hotel>>('/hotels', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const hotel = extractApiData<Hotel>(response.data);
    if (!hotel) throw new Error('Failed to create hotel');
    return hotel;
  }

  /**
   * Met à jour un hôtel
   */
  async update(
    id: number,
    data: HotelFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ): Promise<Hotel> {
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

    const response = await api.put<ApiResponse<Hotel>>(`/hotels/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const hotel = extractApiData<Hotel>(response.data);
    if (!hotel) throw new Error('Failed to update hotel');
    return hotel;
  }

  /**
   * Supprime un hôtel
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/hotels/${id}`);
  }

  // ========== Gestion des chambres ==========

  /**
   * Récupère toutes les chambres d'un hôtel
   */
  async getRooms(hotelId: number): Promise<HotelRoom[]> {
    const response = await api.get('/hotel-rooms', { params: { hotel_id: hotelId } });
    const data = extractApiData<HotelRoom[]>(response.data);
    return data || [];
  }

  /**
   * Récupère toutes les chambres (admin)
   * Si hotel_id est fourni, récupère les chambres de cet hôtel
   */
  async getAllRooms(params?: { hotel_id?: number }): Promise<HotelRoom[]> {
    const response = await api.get('/hotel-rooms', { params });
    const data = extractApiData<HotelRoom[]>(response.data);
    return data || [];
  }

  /**
   * Récupère une chambre par ID
   */
  async getRoomById(roomId: number): Promise<HotelRoom> {
    const response = await api.get<SingleDataApiResponse<HotelRoom>>(`/hotel-rooms/${roomId}`);
    const room = extractApiData<HotelRoom>(response.data);
    if (!room) throw new Error('Hotel room not found');
    return room;
  }

  /**
   * Crée une nouvelle chambre
   */
  async createRoom(
    data: HotelRoomFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ): Promise<HotelRoom> {
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

    const response = await api.post<ApiResponse<HotelRoom>>('/hotel-rooms', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const room = extractApiData<HotelRoom>(response.data);
    if (!room) throw new Error('Failed to create hotel room');
    return room;
  }

  /**
   * Met à jour une chambre
   */
  async updateRoom(
    roomId: number,
    data: HotelRoomFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ): Promise<HotelRoom> {
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

    // Utiliser POST avec _method pour supporter les uploads d'images
    formData.append('_method', 'PUT');

    const response = await api.post<ApiResponse<HotelRoom>>(`/hotel-rooms/${roomId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const room = extractApiData<HotelRoom>(response.data);
    if (!room) throw new Error('Failed to update hotel room');
    return room;
  }

  /**
   * Supprime une chambre
   */
  async deleteRoom(roomId: number): Promise<void> {
    await api.delete(`/hotel-rooms/${roomId}`);
  }
}

export const hotelService = new HotelService();

