/**
 * Service pour la gestion des restaurants, catégories de menu et items de menu
 */

import api from '@/lib/axios';
import {
  ApiResponse,
  PaginatedApiResponse,
  SingleDataApiResponse,
  extractApiData,
} from '@/types/api-response.types';
import type {
  Restaurant,
  RestaurantFormData,
  MenuCategory,
  MenuCategoryFormData,
  MenuItem,
  MenuItemFormData,
} from '@/types/entities/restaurant.types';

export class RestaurantService {
  /**
   * Récupère tous les restaurants
   */
  async getAll(params?: { owner_id?: number }): Promise<Restaurant[]> {
    const response = await api.get('/restaurants', { params });
    const data = extractApiData<Restaurant[]>(response.data);
    return data || [];
  }

  /**
   * Récupère un restaurant par ID
   */
  async getById(id: number): Promise<Restaurant> {
    const response = await api.get<SingleDataApiResponse<Restaurant>>(`/restaurants/${id}`);
    const restaurant = extractApiData<Restaurant>(response.data);
    if (!restaurant) throw new Error('Restaurant not found');
    return restaurant;
  }

  /**
   * Crée un nouveau restaurant
   */
  async create(
    data: RestaurantFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ): Promise<Restaurant> {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'amenities') {
        if (Array.isArray(value) && value.length > 0) {
          value.forEach((id) => {
            formData.append('amenities[]', id.toString());
          });
        }
      } else if (key === 'opening_hours' && value) {
        // Convertir l'objet opening_hours en tableau pour l'API
        const openingHoursArray = Object.entries(value).map(([day, hours]) => ({
          day,
          ...(hours as { open: string; close: string }),
        }));
        formData.append('opening_hours', JSON.stringify(openingHoursArray));
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

    const response = await api.post<ApiResponse<Restaurant>>('/restaurants', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const restaurant = extractApiData<Restaurant>(response.data);
    if (!restaurant) throw new Error('Failed to create restaurant');
    return restaurant;
  }

  /**
   * Met à jour un restaurant
   */
  async update(
    id: number,
    data: RestaurantFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ): Promise<Restaurant> {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'amenities') {
        if (Array.isArray(value) && value.length > 0) {
          value.forEach((id) => {
            formData.append('amenities[]', id.toString());
          });
        }
      } else if (key === 'opening_hours' && value) {
        // Convertir l'objet opening_hours en tableau pour l'API
        const openingHoursArray = Object.entries(value).map(([day, hours]) => ({
          day,
          ...(hours as { open: string; close: string }),
        }));
        formData.append('opening_hours', JSON.stringify(openingHoursArray));
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

    const response = await api.post<ApiResponse<Restaurant>>(`/restaurants/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const restaurant = extractApiData<Restaurant>(response.data);
    if (!restaurant) throw new Error('Failed to update restaurant');
    return restaurant;
  }

  /**
   * Supprime un restaurant
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/restaurants/${id}`);
  }

  // ========== Menu Categories ==========

  /**
   * Récupère toutes les catégories de menu d'un restaurant
   */
  async getMenuCategories(restaurantId: number): Promise<MenuCategory[]> {
    const response = await api.get(`/restaurants/${restaurantId}/menu-categories`);
    const data = extractApiData<MenuCategory[]>(response.data);
    return data || [];
  }

  /**
   * Récupère une catégorie de menu par ID
   */
  async getMenuCategoryById(restaurantId: number, categoryId: number): Promise<MenuCategory> {
    const response = await api.get<SingleDataApiResponse<MenuCategory>>(
      `/restaurants/${restaurantId}/menu-categories/${categoryId}`
    );
    const category = extractApiData<MenuCategory>(response.data);
    if (!category) throw new Error('Menu category not found');
    return category;
  }

  /**
   * Crée une nouvelle catégorie de menu
   */
  async createMenuCategory(
    restaurantId: number,
    data: MenuCategoryFormData
  ): Promise<MenuCategory> {
    const response = await api.post<ApiResponse<MenuCategory>>(
      `/restaurants/${restaurantId}/menu-categories`,
      data
    );
    const category = extractApiData<MenuCategory>(response.data);
    if (!category) throw new Error('Failed to create menu category');
    return category;
  }

  /**
   * Met à jour une catégorie de menu
   */
  async updateMenuCategory(
    restaurantId: number,
    categoryId: number,
    data: MenuCategoryFormData
  ): Promise<MenuCategory> {
    const response = await api.put<ApiResponse<MenuCategory>>(
      `/restaurants/${restaurantId}/menu-categories/${categoryId}`,
      data
    );
    const category = extractApiData<MenuCategory>(response.data);
    if (!category) throw new Error('Failed to update menu category');
    return category;
  }

  /**
   * Supprime une catégorie de menu
   */
  async deleteMenuCategory(restaurantId: number, categoryId: number): Promise<void> {
    await api.delete(`/restaurants/${restaurantId}/menu-categories/${categoryId}`);
  }

  // ========== Menu Items ==========

  /**
   * Récupère tous les items de menu d'un restaurant
   */
  async getMenuItems(restaurantId: number, params?: { category_id?: number }): Promise<MenuItem[]> {
    const response = await api.get(`/restaurants/${restaurantId}/menu-items`, { params });
    const data = extractApiData<MenuItem[]>(response.data);
    return data || [];
  }

  /**
   * Récupère un item de menu par ID
   */
  async getMenuItemById(restaurantId: number, itemId: number): Promise<MenuItem> {
    const response = await api.get<SingleDataApiResponse<MenuItem>>(
      `/restaurants/${restaurantId}/menu-items/${itemId}`
    );
    const item = extractApiData<MenuItem>(response.data);
    if (!item) throw new Error('Menu item not found');
    return item;
  }

  /**
   * Crée un nouvel item de menu
   */
  async createMenuItem(
    restaurantId: number,
    data: MenuItemFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ): Promise<MenuItem> {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'allergens' && Array.isArray(value)) {
        value.forEach((allergen) => {
          formData.append('allergens[]', allergen);
        });
      } else if (key === 'ingredients' && Array.isArray(value)) {
        value.forEach((ingredient) => {
          formData.append('ingredients[]', ingredient);
        });
      } else if (key === 'nutritional_info' && value) {
        formData.append('nutritional_info', JSON.stringify(value));
      } else if (key === 'variants' && Array.isArray(value)) {
        formData.append('variants', JSON.stringify(value));
      } else if (key === 'options' && Array.isArray(value)) {
        formData.append('options', JSON.stringify(value));
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

    const response = await api.post<ApiResponse<MenuItem>>(
      `/restaurants/${restaurantId}/menu-items`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    const item = extractApiData<MenuItem>(response.data);
    if (!item) throw new Error('Failed to create menu item');
    return item;
  }

  /**
   * Met à jour un item de menu
   */
  async updateMenuItem(
    restaurantId: number,
    itemId: number,
    data: MenuItemFormData,
    images?: { mainImage?: File | null; galleryImages?: File[] }
  ): Promise<MenuItem> {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'allergens' && Array.isArray(value)) {
        value.forEach((allergen) => {
          formData.append('allergens[]', allergen);
        });
      } else if (key === 'ingredients' && Array.isArray(value)) {
        value.forEach((ingredient) => {
          formData.append('ingredients[]', ingredient);
        });
      } else if (key === 'nutritional_info' && value) {
        formData.append('nutritional_info', JSON.stringify(value));
      } else if (key === 'variants' && Array.isArray(value)) {
        formData.append('variants', JSON.stringify(value));
      } else if (key === 'options' && Array.isArray(value)) {
        formData.append('options', JSON.stringify(value));
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

    const response = await api.post<ApiResponse<MenuItem>>(
      `/restaurants/${restaurantId}/menu-items/${itemId}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    const item = extractApiData<MenuItem>(response.data);
    if (!item) throw new Error('Failed to update menu item');
    return item;
  }

  /**
   * Supprime un item de menu
   */
  async deleteMenuItem(restaurantId: number, itemId: number): Promise<void> {
    await api.delete(`/restaurants/${restaurantId}/menu-items/${itemId}`);
  }
}

export const restaurantService = new RestaurantService();

