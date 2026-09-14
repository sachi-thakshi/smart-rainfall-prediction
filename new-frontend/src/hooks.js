import { useState, useEffect } from "react";
import { fetchWeatherData, fetchCropRecommendations } from "./services/api";

export function useAppData(city, season) {
  const [weather, setWeather] = useState(null);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!city) return;
    let active = true;
    setLoading(true);
    setError(null);

    // Backend එකෙන් API දෙකම එකවර Call කිරීම
    Promise.all([
      fetchWeatherData(city),
      fetchCropRecommendations(city, season)
    ]).then(([weatherRes, cropRes]) => {
      if (active) {
        setWeather(weatherRes);
        setCrops(cropRes.smart_recommendations || []);
        setLoading(false);
      }
    }).catch(err => {
      if (active) {
        setError(err.message);
        setLoading(false);
      }
    });

    return () => { active = false; };
  }, [city, season]);

  return { weather, crops, loading, error };
}