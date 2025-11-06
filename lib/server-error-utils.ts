/**
 * Utilitaires pour gérer les erreurs du serveur
 */

/**
 * Mapping par défaut des noms de champs du serveur (snake_case) vers les labels français
 */
export const defaultFieldLabels: Record<string, string> = {
  first_name: "Prénom",
  last_name: "Nom",
  email: "Email",
  phone: "Téléphone",
  password: "Mot de passe",
  password_confirmation: "Confirmation du mot de passe",
  confirm_password: "Confirmation du mot de passe",
  type: "Type de compte",
  services: "Types de services",
  name: "Nom",
  description: "Description",
  price: "Prix",
  address: "Adresse",
  city: "Ville",
  country: "Pays",
  postal_code: "Code postal",
  postalCode: "Code postal",
  business_type_ids: "Types de services",
  businessTypeIds: "Types de services",
  amenities: "Équipements",
  venue: "Lieu",
  date: "Date",
  time: "Heure",
  title: "Titre",
  content: "Contenu",
  rating: "Note",
  status: "Statut",
};

/**
 * Crée un mapping de labels personnalisé en fusionnant avec les labels par défaut
 */
export function createFieldLabels(customLabels: Record<string, string> = {}): Record<string, string> {
  return {
    ...defaultFieldLabels,
    ...customLabels,
  };
}

