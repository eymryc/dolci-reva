import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usePermissions } from "./use-permissions";
import { handleError } from "@/lib/error-handler";
import { nightlifeVenueService } from "@/services/nightlife-venue.service";
import type {
  NightlifeVenue,
  NightlifeVenueFormData,
  NightlifeVenueProductCategory,
  NightlifeVenueProductCategoryFormData,
  NightlifeVenueProduct,
  NightlifeVenueProductFormData,
} from "@/types/entities/nightlife-venue.types";

/**
 * Hook pour récupérer tous les lounges
 */
export function useLounges() {
  const { canViewAll, getUserId } = usePermissions();
  const userId = getUserId();

  return useQuery({
    queryKey: ["lounges", userId, canViewAll()],
    queryFn: async () => {
      const params: { owner_id?: number } = {};
      
      if (!canViewAll() && userId) {
        params.owner_id = userId;
      }

      return nightlifeVenueService.getAll(params);
    },
  });
}

/**
 * Hook pour récupérer un lounge par son ID
 */
export function useLounge(id: number) {
  return useQuery({
    queryKey: ["lounges", id],
    queryFn: () => nightlifeVenueService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook pour créer un nouveau lounge
 */
export function useCreateLounge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      images,
    }: {
      data: NightlifeVenueFormData;
      images?: { mainImage?: File | null; galleryImages?: File[] };
    }) => nightlifeVenueService.create(data, images),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lounges"] });
      toast.success("Lounge créé avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la création du lounge" });
    },
  });
}

/**
 * Hook pour mettre à jour un lounge existant
 */
export function useUpdateLounge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
      images,
    }: {
      id: number;
      data: NightlifeVenueFormData;
      images?: { mainImage?: File | null; galleryImages?: File[] };
    }) => nightlifeVenueService.update(id, data, images),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lounges"] });
      queryClient.invalidateQueries({ queryKey: ["lounges", variables.id] });
      toast.success("Lounge modifié avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la modification du lounge" });
    },
  });
}

/**
 * Hook pour supprimer un lounge
 */
export function useDeleteLounge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => nightlifeVenueService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lounges"] });
      toast.success("Lounge supprimé avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la suppression du lounge" });
    },
  });
}

// ========== Lounge Product Categories ==========

/**
 * Hook pour récupérer les catégories de produits d'un lounge
 */
export function useLoungeProductCategories(loungeId: number) {
  return useQuery({
    queryKey: ["lounges", loungeId, "lounge-product-categories"],
    queryFn: () => nightlifeVenueService.getLoungeProductCategories(loungeId),
    enabled: !!loungeId,
  });
}

/**
 * Hook pour récupérer une catégorie de produit par ID
 */
export function useLoungeProductCategory(loungeId: number, categoryId: number) {
  return useQuery({
    queryKey: ["lounges", loungeId, "lounge-product-categories", categoryId],
    queryFn: () => nightlifeVenueService.getLoungeProductCategoryById(loungeId, categoryId),
    enabled: !!loungeId && !!categoryId,
  });
}

/**
 * Hook pour créer une nouvelle catégorie de produit
 */
export function useCreateLoungeProductCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      loungeId,
      data,
    }: {
      loungeId: number;
      data: NightlifeVenueProductCategoryFormData;
    }) => nightlifeVenueService.createLoungeProductCategory(loungeId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["lounges", variables.loungeId, "lounge-product-categories"],
      });
      queryClient.invalidateQueries({ queryKey: ["lounges", variables.loungeId] });
      queryClient.invalidateQueries({ queryKey: ["all-lounge-product-categories"] });
      toast.success("Catégorie créée avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la création de la catégorie" });
    },
  });
}

/**
 * Hook pour mettre à jour une catégorie de produit
 */
export function useUpdateLoungeProductCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      loungeId,
      categoryId,
      data,
    }: {
      loungeId: number;
      categoryId: number;
      data: NightlifeVenueProductCategoryFormData;
    }) => nightlifeVenueService.updateLoungeProductCategory(loungeId, categoryId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["lounges", variables.loungeId, "lounge-product-categories"],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "lounges",
          variables.loungeId,
          "lounge-product-categories",
          variables.categoryId,
        ],
      });
      queryClient.invalidateQueries({ queryKey: ["all-lounge-product-categories"] });
      toast.success("Catégorie modifiée avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la modification de la catégorie" });
    },
  });
}

/**
 * Hook pour supprimer une catégorie de produit
 */
export function useDeleteLoungeProductCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      loungeId,
      categoryId,
    }: {
      loungeId: number;
      categoryId: number;
    }) => nightlifeVenueService.deleteLoungeProductCategory(loungeId, categoryId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["lounges", variables.loungeId, "lounge-product-categories"],
      });
      queryClient.invalidateQueries({ queryKey: ["lounges", variables.loungeId] });
      queryClient.invalidateQueries({ queryKey: ["all-lounge-product-categories"] });
      toast.success("Catégorie supprimée avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la suppression de la catégorie" });
    },
  });
}

// ========== Lounge Products ==========

/**
 * Hook pour récupérer les produits d'un lounge
 */
