/** Session auth cookies — httpOnly access token (BFF). */

export const ACCESS_TOKEN_COOKIE = "dolci_access_token";
/** Max-age aligné sur Sanctum (7 jours). */
export const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

export function laravelApiBase(): string {
  const url =
    process.env.LARAVEL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://dolci-reva.com/api/";
  // Si NEXT_PUBLIC pointe vers le proxy, forcer l’upstream Laravel
  if (url.startsWith("/")) {
    return (
      process.env.LARAVEL_API_URL || "http://127.0.0.1:8080/api/"
    ).replace(/\/?$/, "/");
  }
  return url.replace(/\/?$/, "/");
}

export function accessCookieOptions(maxAge = ACCESS_TOKEN_MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
