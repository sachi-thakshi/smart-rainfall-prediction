import { useMemo, useState, useEffect } from "react";
import WeatherHero from "../components/weather/WeatherHero.jsx";
import DayToggle from "../components/weather/DayToggle.jsx";
import WeatherDetails from "../components/weather/WeatherDetails.jsx";
import SeasonTabs from "../components/farming/SeasonTabs.jsx";
import CropList from "../components/farming/CropList.jsx";
import CityModal from "../components/weather/CityModal.jsx";
import useWeatherData from "../hooks/useWeatherData.js";
import useCropRecommendation from "../hooks/useCropRecommendation.js";
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

  return (
    <div className="flex flex-1 flex-col h-full min-h-screen">
      
      {/* --- Dynamic Weather Zone --- */}
      <section
        data-condition={activeCity && prediction ? conditionToken : "clear"}
        className="bg-sky-dynamic flex flex-col gap-4 px-5 pb-10 pt-8 min-h-112.5 transition-colors duration-700"
      >
        
        <div className="flex justify-center mb-2">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 transition shadow-lg"
          >
            {activeCity ? `${activeCity} ▼` : "➕ Add your city"}
          </button>
        </div>

        {!activeCity && !weatherLoading && (
          <div className="flex flex-col items-center justify-center flex-1 text-white/90 text-center mt-10">
            <span className="text-6xl mb-4">🌍</span>
            <h2 className="text-2xl font-bold mb-2">Welcome to SmartRain</h2>
            <p className="text-sm">Click the button above to add your city.</p>
          </div>
        )}

        {weatherLoading && (
          <div className="py-10 text-center text-sm font-bold text-white animate-pulse">Fetching Live Data...</div>
        )}

        {weatherError && (
          <div className="rounded-2xl bg-red-500/80 px-4 py-4 mt-4 text-sm font-bold text-white shadow-lg">
            ⚠️ {weatherError}
          </div>
        )}

        {!weatherLoading && !weatherError && prediction && activeCity && (
          <>
            <div className="flex items-center justify-between mt-4">
              <WeatherHero station={weather.weather_station} prediction={prediction} />
              <DayToggle value={day} onChange={setDay} />
            </div>
            <WeatherDetails prediction={prediction} />
          </>
        )}
      </section>

      {/* --- Smart Farming Zone --- */}
      <section className="clay-surface flex flex-1 flex-col gap-4 rounded-t-4xl bg-surface px-5 pb-8 pt-6 -mt-4 z-10 relative">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink tracking-tight">Smart Farming</h2>
          <p className="text-sm text-ink-muted mt-1">
            {activeCity ? `Crop suggestions for ${activeCity}, ranked by ML confidence.` : 'Select a city to view crop recommendations.'}
          </p>
        </div>

        <SeasonTabs activeSeason={season} onChange={setSeason} />
        
        <div className="flex-1 overflow-y-auto no-scrollbar pb-4">
          {!activeCity ? (
            <div className="text-gray-400 text-sm mt-4 text-center bg-gray-50 rounded-2xl p-6 border border-gray-100">
              No city selected.
            </div>
          ) : (
            <CropList crops={crops} loading={cropsLoading} error={cropsError} />
          )}
        </div>
      </section>

      {/* --- City Selection Modal --- */}
      <CityModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        savedCities={savedCities} 
        allCities={allCities} 
        onAddCity={handleAddCity} 
        onRemoveCity={handleRemoveCity} 
      />

    </div>
  );
}