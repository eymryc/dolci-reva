import { useAuth } from "@/context/AuthContext";

/**
 * Catalogue de permission-strings (legacy / future Spatie).
 * Aujourd'hui l'API n'envoie que `user.type` — les helpers ci-dessous
 * s'appuient sur le type. Les strings restent utiles si Spatie est branché plus tard.
 */
export const PERMISSIONS = {
  VIEW_USERS: "view users",
  CREATE_USERS: "create users",
  UPDATE_USERS: "update users",
  DELETE_USERS: "delete users",
  VIEW_OWN_PROFILE: "view own profile",
  UPDATE_OWN_PROFILE: "update own profile",
  VIEW_RESIDENCES: "view residences",
  CREATE_RESIDENCES: "create residences",
  UPDATE_RESIDENCES: "update residences",
  DELETE_RESIDENCES: "delete residences",
  MANAGE_OWN_RESIDENCES: "manage own residences",
  VIEW_HOTELS: "view hotels",
  CREATE_HOTELS: "create hotels",
  UPDATE_HOTELS: "update hotels",
  DELETE_HOTELS: "delete hotels",
  MANAGE_OWN_HOTELS: "manage own hotels",
  VIEW_HOTEL_ROOMS: "view hotel rooms",
  CREATE_HOTEL_ROOMS: "create hotel rooms",
  UPDATE_HOTEL_ROOMS: "update hotel rooms",
  DELETE_HOTEL_ROOMS: "delete hotel rooms",
  MANAGE_OWN_HOTEL_ROOMS: "manage own hotel rooms",
  VIEW_RESTAURANTS: "view restaurants",
  CREATE_RESTAURANTS: "create restaurants",
  UPDATE_RESTAURANTS: "update restaurants",
  DELETE_RESTAURANTS: "delete restaurants",
  MANAGE_OWN_RESTAURANTS: "manage own restaurants",
  VIEW_LOUNGES: "view lounges",
  CREATE_LOUNGES: "create lounges",
  UPDATE_LOUNGES: "update lounges",
  DELETE_LOUNGES: "delete lounges",
  MANAGE_OWN_LOUNGES: "manage own lounges",
  VIEW_NIGHT_CLUBS: "view night clubs",
  CREATE_NIGHT_CLUBS: "create night clubs",
  UPDATE_NIGHT_CLUBS: "update night clubs",
  DELETE_NIGHT_CLUBS: "delete night clubs",
  MANAGE_OWN_NIGHT_CLUBS: "manage own night clubs",
  VIEW_BOOKINGS: "view bookings",
  CREATE_BOOKINGS: "create bookings",
  UPDATE_BOOKINGS: "update bookings",
  DELETE_BOOKINGS: "delete bookings",
  CONFIRM_BOOKINGS: "confirm bookings",
  CANCEL_BOOKINGS: "cancel bookings",
  COMPLETE_BOOKINGS: "complete bookings",
  MANAGE_OWN_BOOKINGS: "manage own bookings",
  VIEW_OPINIONS: "view opinions",
  CREATE_OPINIONS: "create opinions",
  UPDATE_OPINIONS: "update opinions",
  DELETE_OPINIONS: "delete opinions",
  MANAGE_OWN_OPINIONS: "manage own opinions",
  VIEW_AMENITIES: "view amenities",
  CREATE_AMENITIES: "create amenities",
  UPDATE_AMENITIES: "update amenities",
  DELETE_AMENITIES: "delete amenities",
  UPLOAD_MEDIA: "upload media",
  VIEW_MEDIA: "view media",
  DELETE_MEDIA: "delete media",
  VIEW_WALLETS: "view wallets",
  MANAGE_WALLETS: "manage wallets",
  VIEW_WALLET_TRANSACTIONS: "view wallet transactions",
  MANAGE_WALLET_TRANSACTIONS: "manage wallet transactions",
  VIEW_WITHDRAWALS: "view withdrawals",
  MANAGE_WITHDRAWALS: "manage withdrawals",
  VIEW_COMMISSIONS: "view commissions",
  MANAGE_COMMISSIONS: "manage commissions",
  INITIALIZE_PAYMENTS: "initialize payments",
  VERIFY_PAYMENTS: "verify payments",
  VIEW_RECEIPTS: "view receipts",
  ACCESS_ADMIN_PANEL: "access admin panel",
  MANAGE_ALL_RESOURCES: "manage all resources",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS);

/**
 * Contraintes de vue / action basées sur `users.type`
 * (CUSTOMER | OWNER | ADMIN | SUPER_ADMIN).
 */
export function usePermissions() {
  const { user } = useAuth();

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.role === role || user.type?.toLowerCase() === role.toLowerCase();
  };

  const hasType = (type: string): boolean => {
    if (!user) return false;
    return user.type === type;
  };

  const isSuperAdmin = (): boolean =>
    hasType("SUPER_ADMIN") || hasRole("super_admin");

  const isAdmin = (): boolean => hasType("ADMIN") || hasRole("admin");

  const isOwner = (): boolean => hasType("OWNER");

  const isCustomer = (): boolean => hasType("CUSTOMER");

  const isAnyAdmin = (): boolean => isSuperAdmin() || isAdmin();

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (isAnyAdmin()) return true;
    return user.permissions?.includes(permission) || false;
  };

  const canViewAll = (): boolean => isAnyAdmin();

  /** ADMIN + SUPER_ADMIN peuvent gérer les utilisateurs (UI + API). */
  const canManageUsers = (): boolean => isAnyAdmin();

  const canManageResidences = (): boolean => isAnyAdmin() || isOwner();

  const canManageBookings = (): boolean => isAnyAdmin() || isOwner() || isCustomer();

  const canCreateResidences = (): boolean => isAnyAdmin() || isOwner();

  const canCreateEstablishments = (): boolean => isAnyAdmin() || isOwner();

  const canCreateBookings = (): boolean =>
    isAnyAdmin() || isOwner() || isCustomer();

  const canAccessAdminPanel = (): boolean => isAnyAdmin() || isOwner();

  const canAccessAdminOnly = (): boolean => isAnyAdmin();

  const getUserId = (): number | null => user?.id || null;

  const getUserBusinessTypes = (): number[] => {
    if (!user?.businessTypes) return [];
    return user.businessTypes.map((bt) => bt.id);
  };

  const canReviewDocuments = (): boolean => isAnyAdmin();
  const canApproveOwner = (): boolean => isAnyAdmin();
  const canRejectOwner = (): boolean => isAnyAdmin();
  const canSuspendOwner = (): boolean => isAnyAdmin();
  const canManageOwnerVerifications = (): boolean => isAnyAdmin();
  const canManageFinance = (): boolean => isAnyAdmin();
  const canManageSettings = (): boolean => isAnyAdmin();

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
    canCreateEstablishments,
    canCreateBookings,
    canAccessAdminPanel,
    canAccessAdminOnly,
    canReviewDocuments,
    canApproveOwner,
    canRejectOwner,
    canSuspendOwner,
    canManageOwnerVerifications,
    canManageFinance,
    canManageSettings,
    getUserId,
    getUserBusinessTypes,
  };
}
