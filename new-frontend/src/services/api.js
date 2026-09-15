const API_BASE = "http://127.0.0.1:8000";

export async function fetchWeatherData(city) {
  const res = await fetch(`${API_BASE}/predict-live?city=${encodeURIComponent(city)}`);
  if (!res.ok) throw new Error("Failed to fetch weather");
  return await res.json();
}

export async function fetchCropRecommendations(city, season) {
  const res = await fetch(`${API_BASE}/smart-recommendation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ city, season }),
  });
  if (!res.ok) throw new Error("Failed to fetch crops");
  return await res.json();
}

// --- අලුතින් එක් කළ කොටස ---
export async function fetchCities() {
  const res = await fetch(`${API_BASE}/cities`);
  if (!res.ok) throw new Error("Failed to fetch cities");
  return await res.json();
}