/**
 * Service pour la gestion des utilisateurs
 * 
 * Cette couche service sépare la logique API de la logique de présentation,
 * respectant le principe de séparation des préoccupations (SRP).
 */

import api from '@/lib/axios';
import {
  ApiResponse,
  PaginatedApiResponse,
  SingleDataApiResponse,
  extractApiData,
} from '@/types/api-response.types';
import type { User, UserFormData } from '@/types/entities/user.types';

export class UserService {
  /**
   * Récupère tous les utilisateurs avec pagination
   * 
   * @param page - Numéro de page (défaut: 1)
   * @returns Réponse paginée avec les utilisateurs
   */
  async getAll(page: number = 1): Promise<PaginatedApiResponse<User>> {
    const response = await api.get<PaginatedApiResponse<User>>('/users', {
      params: { page },
    });
    return response.data;
  }

  /**
   * Récupère un utilisateur par son ID
   * 
   * @param id - ID de l'utilisateur
   * @returns Données de l'utilisateur
   * @throws Error si l'utilisateur n'est pas trouvé
   */
  async getById(id: number): Promise<User> {
    const response = await api.get<SingleDataApiResponse<User>>(`/users/${id}`);
    const user = extractApiData<User>(response.data);
    if (!user) throw new Error('User not found');
    return user;
  }

  /**
   * Crée un nouvel utilisateur
   * 
   * @param data - Données du formulaire utilisateur
   * @returns Données de l'utilisateur créé
   * @throws Error si la création échoue
   */
  async create(data: UserFormData): Promise<User> {
    const response = await api.post<ApiResponse<User>>('/users', data);
    const user = extractApiData<User>(response.data);
    if (!user) throw new Error('Failed to create user');
    return user;
  }

  /**
   * Met à jour un utilisateur existant
   * 
   * @param id - ID de l'utilisateur
   * @param data - Données partielles à mettre à jour
   * @returns Données de l'utilisateur mis à jour
   * @throws Error si la mise à jour échoue
   */
  async update(id: number, data: Partial<UserFormData>): Promise<User> {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, data);
    const user = extractApiData<User>(response.data);
    if (!user) throw new Error('Failed to update user');
    return user;
  }

  /**
   * Supprime un utilisateur
   * 
   * @param id - ID de l'utilisateur à supprimer
   * @throws Error si la suppression échoue
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  }
}

// Instance singleton pour éviter les multiples instances
export const userService = new UserService();






