import { useEffect, useState } from "react";
import { fetchWeatherData } from "../services/api.js";

export default function useWeatherData(city) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!city) {
      setData(null);
      return;
    }
    
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const json = await fetchWeatherData(city);
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setError(err.message ?? "Failed to load forecast");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [city]);

  return { data, loading, error };
}