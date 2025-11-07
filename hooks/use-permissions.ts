import { useAuth } from "@/context/AuthContext";

/**
 * Liste complète des permissions disponibles dans le système
 */
export const PERMISSIONS = {
  // Gestion des utilisateurs
  VIEW_USERS: 'view users',
  CREATE_USERS: 'create users',
  UPDATE_USERS: 'update users',
  DELETE_USERS: 'delete users',
  VIEW_OWN_PROFILE: 'view own profile',
  UPDATE_OWN_PROFILE: 'update own profile',

  // Gestion des résidences
  VIEW_RESIDENCES: 'view residences',
  CREATE_RESIDENCES: 'create residences',
  UPDATE_RESIDENCES: 'update residences',
  DELETE_RESIDENCES: 'delete residences',
  MANAGE_OWN_RESIDENCES: 'manage own residences',

  // Gestion des hôtels
  VIEW_HOTELS: 'view hotels',
  CREATE_HOTELS: 'create hotels',
  UPDATE_HOTELS: 'update hotels',
  DELETE_HOTELS: 'delete hotels',
  MANAGE_OWN_HOTELS: 'manage own hotels',

  // Gestion des chambres d'hôtel
  VIEW_HOTEL_ROOMS: 'view hotel rooms',
  CREATE_HOTEL_ROOMS: 'create hotel rooms',
  UPDATE_HOTEL_ROOMS: 'update hotel rooms',
  DELETE_HOTEL_ROOMS: 'delete hotel rooms',
  MANAGE_OWN_HOTEL_ROOMS: 'manage own hotel rooms',

  // Gestion des restaurants
  VIEW_RESTAURANTS: 'view restaurants',
  CREATE_RESTAURANTS: 'create restaurants',
  UPDATE_RESTAURANTS: 'update restaurants',
  DELETE_RESTAURANTS: 'delete restaurants',
  MANAGE_OWN_RESTAURANTS: 'manage own restaurants',

  // Gestion des lounges
  VIEW_LOUNGES: 'view lounges',
  CREATE_LOUNGES: 'create lounges',
  UPDATE_LOUNGES: 'update lounges',
  DELETE_LOUNGES: 'delete lounges',
  MANAGE_OWN_LOUNGES: 'manage own lounges',

  // Gestion des night clubs
  VIEW_NIGHT_CLUBS: 'view night clubs',
  CREATE_NIGHT_CLUBS: 'create night clubs',
  UPDATE_NIGHT_CLUBS: 'update night clubs',
  DELETE_NIGHT_CLUBS: 'delete night clubs',
  MANAGE_OWN_NIGHT_CLUBS: 'manage own night clubs',

  // Gestion des réservations
  VIEW_BOOKINGS: 'view bookings',
  CREATE_BOOKINGS: 'create bookings',
  UPDATE_BOOKINGS: 'update bookings',
  DELETE_BOOKINGS: 'delete bookings',
  CONFIRM_BOOKINGS: 'confirm bookings',
  CANCEL_BOOKINGS: 'cancel bookings',
  COMPLETE_BOOKINGS: 'complete bookings',
  MANAGE_OWN_BOOKINGS: 'manage own bookings',

  // Gestion des opinions
  VIEW_OPINIONS: 'view opinions',
  CREATE_OPINIONS: 'create opinions',
  UPDATE_OPINIONS: 'update opinions',
  DELETE_OPINIONS: 'delete opinions',
  MANAGE_OWN_OPINIONS: 'manage own opinions',

  // Gestion des équipements
  VIEW_AMENITIES: 'view amenities',
  CREATE_AMENITIES: 'create amenities',
  UPDATE_AMENITIES: 'update amenities',
  DELETE_AMENITIES: 'delete amenities',

  // Gestion des médias
  UPLOAD_MEDIA: 'upload media',
  VIEW_MEDIA: 'view media',
  DELETE_MEDIA: 'delete media',

  // Gestion financière
  VIEW_WALLETS: 'view wallets',
  MANAGE_WALLETS: 'manage wallets',
  VIEW_WALLET_TRANSACTIONS: 'view wallet transactions',
  MANAGE_WALLET_TRANSACTIONS: 'manage wallet transactions',
  VIEW_WITHDRAWALS: 'view withdrawals',
  MANAGE_WITHDRAWALS: 'manage withdrawals',
  VIEW_COMMISSIONS: 'view commissions',
  MANAGE_COMMISSIONS: 'manage commissions',

  // Gestion des paiements
  INITIALIZE_PAYMENTS: 'initialize payments',
  VERIFY_PAYMENTS: 'verify payments',
  VIEW_RECEIPTS: 'view receipts',

  // Administration
  ACCESS_ADMIN_PANEL: 'access admin panel',
  MANAGE_ALL_RESOURCES: 'manage all resources',
} as const;

/**
 * Type pour les valeurs de permissions
 */
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * Tableau de toutes les permissions (pour faciliter l'itération)
 */
export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS);

