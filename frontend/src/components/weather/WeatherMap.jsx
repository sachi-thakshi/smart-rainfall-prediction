import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Compass,
  Search,
  Droplets,
  RotateCcw,
  Sparkles,
  CloudRain
} from 'lucide-react';
import DayToggle from './DayToggle.jsx';
import { fetchCitiesOverview } from '../../services/api';

// Sri Lanka only — panning/zooming out never reveals neighbouring countries
const SRI_LANKA_BOUNDS = [
  [5.6, 79.3], // southwest
  [9.9, 82.0], // northeast
];
const PAN_LIMIT_BOUNDS = [
  [4.8, 78.5],
  [10.4, 82.6],
];
const MIN_ZOOM = 7;
const MAX_ZOOM = 13;

// Fits the island to whatever screen size/aspect is available, and re-fits
// on mount and whenever the map container resizes (e.g. rotate on mobile).
function FitToSriLanka({ trigger }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(SRI_LANKA_BOUNDS, { padding: [12, 12] });
  }, [map, trigger]);

  useEffect(() => {
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [map]);

  return null;
}

function FlyToCity({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 0.8 });
  }, [center, zoom, map]);
  return null;
}

function getConditionVisual(condition = 'clear') {
  switch (condition.toLowerCase()) {
    case 'severe':
      return { icon: '⛈️', bg: '#ef4444', text: 'Severe Rain' };
    case 'rainy':
      return { icon: '🌧️', bg: '#0284c7', text: 'Rain' };
    case 'hot':
      return { icon: '☀️', bg: '#f59e0b', text: 'Hot / Sunny' };
    case 'clear':
    default:
      return { icon: '🌤️', bg: '#10b981', text: 'Clear' };
  }
}

function createWeatherPin(cityName, weatherData, isSelected = false) {
  const { icon, bg } = getConditionVisual(weatherData?.condition);
  const temp = weatherData?.temp !== undefined ? `${weatherData.temp}°` : '';

  return L.divIcon({
    className: 'custom-weather-marker',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);cursor:pointer;">
        <div style="
          display:flex;align-items:center;gap:4px;
          background:rgba(15,23,42,0.92);
          border:2px solid ${isSelected ? '#38bdf8' : bg};
          box-shadow:0 4px 12px ${isSelected ? 'rgba(56,189,248,0.6)' : 'rgba(0,0,0,0.45)'};
          padding:3px 8px;border-radius:20px;color:#fff;font-weight:700;
          font-size:11px;white-space:nowrap;backdrop-filter:blur(8px);
        ">
          <span style="font-size:13px;">${icon}</span>
          <span>${cityName}</span>
          <span style="color:#94a3b8;font-weight:500;">${temp}</span>
        </div>
        <div style="width:2px;height:6px;background:${bg};"></div>
        <div style="width:5px;height:5px;border-radius:50%;background:${bg};"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -32]
  });
}

