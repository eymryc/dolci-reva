import axios from "axios";

/**
 * Client browser → BFF Next (`/api/backend/*`) qui injecte le Bearer
 * depuis le cookie httpOnly. Aucun token dans localStorage.
 */
const api = axios.create({
  baseURL: "/api/backend/",
  withCredentials: true,
});

function isProtectedAppPath(pathname: string): boolean {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/customer") ||
    pathname.startsWith("/proprietaire")
  );
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const pathname = window.location.pathname;
      const isAuthPage =
        pathname.startsWith("/auth") || pathname.startsWith("/admin/login");

      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch {
        /* ignore */
      }

      // Ne pas éjecter les visiteurs FO (home, listings…) : seul un 401
      // sur zone app protégée force la reconnexion.
      if (!isAuthPage && isProtectedAppPath(pathname)) {
        window.location.href = `/auth/sign-in?next=${encodeURIComponent(pathname)}`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
