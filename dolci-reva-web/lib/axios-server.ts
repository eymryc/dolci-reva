import axios from "axios";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE, laravelApiBase } from "@/lib/auth-session";

const apiServer = axios.create({
  baseURL: laravelApiBase(),
});

apiServer.interceptors.request.use(async (config) => {
  try {
    const jar = await cookies();
    const token = jar.get(ACCESS_TOKEN_COOKIE)?.value;
    if (token && !config.headers?.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Hors request Next (build) : pas de cookies
  }

  if (!config.headers?.Authorization && process.env.API_TOKEN) {
    const token = process.env.API_TOKEN;
    config.headers.Authorization = token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`;
  }
  return config;
});

apiServer.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Erreur d'authentification API");
    }
    return Promise.reject(error);
  }
);

const apiServerPublic = axios.create({
  baseURL: laravelApiBase(),
});

apiServerPublic.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "Erreur API webhook:",
      error.response?.status,
      error.response?.data
    );
    return Promise.reject(error);
  }
);

export default apiServer;
export { apiServerPublic };