export default function WeatherMap({ day = 'today', onDayChange, onSelectCity }) {
  const [citiesData, setCitiesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('All');
  const [activeCity, setActiveCity] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null); // { center, zoom } | null
  const [resetTrigger, setResetTrigger] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchCitiesOverview();
        setCitiesData(data.cities || []);
      } catch (err) {
        console.error('Failed to load cities overview:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredCities = citiesData.filter((c) => {
    const matchesSearch = c.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesZone = selectedZone === 'All' || c.zone === selectedZone;
    return matchesSearch && matchesZone;
  });

  const handleCityFocus = (cityObj) => {
    setActiveCity(cityObj);
    setFlyTarget({ center: [cityObj.latitude, cityObj.longitude], zoom: 11 });
  };

  const handleReset = () => {
    setActiveCity(null);
    setFlyTarget(null);
    setResetTrigger((n) => n + 1); // re-runs FitToSriLanka
  };

  return (
    <div className="space-y-5 animate-fadeIn">

      <div className="glass-dark rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-cyan-300 mb-1">
            <Compass className="w-4 h-4" />
            <span>Sri Lanka · 30 Meteorological Stations</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Island Weather & Rain Forecast Map
          </h2>
          <p className="text-xs text-white/70 mt-0.5">
            Showing ML-predicted weather and rain probability for {day === 'today' ? 'Today' : 'Tomorrow'}.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <span className="text-xs text-white/80 font-medium hidden sm:inline">Forecast Day:</span>
          {onDayChange && <DayToggle value={day} onChange={onDayChange} />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        <div className="lg:col-span-8 glass-dark rounded-2xl p-2.5 h-140 relative overflow-hidden">
          {loading ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/80 text-sm gap-2">
              <CloudRain className="w-8 h-8 animate-bounce text-cyan-300" />
              <span>Loading 30 Stations ML Forecast...</span>
            </div>
          ) : (
            <MapContainer
              minZoom={MIN_ZOOM}
              maxZoom={MAX_ZOOM}
              maxBounds={PAN_LIMIT_BOUNDS}
              maxBoundsViscosity={1.0}
              worldCopyJump={false}
              scrollWheelZoom={true}
              className="w-full h-full rounded-3xl z-0"
              style={{ minHeight: '520px', background: '#0b1329' }}
            >
              <FitToSriLanka trigger={resetTrigger} />
              {flyTarget && <FlyToCity center={flyTarget.center} zoom={flyTarget.zoom} />}

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                className="dark-map-tiles"
              />

              {filteredCities.map((station) => {
                const weather = day === 'today' ? station.today : station.tomorrow;
                const isSelected = activeCity?.city === station.city;

                return (
                  <Marker
                    key={station.city}
                    position={[station.latitude, station.longitude]}
                    icon={createWeatherPin(station.city, weather, isSelected)}
                    eventHandlers={{ click: () => setActiveCity(station) }}
                  >
                    <Popup className="custom-weather-popup">
                      <div className="p-3 min-w-52.5 text-slate-900">
                        <div className="flex items-center justify-between border-b pb-1.5 mb-2">
                          <h4 className="font-bold text-sm text-slate-900">{station.city}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                            {station.zone}
                          </span>
                        </div>

                        <div className="text-xs space-y-1.5 text-slate-600">
                          <div className="flex justify-between">
                            <span>Expected Status:</span>
                            <strong className="text-slate-900 capitalize flex items-center gap-1">
                              {getConditionVisual(weather?.condition).icon} {weather?.condition || 'Clear'}
                            </strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Predicted Rain:</span>
                            <strong className="text-blue-600 font-bold">{weather?.rain_mm ?? 0} mm</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Rain Probability:</span>
                            <strong className="text-sky-600">{weather?.probability ?? 0}%</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Temperature:</span>
                            <strong>{weather?.temp ?? station.avg_temp}°C</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Station Altitude:</span>
                            <span>{station.elevation} m</span>
                          </div>
                        </div>

                        {onSelectCity && (
                          <button
                            onClick={() => onSelectCity(station.city)}
                            className="mt-3 w-full py-1.5 px-3 bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>View Full Forecast</span>
                          </button>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}

          <button
            onClick={handleReset}
            className="absolute bottom-6 right-6 z-400 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-medium border border-white/20 shadow-lg backdrop-blur-md flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reset View</span>
          </button>
        </div>

        <div className="lg:col-span-4 glass-dark rounded-2xl p-4 h-140 flex flex-col">

          <div className="relative mb-3">
            <Search className="w-4 h-4 text-white/50 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search station..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/25 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/50 outline-none focus:border-cyan-400 transition"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {['All', 'Wet Zone', 'Dry Zone', 'Intermediate Zone'].map((z) => (
              <button
                key={z}
                onClick={() => setSelectedZone(z)}
                className={`text-[10px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedZone === z
                    ? 'bg-cyan-500 text-white shadow'
                    : 'bg-black/25 text-white/70 hover:text-white'
                }`}
              >
                {z}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-2 no-scrollbar">
            {filteredCities.map((st) => {
              const weather = day === 'today' ? st.today : st.tomorrow;
              const isSelected = activeCity?.city === st.city;
              const visual = getConditionVisual(weather?.condition);

              return (
                <div
                  key={st.city}
                  onClick={() => handleCityFocus(st)}
                  className={`p-2.5 rounded-xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-white/15 border-cyan-400 shadow-md'
                      : 'bg-white/4 border-transparent hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white text-xs font-bold flex items-center gap-1.5">
                      <span>{visual.icon}</span>
                      <span>{st.city}</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-semibold text-cyan-200 bg-white/10">
                      {weather?.temp ?? st.avg_temp}°C
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-white/70 mt-1.5">
                    <span className="flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-cyan-400" />
                      <span>{weather?.rain_mm ?? 0} mm</span>
                    </span>
                    <span className="text-xs text-cyan-300 font-medium">
                      {weather?.probability ?? 0}% rain
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredCities.length === 0 && (
              <div className="text-center py-10 text-xs text-white/50">
                No matching stations found.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}