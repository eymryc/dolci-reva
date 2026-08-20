/**
 * Configuration d'environnement. Ne JAMAIS mettre de secret ici : tout ce qui
 * est préfixé EXPO_PUBLIC_ est lisible dans le bundle client (cf. doc Expo).
 * Même API que le web (NEXT_PUBLIC_API_URL) avec le même fallback de prod.
 */
export const env = {
  apiUrl:
    process.env.EXPO_PUBLIC_API_URL ??
    'https://dolci-reva.achalivre-afrique.ci/api/',
};
