import { useMemo, useState, useEffect } from "react";
import WeatherHero from "../components/weather/WeatherHero.jsx";
import WeatherStatsStrip from "../components/weather/WeatherStatsStrip.jsx";
import DayToggle from "../components/weather/DayToggle.jsx";
import SeasonTabs from "../components/farming/SeasonTabs.jsx";
import CropList from "../components/farming/CropList.jsx";
import CityModal from "../components/weather/CityModal.jsx";
import WeatherMap from "../components/weather/WeatherMap.jsx";
import SkyBackdrop from "../components/weather/sky/SkyBackdrop.jsx";
import DailyForecastList from "../components/weather/DailyForecastList.jsx";
import useWeatherData from "../hooks/useWeatherData.js";
import useCropRecommendation from "../hooks/useCropRecommendation.js";
import WeeklyForecastChart from "../components/weather/WeeklyForecastChart.jsx";
import Footer from "../components/layout/Footer.jsx";

import { resolveCondition } from "../utils/weatherCondition.js";
import { fetchCities } from "../services/api.js";

export default function Home() {
  const [savedCities, setSavedCities] = useState(() => {
    const saved = localStorage.getItem("smartrain_cities");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeCity, setActiveCity] = useState(savedCities[0] || "");
  const [day, setDay] = useState("today");
  const [season, setSeason] = useState("maha");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allCities, setAllCities] = useState([]);

  useEffect(() => {
    fetchCities().then(res => setAllCities(res.cities || [])).catch(e => console.error(e));
  }, []);

  const { data: weather, loading: weatherLoading, error: weatherError } = useWeatherData(activeCity);
  const { crops, loading: cropsLoading, error: cropsError } = useCropRecommendation(activeCity, season);

  const prediction = day === "today" ? weather?.prediction_today : weather?.prediction_tomorrow;

  const conditionToken = useMemo(
    () => resolveCondition(prediction?.weather_condition).token,
    [prediction]
  );

  function handleAddCity(cityName) {
    let newSaved = savedCities;
    if (!savedCities.includes(cityName)) {
      newSaved = [cityName, ...savedCities];
      setSavedCities(newSaved);
      localStorage.setItem("smartrain_cities", JSON.stringify(newSaved));
    }
    setActiveCity(cityName);
    setIsModalOpen(false);
  }

  function handleRemoveCity(cityName, e) {
    e.stopPropagation();
    const newSaved = savedCities.filter((c) => c !== cityName);
    setSavedCities(newSaved);
    localStorage.setItem("smartrain_cities", JSON.stringify(newSaved));

    if (activeCity === cityName) {
      setActiveCity(newSaved.length > 0 ? newSaved[0] : "");
    }
  }

  function handleMapCitySelect(city) {
    if (!savedCities.includes(city)) {
      const updated = [city, ...savedCities];
      setSavedCities(updated);
      localStorage.setItem("smartrain_cities", JSON.stringify(updated));
    }
    setActiveCity(city);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">

      {/* --- Dynamic Weather Zone --- */}
      <section
        data-condition={activeCity && prediction ? conditionToken : "clear"}
        className="relative flex min-h-dvh flex-col overflow-hidden bg-sky-dynamic px-5 pb-10 pt-6 transition-colors duration-700"
      >
        <SkyBackdrop
          token={activeCity && prediction ? conditionToken : "clear"}
          windy={prediction?.wind_speed_kmh > 15}
        />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xl font-semibold text-white flex items-center gap-1.5"
          >
            {activeCity || "Add your city"} <span className="text-sm text-white/60">▾</span>
          </button>

          {!weatherLoading && !weatherError && prediction && activeCity && (
            <DayToggle value={day} onChange={setDay} />
          )}
        </div>

        {!activeCity && !weatherLoading && (
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-white/90 text-center">
            <span className="text-6xl mb-4">🌍</span>
            <h2 className="text-2xl font-bold mb-2">Welcome to SmartRain</h2>
            <p className="text-sm">Tap your city name above to add one, or pick from the map below.</p>
          </div>
        )}

        {weatherLoading && (
          <div className="relative z-10 flex flex-1 items-center justify-center text-center text-sm font-bold text-white animate-pulse">
            Fetching Live Data...
          </div>
        )}

        {weatherError && (
          <div className="relative z-10 clay-chip mt-8 bg-red-500/80 px-4 py-4 text-sm font-bold text-white max-w-2xl mx-auto w-full">
            ⚠️ {weatherError}
          </div>
        )}

        {!weatherLoading && !weatherError && prediction && activeCity && (
          <>
            <div className="flex flex-1 flex-col items-center justify-center relative z-10">
              <WeatherHero prediction={prediction} />
              <div className="mt-6 w-full">
                <WeatherStatsStrip prediction={prediction} />
              </div>
            </div>

            <div className="mt-auto relative z-10 w-full pt-8">
              <DailyForecastList city={activeCity} />
            </div>
          </>
        )}
      </section>

      {/* --- Main Content Layout --- */}
      <section className="relative -mt-6 z-10 flex-1 overflow-hidden rounded-t-4xl px-5 pb-12 pt-8">
        {/* Soft layered background instead of flat white */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(1200px 500px at 15% -10%, color-mix(in srgb, var(--color-rice) 8%, transparent), transparent), radial-gradient(1000px 500px at 100% 10%, color-mix(in srgb, var(--sky-clear-to) 14%, transparent), transparent), var(--color-surface)",
          }}
        />

        <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-2 gap-10">

          <div className="flex flex-col gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-ink tracking-tight">Smart Farming</h2>
              <p className="text-sm text-ink-muted mt-1 mb-4">
                {activeCity ? `Crop suggestions for ${activeCity}, ranked by ML confidence.` : "Select a city to view crop recommendations."}
              </p>
            </div>

            <SeasonTabs activeSeason={season} onChange={setSeason} />

            <div className="mt-2">
              {!activeCity ? (
                <div className="clay-panel text-ink-muted text-sm mt-4 text-center p-6">
                  No city selected.
                </div>
              ) : (
                <CropList crops={crops} loading={cropsLoading} error={cropsError} />
              )}
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-ink tracking-tight mt-10">7-Day Forecast</h2>
              <p className="text-sm text-ink-muted mt-1 mb-4">
                {activeCity ? `Meteorological trends for ${activeCity}.` : "Select a city to view the 7-day forecast."}
              </p>
              <WeeklyForecastChart city={activeCity} />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <WeatherMap
              day={day}
              onDayChange={setDay}
              onSelectCity={handleMapCitySelect}
            />
          </div>

        </div>
      </section>

      <CityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        savedCities={savedCities}
        allCities={allCities}
        onAddCity={handleAddCity}
        onRemoveCity={handleRemoveCity}
      />

      <Footer />
    </div>
  );
}