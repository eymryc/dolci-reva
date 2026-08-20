/**
 * Types communs partagés dans l'application
 */

/**
 * Option sélectionnable au sein d'une catégorie de caractéristiques
 * (ex: "Vue sur mer" dans la catégorie "Vues"). Entièrement paramétrable
 * depuis l'admin ; le propriétaire ne fait que cocher parmi les options
 * existantes.
 */
export interface FeatureOption {
  id: number;
  name: string;
  has_surcharge: boolean;
}

/**
 * Catégorie de caractéristiques (ex: "Vues", "Literie", "Salle de bain"...),
 * avec ses options associées.
 */
export interface FeatureCategory {
  id: number;
  name: string;
  icon?: string | null;
  /**
   * FQCN des modèles concernés (ex: "App\Models\Residence"), présent quand
   * la catégorie est chargée pour l'admin (gestion du catalogue) ; absent
   * du sous-objet imbriqué renvoyé par `groupedFeatureOptions()` côté
   * établissement (hotel.feature_categories, etc.).
   */
  establishment_types?: string[];
  options: FeatureOption[];
}

/**
 * Type pour un propriétaires
 */
export interface Owner {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  type?: string;
  verification_status?: string;
  created_at?: string;
  updated_at?: string;
}
