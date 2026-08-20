import type { FeatureCategory, FeatureOption } from "@/types/common";

/**
 * Aplatit les catégories de caractéristiques en une simple liste d'options,
 * pour les aperçus compacts (cartes de listing) où le regroupement par
 * catégorie n'a pas sa place — cf. FeatureCategoriesDisplay pour l'affichage
 * complet groupé (fiche détail).
 */
export function flattenFeatureOptions(categories?: FeatureCategory[] | null): FeatureOption[] {
  if (!categories) return [];
  return categories.flatMap((category) => category.options);
}
