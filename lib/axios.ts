import axios from "axios";

const api = axios.create({
  baseURL: "http://v2-dolcireva-api.test/api/",
  //withCredentials: true, // Utile si tu utilises Sanctum ou les cookies
  // baseURL: "https://dolci-reva.achalivre-afrique.ci/api/",
});

// Interceptor pour ajouter un token ou autre header
api.interceptors.request.use(
   (config) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
  (error) => Promise.reject(error)
);

// Interceptor pour gérer les erreurs globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Exemple : gestion globale des erreurs
    if (error.response?.status === 401) {
      // ... action de déconnexion ou redirection
    }
    return Promise.reject(error);
  }
);

export default api; 