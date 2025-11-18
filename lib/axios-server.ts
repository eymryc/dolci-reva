import axios from "axios";

// Instance axios pour les routes API côté serveur (sans localStorage)
const apiServer = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://dolci-reva.achalivre-afrique.ci/api/",
});

// Interceptor pour ajouter un token si fourni (via headers ou env)
apiServer.interceptors.request.use(
  (config) => {
    // Si un token n'est pas déjà dans les headers, utiliser celui des variables d'environnement
    if (!config.headers?.Authorization && process.env.API_TOKEN) {
      const token = process.env.API_TOKEN;
      config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor pour gérer les erreurs globales
apiServer.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gestion globale des erreurs côté serveur
    if (error.response?.status === 401) {
      console.error("Erreur d'authentification API");
    }
    return Promise.reject(error);
  }
);

// Instance axios pour les webhooks publics (sans authentification)
const apiServerPublic = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://dolci-reva.achalivre-afrique.ci/api/",
});

// Interceptor pour gérer les erreurs globales (sans authentification)
apiServerPublic.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gestion globale des erreurs côté serveur
    console.error("Erreur API webhook:", error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default apiServer;
export { apiServerPublic };

