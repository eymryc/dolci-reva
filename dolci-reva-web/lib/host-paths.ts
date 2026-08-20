/** Préfixe URL espace hôte (propriétaire pur) */
export const HOST_BASE = "/proprietaire";

/** Préfixe URL console admin */
export const ADMIN_BASE = "/admin";

/** Segments considérés comme « Mes établissements » pour le lien actif nav */
export const ESTABLISHMENT_SEGMENTS = [
  "establishments",
  "residences",
  "hebergements",
  "hotels",
  "restaurants",
  "lounges",
  "bars",
  "night-clubs",
] as const;

/**
 * Construit un chemin sous /proprietaire
 * @example hostPath("/residences") → "/proprietaire/residences"
 * @example hostPath("residences/new") → "/proprietaire/residences/new"
 */
export function hostPath(path = ""): string {
  const clean = path.replace(/^\/+/, "");
  return clean ? `${HOST_BASE}/${clean}` : HOST_BASE;
}

/**
 * Construit un chemin sous /admin
 */
export function adminPath(path = ""): string {
  const clean = path.replace(/^\/+/, "");
  return clean ? `${ADMIN_BASE}/${clean}` : ADMIN_BASE;
}

/**
 * Chemin back-office selon le rôle (hôte pur → proprietaire, sinon admin)
 */
export function backofficePath(
  path: string,
  opts: { isHostView: boolean }
): string {
  return opts.isHostView ? hostPath(path) : adminPath(path);
}

/** Strip /admin or /proprietaire prefix → relative path like "residences/6" */
export function stripBackofficePrefix(pathname: string): string {
  return pathname
    .replace(/^\/proprietaire\/?/, "")
    .replace(/^\/admin\/?/, "")
    .replace(/^\/+/, "");
}

/** Map current pathname from one base to another */
export function swapBackofficeBase(
  pathname: string,
  to: "host" | "admin"
): string {
  const rest = stripBackofficePrefix(pathname);
  return to === "host" ? hostPath(rest) : adminPath(rest);
}

export type OwnerNavKey =
  | "dashboard"
  | "establishments"
  | "bookings"
  | "operations"
  | "profile";

/**
 * Détermine si un item de nav propriétaire est actif
 * (gère /admin et /proprietaire + verticales établissements)
 */
export function isOwnerNavActive(
  pathname: string,
  key: OwnerNavKey
): boolean {
  const rest = stripBackofficePrefix(pathname);
  const segment = rest.split("/")[0] || "";

  switch (key) {
    case "dashboard":
      return segment === "dashboard" || rest === "";
    case "establishments":
      return (ESTABLISHMENT_SEGMENTS as readonly string[]).includes(segment);
    case "bookings":
      return segment === "bookings";
    case "operations":
      return segment === "operations";
    case "profile":
      return segment === "profile";
    default:
      return false;
  }
}

export const OWNER_SPACE_COOKIE = "dolci_space";
