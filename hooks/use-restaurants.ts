import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usePermissions } from "./use-permissions";
import { handleError } from "@/lib/error-handler";
import { restaurantService } from "@/services/restaurant.service";
import type {
  Restaurant,
  RestaurantFormData,
  MenuCategory,
  MenuCategoryFormData,
  MenuItem,
  MenuItemFormData,
} from "@/types/entities/restaurant.types";

/**
 * Hook pour récupérer tous les restaurants
 */
export function useRestaurants() {
  const { canViewAll, getUserId } = usePermissions();
  const userId = getUserId();

  return useQuery({
    queryKey: ["restaurants", userId, canViewAll()],
    queryFn: async () => {
      const params: { owner_id?: number } = {};
      
      if (!canViewAll() && userId) {
        params.owner_id = userId;
      }

      return restaurantService.getAll(params);
    },
  });
}

/**
 * Hook pour récupérer un restaurant par son ID
 */
export function useRestaurant(id: number) {
  return useQuery({
    queryKey: ["restaurants", id],
    queryFn: () => restaurantService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook pour créer un nouveau restaurant
 */
export function useCreateRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      images,
    }: {
      data: RestaurantFormData;
      images?: { mainImage?: File | null; galleryImages?: File[] };
    }) => restaurantService.create(data, images),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      toast.success("Restaurant créé avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la création du restaurant" });
    },
  });
}

/**
 * Hook pour mettre à jour un restaurant existant
 */
export function useUpdateRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
      images,
    }: {
      id: number;
      data: RestaurantFormData;
      images?: { mainImage?: File | null; galleryImages?: File[] };
    }) => restaurantService.update(id, data, images),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["restaurants", variables.id] });
      toast.success("Restaurant modifié avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la modification du restaurant" });
    },
  });
}

/**
 * Hook pour supprimer un restaurant
 */
export function useDeleteRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => restaurantService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      toast.success("Restaurant supprimé avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la suppression du restaurant" });
    },
  });
}

// ========== Menu Categories ==========

/**
 * Hook pour récupérer les catégories de menu d'un restaurant
 */
export function useMenuCategories(restaurantId: number) {
  return useQuery({
    queryKey: ["restaurants", restaurantId, "menu-categories"],
    queryFn: () => restaurantService.getMenuCategories(restaurantId),
    enabled: !!restaurantId,
  });
}

/**
 * Hook pour récupérer une catégorie de menu par ID
 */
export function useMenuCategory(restaurantId: number, categoryId: number) {
  return useQuery({
    queryKey: ["restaurants", restaurantId, "menu-categories", categoryId],
    queryFn: () => restaurantService.getMenuCategoryById(restaurantId, categoryId),
    enabled: !!restaurantId && !!categoryId,
  });
}

/**
 * Hook pour créer une nouvelle catégorie de menu
 */
export function useCreateMenuCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      restaurantId,
      data,
    }: {
      restaurantId: number;
      data: MenuCategoryFormData;
    }) => restaurantService.createMenuCategory(restaurantId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["restaurants", variables.restaurantId, "menu-categories"],
      });
      queryClient.invalidateQueries({ queryKey: ["restaurants", variables.restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["all-menu-categories"] });
      toast.success("Catégorie créée avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la création de la catégorie" });
    },
  });
}

/**
 * Hook pour mettre à jour une catégorie de menu
 */
export function useUpdateMenuCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      restaurantId,
      categoryId,
      data,
    }: {
      restaurantId: number;
      categoryId: number;
      data: MenuCategoryFormData;
    }) => restaurantService.updateMenuCategory(restaurantId, categoryId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["restaurants", variables.restaurantId, "menu-categories"],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "restaurants",
          variables.restaurantId,
          "menu-categories",
          variables.categoryId,
        ],
      });
      queryClient.invalidateQueries({ queryKey: ["all-menu-categories"] });
      toast.success("Catégorie modifiée avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la modification de la catégorie" });
    },
  });
}

/**
 * Hook pour supprimer une catégorie de menu
 */
export function useDeleteMenuCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      restaurantId,
      categoryId,
    }: {
      restaurantId: number;
      categoryId: number;
    }) => restaurantService.deleteMenuCategory(restaurantId, categoryId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["restaurants", variables.restaurantId, "menu-categories"],
      });
      queryClient.invalidateQueries({ queryKey: ["restaurants", variables.restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["all-menu-categories"] });
      toast.success("Catégorie supprimée avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la suppression de la catégorie" });
    },
  });
}

// ========== Menu Items ==========

/**
 * Hook pour récupérer les items de menu d'un restaurant
 */
export function useMenuItems(restaurantId: number, params?: { category_id?: number }) {
  return useQuery({
    queryKey: ["restaurants", restaurantId, "menu-items", params],
    queryFn: () => restaurantService.getMenuItems(restaurantId, params),
    enabled: !!restaurantId,
  });
}