export function useLoungeProducts(loungeId: number, params?: { category_id?: number }) {
  return useQuery({
    queryKey: ["lounges", loungeId, "products", params],
    queryFn: () => nightlifeVenueService.getLoungeProducts(loungeId, params),
    enabled: !!loungeId,
  });
}

/**
 * Hook pour récupérer toutes les catégories de produits de tous les lounges
 */
export function useAllLoungeProductCategories() {
  const { canViewAll, getUserId } = usePermissions();
  const userId = getUserId();
  const { data: lounges = [], isLoading: isLoadingLounges } = useLounges();

  return useQuery({
    queryKey: ["all-lounge-product-categories", userId, canViewAll(), lounges.map(l => l.id)],
    queryFn: async () => {
      const allCategories: NightlifeVenueProductCategory[] = [];
      
      // Filtrer les lounges selon les permissions
      const filteredLounges = canViewAll() 
        ? lounges 
        : lounges.filter(l => l.owner_id === userId);

      // Récupérer les catégories de chaque lounge en parallèle
      const categoryPromises = filteredLounges.map(async (lounge) => {
        try {
          return await nightlifeVenueService.getLoungeProductCategories(lounge.id);
        } catch (error) {
          console.error(`Error fetching categories for lounge ${lounge.id}:`, error);
          return [];
        }
      });

      const results = await Promise.all(categoryPromises);
      allCategories.push(...results.flat());

      return allCategories;
    },
    enabled: !isLoadingLounges && lounges.length > 0,
  });
}

/**
 * Hook pour récupérer tous les produits de tous les lounges
 */
export function useAllLoungeProducts() {
  const { canViewAll, getUserId } = usePermissions();
  const userId = getUserId();
  const { data: lounges = [], isLoading: isLoadingLounges } = useLounges();

  return useQuery({
    queryKey: ["all-lounge-products", userId, canViewAll(), lounges.map(l => l.id)],
    queryFn: async () => {
      const allProducts: NightlifeVenueProduct[] = [];
      
      // Filtrer les lounges selon les permissions
      const filteredLounges = canViewAll() 
        ? lounges 
        : lounges.filter(l => l.owner_id === userId);

      // Récupérer les produits de chaque lounge en parallèle
      const productPromises = filteredLounges.map(async (lounge) => {
        try {
          return await nightlifeVenueService.getLoungeProducts(lounge.id);
        } catch (error) {
          console.error(`Error fetching products for lounge ${lounge.id}:`, error);
          return [];
        }
      });

      const results = await Promise.all(productPromises);
      allProducts.push(...results.flat());

      return allProducts;
    },
    enabled: !isLoadingLounges && lounges.length > 0,
  });
}

/**
 * Hook pour récupérer un produit par ID
 */
export function useLoungeProduct(loungeId: number, productId: number) {
  return useQuery({
    queryKey: ["lounges", loungeId, "products", productId],
    queryFn: () => nightlifeVenueService.getLoungeProductById(loungeId, productId),
    enabled: !!loungeId && !!productId,
  });
}

/**
 * Hook pour créer un nouveau produit
 */
export function useCreateLoungeProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      loungeId,
      data,
      images,
    }: {
      loungeId: number;
      data: NightlifeVenueProductFormData;
      images?: { mainImage?: File | null; galleryImages?: File[] };
    }) => nightlifeVenueService.createLoungeProduct(loungeId, data, images),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["lounges", variables.loungeId, "products"],
      });
      queryClient.invalidateQueries({ queryKey: ["lounges", variables.loungeId] });
      queryClient.invalidateQueries({ queryKey: ["all-lounge-products"] });
      toast.success("Produit créé avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la création du produit" });
    },
  });
}

/**
 * Hook pour mettre à jour un produit
 */
export function useUpdateLoungeProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      loungeId,
      productId,
      data,
      images,
    }: {
      loungeId: number;
      productId: number;
      data: NightlifeVenueProductFormData;
      images?: { mainImage?: File | null; galleryImages?: File[] };
    }) => nightlifeVenueService.updateLoungeProduct(loungeId, productId, data, images),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["lounges", variables.loungeId, "products"],
      });
      queryClient.invalidateQueries({
        queryKey: ["lounges", variables.loungeId, "products", variables.productId],
      });
      queryClient.invalidateQueries({ queryKey: ["lounges", variables.loungeId] });
      queryClient.invalidateQueries({ queryKey: ["all-lounge-products"] });
      toast.success("Produit modifié avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la modification du produit" });
    },
  });
}

/**
 * Hook pour supprimer un produit
 */
export function useDeleteLoungeProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      loungeId,
      productId,
    }: {
      loungeId: number;
      productId: number;
    }) => nightlifeVenueService.deleteLoungeProduct(loungeId, productId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["lounges", variables.loungeId, "products"],
      });
      queryClient.invalidateQueries({ queryKey: ["lounges", variables.loungeId] });
      queryClient.invalidateQueries({ queryKey: ["all-lounge-products"] });
      toast.success("Produit supprimé avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la suppression du produit" });
    },
  });
}

// Export types for convenience
export type { 
  NightlifeVenue, 
  NightlifeVenueFormData, 
  NightlifeVenueProductCategory, 
  NightlifeVenueProductCategoryFormData, 
  NightlifeVenueProduct, 
  NightlifeVenueProductFormData,
};



