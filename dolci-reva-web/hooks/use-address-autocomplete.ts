import { useState, useEffect, useCallback } from "react";
import { logger } from "@/lib/logger";

export interface AddressSuggestion {
  geometry: {
    coordinates: [number, number]; // [lon, lat]
  };
  properties: {
    name: string;
    city?: string;
    country?: string;
    countrycode?: string;
    state?: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
    district?: string;
    osm_key?: string;
    osm_value?: string;
    osm_type?: string;
    osm_id?: number;
  };
}

export function useAddressAutocomplete(query: string, debounceMs: number = 200) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      setError(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        // Utiliser Photon (Komoot) - plus rapide et moderne que Nominatim
        const searchQuery = query.trim();
        const url = new URL("https://photon.komoot.io/api");
        url.searchParams.set("q", searchQuery);
        url.searchParams.set("limit", "10");
        url.searchParams.set("lang", "fr");
        // Limiter géographiquement à la Côte d'Ivoire (bbox: minLon,minLat,maxLon,maxLat)
        url.searchParams.set("bbox", "-8.6,4.4,-2.5,10.7");
        
        logger.debug("Fetching Photon:", url.toString());
        
        const response = await fetch(url.toString(), {
          headers: {
            "Accept": "application/json",
          },
          mode: "cors",
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        logger.debug("Photon raw response:", data);
        
        // Photon retourne les données dans un format GeoJSON avec features
        const features = data?.features || [];
        logger.debug("Photon features count:", features.length);
        
        // Filtrer les résultats pour la Côte d'Ivoire (code pays CI)
        const filteredData = features.filter((item: AddressSuggestion) => {
          const countryCode = item.properties?.countrycode?.toLowerCase();
          // Inclure les résultats de CI ou ceux sans code pays (pour plus de résultats)
          return countryCode === "ci" || !countryCode;
        });
        
        logger.debug("Photon filtered results:", filteredData.length, "suggestions", filteredData);
        setSuggestions(filteredData);
      } catch (err) {
        logger.error("Erreur autocomplétion:", err);
        setError(err instanceof Error ? err.message : "Impossible de récupérer les suggestions");
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, debounceMs]);

  const formatAddress = useCallback((suggestion: AddressSuggestion) => {
    const props = suggestion.properties;
    const parts: string[] = [];

    // Construire l'adresse complète
    if (props.housenumber && props.street) {
      parts.push(`${props.housenumber} ${props.street}`);
    } else if (props.street) {
      parts.push(props.street);
    } else if (props.name) {
      parts.push(props.name);
    }

    if (props.district) {
      parts.push(props.district);
    }

    if (props.city) {
      parts.push(props.city);
    }

    if (props.state) {
      parts.push(props.state);
    }

    if (props.country) {
      parts.push(props.country);
    }

    return parts.join(", ") || props.name || "";
  }, []);

  return {
    suggestions,
    loading,
    error,
    formatAddress,
  };
}

