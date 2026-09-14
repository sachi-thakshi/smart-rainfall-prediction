import { useEffect, useState } from "react";
import { fetchCropRecommendations } from "../services/api.js";

export default function useCropRecommendation(city, season) {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // City එකක් නැත්නම් මුකුත් කරන්නේ නෑ
    if (!city || !season) {
      setCrops([]);
      return;
    }
    
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const json = await fetchCropRecommendations(city, season);
        if (!cancelled) setCrops(json.smart_recommendations || []);
      } catch (err) {
        if (!cancelled) setError(err.message ?? "Failed to load recommendations");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [city, season]);

  return { crops, loading, error };
}