/**
 * Hook pour récupérer toutes les catégories de menu de tous les restaurants
 */
export function useAllMenuCategories() {
  const { canViewAll, getUserId } = usePermissions();
  const userId = getUserId();
  const { data: restaurants = [], isLoading: isLoadingRestaurants } = useRestaurants();

  return useQuery({
    queryKey: ["all-menu-categories", userId, canViewAll(), restaurants.map(r => r.id)],
    queryFn: async () => {
      const allCategories: MenuCategory[] = [];
      
      // Filtrer les restaurants selon les permissions
      const filteredRestaurants = canViewAll() 
        ? restaurants 
        : restaurants.filter(r => r.owner_id === userId);

      // Récupérer les catégories de chaque restaurant en parallèle
      const categoryPromises = filteredRestaurants.map(async (restaurant) => {
        try {
          return await restaurantService.getMenuCategories(restaurant.id);
        } catch (error) {
          console.error(`Error fetching categories for restaurant ${restaurant.id}:`, error);
          return [];
        }
      });

      const results = await Promise.all(categoryPromises);
      allCategories.push(...results.flat());

      return allCategories;
    },
    enabled: !isLoadingRestaurants && restaurants.length > 0,
  });
}

/**
 * Hook pour récupérer tous les items de menu de tous les restaurants
 */
export function useAllMenuItems() {
  const { canViewAll, getUserId } = usePermissions();
  const userId = getUserId();
  const { data: restaurants = [], isLoading: isLoadingRestaurants } = useRestaurants();

  return useQuery({
    queryKey: ["all-menu-items", userId, canViewAll(), restaurants.map(r => r.id)],
    queryFn: async () => {
      const allItems: MenuItem[] = [];
      
      // Filtrer les restaurants selon les permissions
      const filteredRestaurants = canViewAll() 
        ? restaurants 
        : restaurants.filter(r => r.owner_id === userId);

      // Récupérer les items de chaque restaurant en parallèle
      const itemPromises = filteredRestaurants.map(async (restaurant) => {
        try {
          return await restaurantService.getMenuItems(restaurant.id);
        } catch (error) {
          console.error(`Error fetching items for restaurant ${restaurant.id}:`, error);
          return [];
        }
      });

      const results = await Promise.all(itemPromises);
      allItems.push(...results.flat());

      return allItems;
    },
    enabled: !isLoadingRestaurants && restaurants.length > 0,
  });
}

/**
 * Hook pour récupérer un item de menu par ID
 */
export function useMenuItem(restaurantId: number, itemId: number) {
  return useQuery({
    queryKey: ["restaurants", restaurantId, "menu-items", itemId],
    queryFn: () => restaurantService.getMenuItemById(restaurantId, itemId),
    enabled: !!restaurantId && !!itemId,
  });
}

/**
 * Hook pour créer un nouvel item de menu
 */
export function useCreateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      restaurantId,
      data,
      images,
    }: {
      restaurantId: number;
      data: MenuItemFormData;
      images?: { mainImage?: File | null; galleryImages?: File[] };
    }) => restaurantService.createMenuItem(restaurantId, data, images),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["restaurants", variables.restaurantId, "menu-items"],
      });
      queryClient.invalidateQueries({ queryKey: ["restaurants", variables.restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["all-menu-items"] });
  toast.success("Item créé avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la création de l&apos;item" });
    },
  });
}

/**
 * Hook pour mettre à jour un item de menu
 */
export function useUpdateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      restaurantId,
      itemId,
      data,
      images,
    }: {
      restaurantId: number;
      itemId: number;
      data: MenuItemFormData;
      images?: { mainImage?: File | null; galleryImages?: File[] };
    }) => restaurantService.updateMenuItem(restaurantId, itemId, data, images),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["restaurants", variables.restaurantId, "menu-items"],
      });
      queryClient.invalidateQueries({
        queryKey: ["restaurants", variables.restaurantId, "menu-items", variables.itemId],
      });
      queryClient.invalidateQueries({ queryKey: ["restaurants", variables.restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["all-menu-items"] });
  toast.success("Item modifié avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la modification de l&apos;item" });
    },
  });
}

/**
 * Hook pour supprimer un item de menu
 */
export function useDeleteMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      restaurantId,
      itemId,
    }: {
      restaurantId: number;
      itemId: number;
    }) => restaurantService.deleteMenuItem(restaurantId, itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["restaurants", variables.restaurantId, "menu-items"],
      });
      queryClient.invalidateQueries({ queryKey: ["restaurants", variables.restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["all-menu-items"] });
  toast.success("Item supprimé avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la suppression de l&apos;item" });
    },
  });
}

// Export types for convenience
export type { 
  // Entities
  Restaurant,
  RestaurantFormData,
  MenuCategory,
  MenuCategoryFormData,
  MenuItem,
  MenuItemFormData,
};