/**
 * Hook pour gérer les permissions et rôles de l'utilisateur connecté
 */
export function usePermissions() {
  const { user } = useAuth();

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.role === role;
  };

  /**
   * Vérifie si l'utilisateur a un type spécifique
   */
  const hasType = (type: string): boolean => {
    if (!user) return false;
    return user.type === type;
  };

  /**
   * Vérifie si l'utilisateur a une permission spécifique
   */
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions?.includes(permission) || false;
  };

  /**
   * Vérifie si l'utilisateur est un super administrateur
   */
  const isSuperAdmin = (): boolean => {
    return hasType("SUPER_ADMIN") || hasRole("super_admin");
  };

  /**
   * Vérifie si l'utilisateur est un administrateur
   */
  const isAdmin = (): boolean => {
    return hasType("ADMIN") || hasRole("admin");
  };

  /**
   * Vérifie si l'utilisateur est un propriétaire
   */
  const isOwner = (): boolean => {
    return hasType("OWNER");
  };

  /**
   * Vérifie si l'utilisateur est un client
   */
  const isCustomer = (): boolean => {
    return hasType("CUSTOMER");
  };

  /**
   * Vérifie si l'utilisateur est un administrateur (super admin ou admin)
   */
  const isAnyAdmin = (): boolean => {
    return isSuperAdmin() || isAdmin();
  };

  /**
   * Vérifie si l'utilisateur peut voir toutes les données (super admin ou admin)
   */
  const canViewAll = (): boolean => {
    return isSuperAdmin() || isAdmin();
  };

  /**
   * Vérifie si l'utilisateur peut gérer les utilisateurs
   */
  const canManageUsers = (): boolean => {
    return (
      isSuperAdmin() ||
      hasPermission(PERMISSIONS.MANAGE_ALL_RESOURCES) ||
      (hasPermission(PERMISSIONS.CREATE_USERS) &&
        hasPermission(PERMISSIONS.UPDATE_USERS) &&
        hasPermission(PERMISSIONS.DELETE_USERS))
    );
  };

  /**
   * Vérifie si l'utilisateur peut gérer les résidences
   */
  const canManageResidences = (): boolean => {
    return (
      isSuperAdmin() ||
      hasPermission(PERMISSIONS.MANAGE_ALL_RESOURCES) ||
      hasPermission(PERMISSIONS.MANAGE_OWN_RESIDENCES) ||
      (isAdmin() && hasPermission(PERMISSIONS.CREATE_RESIDENCES))
    );
  };

  /**
   * Vérifie si l'utilisateur peut gérer les réservations
   */
  const canManageBookings = (): boolean => {
    return (
      isSuperAdmin() ||
      hasPermission(PERMISSIONS.MANAGE_ALL_RESOURCES) ||
      hasPermission(PERMISSIONS.MANAGE_OWN_BOOKINGS) ||
      (isAdmin() && hasPermission(PERMISSIONS.VIEW_BOOKINGS))
    );
  };

  /**
   * Vérifie si l'utilisateur peut créer/modifier/supprimer des résidences
   */
  const canCreateResidences = (): boolean => {
    return (
      isSuperAdmin() ||
      hasPermission(PERMISSIONS.MANAGE_ALL_RESOURCES) ||
      hasPermission(PERMISSIONS.CREATE_RESIDENCES) ||
      isOwner()
    );
  };

  /**
   * Vérifie si l'utilisateur peut créer/modifier/supprimer des réservations
   */
  const canCreateBookings = (): boolean => {
    return (
      isSuperAdmin() ||
      hasPermission(PERMISSIONS.MANAGE_ALL_RESOURCES) ||
      hasPermission(PERMISSIONS.CREATE_BOOKINGS) ||
      isOwner() ||
      isCustomer()
    );
  };

  /**
   * Vérifie si l'utilisateur peut accéder au panneau d'administration
   */
  const canAccessAdminPanel = (): boolean => {
    return (
      isSuperAdmin() ||
      isAdmin() ||
      hasPermission(PERMISSIONS.ACCESS_ADMIN_PANEL) ||
      hasPermission(PERMISSIONS.MANAGE_ALL_RESOURCES)
    );
  };

  /**
   * Retourne l'ID de l'utilisateur connecté
   */
  const getUserId = (): number | null => {
    return user?.id || null;
  };

  /**
   * Retourne les business types de l'utilisateur
   */
  const getUserBusinessTypes = (): number[] => {
    if (!user?.businessTypes) return [];
    return user.businessTypes.map((bt) => bt.id);
  };

  return {
    user,
    hasRole,
    hasType,
    hasPermission,
    isSuperAdmin,
    isAdmin,
    isAnyAdmin,
    isOwner,
    isCustomer,
    canViewAll,
    canManageUsers,
    canManageResidences,
    canManageBookings,
    canCreateResidences,
    canCreateBookings,
    canAccessAdminPanel,
    getUserId,
    getUserBusinessTypes,
  };
}

