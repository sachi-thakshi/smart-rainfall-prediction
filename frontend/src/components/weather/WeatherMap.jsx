import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { CloudRain, Compass, Droplets, Gauge, MapPin, Mountain, RotateCcw, Search, Sparkles, X } from "lucide-react";

import DayToggle from "./DayToggle.jsx";
import AnimatedContent from "../reactbits/AnimatedContent.jsx";
import { fetchCitiesOverview } from "../../services/api";

const SRI_LANKA_BOUNDS = [
  [5.6, 79.3],
  [9.9, 82.0],
];

const PAN_LIMIT_BOUNDS = [
  [4.8, 78.5],
  [10.4, 82.6],
];

const MIN_ZOOM = 7;
const MAX_ZOOM = 13;

const ZONES = ["All", "Wet Zone", "Dry Zone", "Intermediate Zone"];

const CONDITION_META = {
  severe: {
    icon: "⛈️",
    label: "Severe Rain",
    color: "#ef4444",
    glow: "rgba(239,68,68,0.32)",
  },
  rainy: {
    icon: "🌧️",
    label: "Rain",
    color: "#0ea5e9",
    glow: "rgba(14,165,233,0.32)",
  },
  hot: {
    icon: "☀️",
    label: "Hot / Sunny",
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.3)",
  },
  clear: {
    icon: "🌤️",
    label: "Clear",
    color: "#10b981",
    glow: "rgba(16,185,129,0.28)",
  },
};

function getConditionVisual(condition = "clear") {
  return CONDITION_META[String(condition).toLowerCase()] || CONDITION_META.clear;
}

function FitToSriLanka({ trigger }) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(SRI_LANKA_BOUNDS, {
      padding: [18, 18],
      animate: true,
    });
  }, [map, trigger]);

  useEffect(() => {
    function handleResize() {
      map.invalidateSize();
    }

    window.addEventListener("resize", handleResize);

    const timeout = window.setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.clearTimeout(timeout);
    };
  }, [map]);

  return null;
}

function FlyToCity({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (!center) return;

    map.flyTo(center, zoom, {
      duration: 1.1,
      easeLinearity: 0.2,
    });
  }, [center, zoom, map]);

  return null;
}

function createWeatherPin(cityName, weatherData, isSelected = false) {
  const visual = getConditionVisual(weatherData?.condition);
  const temperature = weatherData?.temp !== undefined && weatherData?.temp !== null ? `${Math.round(weatherData.temp)}°` : "--°";

  return L.divIcon({
    className: "smart-weather-marker",
    html: `
      <div class="smart-weather-pin ${isSelected ? "smart-weather-pin-selected" : ""}" style="--marker-color:${visual.color};--marker-glow:${visual.glow};">
        <div class="smart-weather-pin-pulse"></div>

        <div class="smart-weather-pin-card">
          <span class="smart-weather-pin-icon">${visual.icon}</span>

          <div class="smart-weather-pin-content">
            <span class="smart-weather-pin-city">${cityName}</span>
            <span class="smart-weather-pin-temp">${temperature}</span>
          </div>
        </div>

        <div class="smart-weather-pin-line"></div>
        <div class="smart-weather-pin-dot"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -50],
  });
}

function StatItem({ icon, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#0a2230] px-3 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-300/[0.06] bg-cyan-300/[0.05] text-cyan-300">{icon}</div>

      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/30">{label}</p>
        <p className="mt-0.5 truncate text-xs font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function ConditionLegend() {
  return (
    <div className="pointer-events-none absolute bottom-5 left-5 z-[500] hidden rounded-2xl border border-cyan-300/[0.08] bg-[#041522]/90 px-3 py-2.5 shadow-xl backdrop-blur-xl md:block">
      <div className="flex flex-wrap items-center gap-3">
        {Object.entries(CONDITION_META).map(([key, item]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.glow}` }} />
            <span className="text-[9px] font-semibold text-white/55">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SelectedStationPanel({ station, weather, onClose, onSelectCity }) {
  if (!station) return null;

  const visual = getConditionVisual(weather?.condition);

  return (
    <AnimatedContent distance={25} direction="vertical" duration={0.65} ease="power3.out" initialOpacity={0}>
      <div className="relative mb-4 overflow-hidden rounded-[26px] border border-cyan-300/[0.12] bg-gradient-to-br from-[#0b2635] via-[#081d29] to-[#061723] p-4 shadow-[0_20px_55px_rgba(0,0,0,0.2)]">
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-400/[0.07] blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.04] text-2xl shadow-lg">{visual.icon}</div>

              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-cyan-300/70">Selected station</p>
                <h3 className="mt-1 truncate text-lg font-bold tracking-[-0.03em] text-white">{station.city}</h3>
                <p className="mt-0.5 text-[10px] font-medium text-white/35">{station.zone}</p>
              </div>
            </div>

            <button type="button" onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.035] text-white/35 transition hover:bg-white/[0.08] hover:text-white" aria-label="Close selected station">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <StatItem icon={<Droplets className="h-4 w-4" />} label="Rainfall" value={`${Number(weather?.rain_mm ?? 0).toFixed(1)} mm`} />
            <StatItem icon={<CloudRain className="h-4 w-4" />} label="Probability" value={`${Math.round(Number(weather?.probability ?? 0))}%`} />
            <StatItem icon={<Gauge className="h-4 w-4" />} label="Temperature" value={`${Math.round(Number(weather?.temp ?? station.avg_temp ?? 0))}°C`} />
            <StatItem icon={<Mountain className="h-4 w-4" />} label="Elevation" value={`${station.elevation ?? 0} m`} />
          </div>

          {onSelectCity && (
            <button type="button" onClick={() => onSelectCity(station.city)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 text-xs font-bold text-[#04131d] shadow-[0_12px_30px_rgba(14,165,233,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-cyan-400">
              <Sparkles className="h-3.5 w-3.5" />
              View Full Forecast
            </button>
          )}
        </div>
      </div>
    </AnimatedContent>
  );
}

export default function WeatherMap({ day = "today", onDayChange, onSelectCity, large = false }) {
  const [citiesData, setCitiesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState("All");
  const [activeCity, setActiveCity] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const data = await fetchCitiesOverview();

        if (!cancelled) {
          setCitiesData(data.cities || []);
        }
      } catch (err) {
        console.error("Failed to load cities overview:", err);

        if (!cancelled) {
          setCitiesData([]);
          setError("Unable to load weather stations.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return citiesData.filter((city) => {
      const matchesSearch = !query || city.city.toLowerCase().includes(query);
      const matchesZone = selectedZone === "All" || city.zone === selectedZone;

      return matchesSearch && matchesZone;
    });
  }, [citiesData, searchQuery, selectedZone]);

  const selectedWeather = useMemo(() => {
    if (!activeCity) return null;

    return day === "today" ? activeCity.today : activeCity.tomorrow;
  }, [activeCity, day]);

  const conditionCounts = useMemo(() => {
    return filteredCities.reduce(
      (result, station) => {
        const weather = day === "today" ? station.today : station.tomorrow;
        const condition = String(weather?.condition || "clear").toLowerCase();

        if (condition.includes("severe")) {
          result.severe += 1;
        } else if (condition.includes("rain")) {
          result.rainy += 1;
        } else if (condition.includes("hot")) {
          result.hot += 1;
        } else {
          result.clear += 1;
        }

        return result;
      },
      {
        severe: 0,
        rainy: 0,
        hot: 0,
        clear: 0,
      }
    );
  }, [filteredCities, day]);

  function handleCityFocus(cityObj) {
    setActiveCity(cityObj);

    setFlyTarget({
      center: [cityObj.latitude, cityObj.longitude],
      zoom: 11,
    });
  }

  function handleMarkerClick(cityObj) {
    handleCityFocus(cityObj);
  }

  function handleReset() {
    setActiveCity(null);
    setFlyTarget(null);
    setSearchQuery("");
    setSelectedZone("All");
    setResetTrigger((value) => value + 1);
  }

  const mapHeight = large ? "h-[720px] lg:h-[820px] 2xl:h-[880px]" : "h-[600px] lg:h-[680px]";

  return (
    <div className="relative w-full">
      <AnimatedContent distance={30} direction="vertical" duration={0.7} ease="power3.out" initialOpacity={0}>
        <div className="mb-5 flex flex-col gap-4 rounded-[28px] border border-cyan-300/[0.07] bg-[#081a25]/90 p-4 shadow-[0_20px_55px_rgba(0,0,0,0.16)] backdrop-blur-xl md:flex-row md:items-center md:justify-between md:p-5">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
              </span>

              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">Island Weather Network</span>
            </div>

            <h3 className="text-xl font-bold tracking-[-0.035em] text-white sm:text-2xl">Sri Lanka Forecast Radar</h3>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-medium text-white/35">
              <span className="flex items-center gap-1.5"><Compass className="h-3 w-3" /> {citiesData.length} stations</span>
              <span>{day === "today" ? "Today's forecast" : "Tomorrow's forecast"}</span>
              <span>{filteredCities.length} visible</span>
            </div>
          </div>

          {onDayChange && (
            <div className="shrink-0">
              <DayToggle value={day} onChange={onDayChange} />
            </div>
          )}
        </div>
      </AnimatedContent>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <AnimatedContent distance={45} direction="horizontal" reverse duration={0.85} ease="power3.out" initialOpacity={0} className="min-w-0">
          <div className={`relative overflow-hidden rounded-[32px] border border-cyan-300/[0.08] bg-[#041827] shadow-[0_35px_90px_rgba(0,0,0,0.32)] ${mapHeight}`}>
            {loading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#041827]">
                <div className="flex flex-col items-center text-center">
                  <div className="relative flex h-20 w-20 items-center justify-center">
                    <div className="absolute inset-0 animate-ping rounded-full border border-cyan-400/20" />
                    <div className="absolute inset-3 animate-pulse rounded-full bg-cyan-400/10 blur-xl" />
                    <CloudRain className="relative h-8 w-8 animate-bounce text-cyan-300" />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-white">Scanning weather stations</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/30">Loading ML predictions</p>
                </div>
              </div>
            )}

            {!loading && error && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#041827] px-5">
                <div className="max-w-sm text-center">
                  <CloudRain className="mx-auto h-9 w-9 text-red-400" />
                  <p className="mt-4 text-sm font-bold text-white">Weather radar unavailable</p>
                  <p className="mt-2 text-xs text-white/40">{error}</p>
                </div>
              </div>
            )}

            {!loading && !error && (
              <MapContainer minZoom={MIN_ZOOM} maxZoom={MAX_ZOOM} maxBounds={PAN_LIMIT_BOUNDS} maxBoundsViscosity={1} worldCopyJump={false} scrollWheelZoom className="h-full w-full z-0" style={{ background: "#041827" }}>
                <FitToSriLanka trigger={resetTrigger} />

                {flyTarget && <FlyToCity center={flyTarget.center} zoom={flyTarget.zoom} />}

                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" className="smart-midnight-map-tiles" />

                {filteredCities.map((station) => {
                  const weather = day === "today" ? station.today : station.tomorrow;
                  const isSelected = activeCity?.city === station.city;
                  const visual = getConditionVisual(weather?.condition);

                  return (
                    <Marker key={`${station.city}-${day}-${isSelected}`} position={[station.latitude, station.longitude]} icon={createWeatherPin(station.city, weather, isSelected)} eventHandlers={{ click: () => handleMarkerClick(station) }}>
                      <Popup className="smart-weather-popup">
                        <div className="min-w-[230px] p-1">
                          <div className="mb-3 flex items-start justify-between gap-3 border-b border-white/[0.07] pb-3">
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">{station.zone}</p>
                              <h4 className="mt-1 text-base font-bold tracking-tight text-white">{station.city}</h4>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.05] text-xl">{visual.icon}</div>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-white/40">Condition</span>
                              <span className="font-bold text-white">{visual.label}</span>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                              <span className="text-white/40">Rainfall</span>
                              <span className="font-bold text-cyan-300">{Number(weather?.rain_mm ?? 0).toFixed(1)} mm</span>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                              <span className="text-white/40">Rain chance</span>
                              <span className="font-bold text-sky-300">{Math.round(Number(weather?.probability ?? 0))}%</span>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                              <span className="text-white/40">Temperature</span>
                              <span className="font-bold text-white">{Math.round(Number(weather?.temp ?? station.avg_temp ?? 0))}°C</span>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                              <span className="text-white/40">Elevation</span>
                              <span className="font-semibold text-white/70">{station.elevation ?? 0} m</span>
                            </div>
                          </div>

                          {onSelectCity && (
                            <button type="button" onClick={() => onSelectCity(station.city)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-3 py-2.5 text-xs font-bold text-[#03131d] transition hover:bg-cyan-400">
                              <Sparkles className="h-3.5 w-3.5" />
                              Open Full Forecast
                            </button>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            )}

            {!loading && !error && (
              <>
                <div className="pointer-events-none absolute left-5 top-5 z-[500] hidden items-center gap-2 rounded-2xl border border-cyan-300/[0.08] bg-[#041522]/90 px-3 py-2.5 shadow-lg backdrop-blur-xl sm:flex">
                  <MapPin className="h-3.5 w-3.5 text-cyan-300" />
                  <span className="text-[10px] font-semibold text-white/60">Sri Lanka</span>
                  <span className="h-3 w-px bg-white/10" />
                  <span className="text-[10px] font-bold text-white">{filteredCities.length} stations</span>
                </div>

                <ConditionLegend />

                <button type="button" onClick={handleReset} className="absolute bottom-5 right-5 z-[500] flex items-center gap-2 rounded-2xl border border-cyan-300/[0.08] bg-[#041522]/90 px-3.5 py-2.5 text-[10px] font-bold text-white/60 shadow-xl backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-[#082535] hover:text-white">
                  <RotateCcw className="h-3.5 w-3.5 text-cyan-300" />
                  Reset Map
                </button>
              </>
            )}
          </div>
        </AnimatedContent>

        <AnimatedContent distance={45} direction="horizontal" duration={0.85} delay={0.1} ease="power3.out" initialOpacity={0} className="min-w-0">
          <div className={`flex flex-col overflow-hidden rounded-[32px] border border-cyan-300/[0.07] bg-[#071a25]/95 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.2)] backdrop-blur-xl ${mapHeight}`}>
            <SelectedStationPanel station={activeCity} weather={selectedWeather} onClose={() => setActiveCity(null)} onSelectCity={onSelectCity} />

            <div className="relative mb-3 shrink-0">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

              <input type="text" placeholder="Search weather station..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="w-full rounded-2xl border border-cyan-300/[0.07] bg-[#041522]/70 py-3 pl-10 pr-10 text-xs font-medium text-white outline-none transition placeholder:text-white/25 focus:border-cyan-400/40 focus:bg-[#051b29] focus:ring-4 focus:ring-cyan-400/[0.04]" />

              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-white/30 transition hover:bg-white/[0.06] hover:text-white" aria-label="Clear search">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="no-scrollbar mb-4 flex shrink-0 gap-1.5 overflow-x-auto">
              {ZONES.map((zone) => {
                const active = selectedZone === zone;

                return (
                  <button key={zone} type="button" onClick={() => setSelectedZone(zone)} className={`shrink-0 rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.1em] transition-all duration-300 ${active ? "border-cyan-300/20 bg-cyan-400/[0.1] text-cyan-200" : "border-white/[0.05] bg-[#091f2b] text-white/35 hover:border-cyan-300/[0.1] hover:bg-[#0b2634] hover:text-white/70"}`}>
                    {zone}
                  </button>
                );
              })}
            </div>

            <div className="mb-4 grid shrink-0 grid-cols-4 gap-1.5">
              {[
                ["Rain", conditionCounts.rainy, "#0ea5e9"],
                ["Severe", conditionCounts.severe, "#ef4444"],
                ["Hot", conditionCounts.hot, "#f59e0b"],
                ["Clear", conditionCounts.clear, "#10b981"],
              ].map(([label, count, color]) => (
                <div key={label} className="rounded-xl border border-white/[0.05] bg-[#091f2b] px-2 py-2 text-center">
                  <p className="text-sm font-black text-white">{count}</p>

                  <div className="mt-1 flex items-center justify-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-white/30">{label}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-2 flex shrink-0 items-center justify-between px-1">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/30">Weather Stations</p>
                <p className="mt-1 text-[9px] text-white/20">Select a station to inspect local conditions</p>
              </div>

              <span className="rounded-full border border-white/[0.05] bg-[#091f2b] px-2.5 py-1 text-[9px] font-bold text-white/35">{filteredCities.length}</span>
            </div>

            <div className="no-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {filteredCities.map((station, index) => {
                const weather = day === "today" ? station.today : station.tomorrow;
                const visual = getConditionVisual(weather?.condition);
                const isSelected = activeCity?.city === station.city;
                const rainProbability = Math.max(0, Math.min(Number(weather?.probability ?? 0), 100));

                return (
                  <button key={station.city} type="button" onClick={() => handleCityFocus(station)} className={`group relative w-full overflow-hidden rounded-2xl border p-3 text-left transition-all duration-300 ${isSelected ? "border-cyan-300/20 bg-[#0b2a38] shadow-[0_12px_35px_rgba(8,145,178,0.06)]" : "border-white/[0.04] bg-[#091f2b] hover:border-cyan-300/[0.08] hover:bg-[#0b2634]"}`}>
                    {isSelected && <div className="absolute inset-y-3 left-0 w-[2px] rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.5)]" />}

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.05] bg-[#0b2634]">
                          <span className="text-xl transition-transform duration-300 group-hover:scale-110">{visual.icon}</span>

                          {isSelected && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[#071a25] bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.65)]" />}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-xs font-bold text-white">{station.city}</p>
                            <span className="text-[8px] font-bold text-white/20">{String(index + 1).padStart(2, "0")}</span>
                          </div>

                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: visual.color, boxShadow: `0 0 7px ${visual.glow}` }} />
                            <p className="truncate text-[9px] font-medium text-white/30">{visual.label} · {station.zone}</p>
                          </div>
                        </div>
                      </div>

                      <span className="shrink-0 text-lg font-black tracking-[-0.05em] text-white">{Math.round(Number(weather?.temp ?? station.avg_temp ?? 0))}°</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-medium text-white/40">
                        <Droplets className="h-3 w-3 text-cyan-300" />
                        {Number(weather?.rain_mm ?? 0).toFixed(1)} mm
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-200/75">
                        <CloudRain className="h-3 w-3" />
                        {Math.round(rainProbability)}%
                      </div>
                    </div>

                    <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/[0.04]">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-400 transition-all duration-700" style={{ width: `${rainProbability}%` }} />
                    </div>
                  </button>
                );
              })}

              {!loading && filteredCities.length === 0 && (
                <div className="flex min-h-[220px] items-center justify-center px-5 text-center">
                  <div>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.05] bg-[#091f2b]">
                      <Search className="h-5 w-5 text-white/20" />
                    </div>

                    <p className="mt-4 text-xs font-bold text-white/60">No matching stations</p>
                    <p className="mt-1 text-[10px] leading-5 text-white/25">Try another station name or weather zone.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </AnimatedContent>
      </div>

      <style>{`
        .leaflet-container {
          font-family: inherit;
          background: #041827 !important;
        }

        .leaflet-map-pane {
          background: #041827 !important;
        }

        .leaflet-tile-pane {
          background: linear-gradient(135deg, #061d30 0%, #041827 48%, #03131f 100%) !important;
          isolation: isolate;
        }

        .smart-midnight-map-tiles {
          filter: brightness(0.54) contrast(1.18) saturate(0.28);
          opacity: 0.84 !important;
          mix-blend-mode: luminosity;
        }

        .leaflet-tile {
          transition: opacity 300ms ease, filter 300ms ease;
        }

        .leaflet-control-container {
          font-family: inherit;
        }

        .leaflet-control-zoom {
          overflow: hidden;
          border: 1px solid rgba(103,232,249,0.08) !important;
          border-radius: 16px !important;
          box-shadow: 0 18px 45px rgba(0,0,0,0.32) !important;
          backdrop-filter: blur(18px);
        }

        .leaflet-control-zoom a {
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          border-color: rgba(255,255,255,0.04) !important;
          background: rgba(4,21,34,0.95) !important;
          color: rgba(255,255,255,0.62) !important;
          font-size: 17px !important;
          transition: all 220ms ease !important;
        }

        .leaflet-control-zoom a:hover {
          background: #082838 !important;
          color: #67e8f9 !important;
        }

        .leaflet-control-attribution {
          border-top-left-radius: 10px;
          background: rgba(4,21,34,0.82) !important;
          color: rgba(255,255,255,0.22) !important;
          font-size: 8px !important;
          backdrop-filter: blur(12px);
        }

        .leaflet-control-attribution a {
          color: rgba(103,232,249,0.5) !important;
        }

        .smart-weather-marker {
          border: 0 !important;
          background: transparent !important;
        }

        .smart-weather-pin {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          transform: translate(-50%, -100%);
          cursor: pointer;
        }

        .smart-weather-pin-card {
          position: relative;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 6px 9px;
          border: 1px solid rgba(255,255,255,0.07);
          border-bottom: 2px solid var(--marker-color);
          border-radius: 14px;
          background: rgba(4,21,34,0.94);
          color: #ffffff;
          white-space: nowrap;
          box-shadow: 0 12px 30px rgba(0,0,0,0.4), 0 0 12px var(--marker-glow);
          backdrop-filter: blur(18px);
          transition: transform 250ms ease, border-color 250ms ease, box-shadow 250ms ease, background 250ms ease;
        }

        .smart-weather-pin:hover .smart-weather-pin-card {
          transform: translateY(-4px) scale(1.04);
          border-color: var(--marker-color);
          background: rgba(6,31,44,0.98);
          box-shadow: 0 18px 38px rgba(0,0,0,0.45), 0 0 18px var(--marker-glow);
        }

        .smart-weather-pin-selected .smart-weather-pin-card {
          transform: translateY(-5px) scale(1.08);
          border-color: var(--marker-color);
          background: #082636;
          box-shadow: 0 20px 45px rgba(0,0,0,0.48), 0 0 22px var(--marker-glow);
        }

        .smart-weather-pin-icon {
          font-size: 15px;
          line-height: 1;
        }

        .smart-weather-pin-content {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .smart-weather-pin-city {
          color: rgba(255,255,255,0.92);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        .smart-weather-pin-temp {
          color: rgba(255,255,255,0.4);
          font-size: 9px;
          font-weight: 700;
        }

        .smart-weather-pin-line {
          position: relative;
          z-index: 2;
          width: 1px;
          height: 8px;
          background: linear-gradient(to bottom, var(--marker-color), transparent);
        }

        .smart-weather-pin-dot {
          position: relative;
          z-index: 3;
          width: 6px;
          height: 6px;
          border: 1px solid rgba(255,255,255,0.55);
          border-radius: 999px;
          background: var(--marker-color);
          box-shadow: 0 0 10px var(--marker-glow);
        }

        .smart-weather-pin-pulse {
          position: absolute;
          z-index: 1;
          bottom: -3px;
          width: 22px;
          height: 22px;
          border: 1px solid var(--marker-color);
          border-radius: 999px;
          opacity: 0;
          animation: smart-weather-radar-pulse 2.4s ease-out infinite;
        }

        .smart-weather-pin-selected .smart-weather-pin-pulse {
          animation-duration: 1.5s;
        }

        @keyframes smart-weather-radar-pulse {
          0% {
            transform: scale(0.2);
            opacity: 0.5;
          }

          100% {
            transform: scale(1.9);
            opacity: 0;
          }
        }

        .smart-weather-popup .leaflet-popup-content-wrapper {
          border: 1px solid rgba(103,232,249,0.1);
          border-radius: 22px;
          background: rgba(5,24,36,0.98);
          color: #ffffff;
          box-shadow: 0 30px 70px rgba(0,0,0,0.5);
          backdrop-filter: blur(24px);
        }

        .smart-weather-popup .leaflet-popup-content {
          margin: 14px;
          color: #ffffff;
        }

        .smart-weather-popup .leaflet-popup-tip {
          background: rgba(5,24,36,0.98);
        }

        .smart-weather-popup .leaflet-popup-close-button {
          top: 7px !important;
          right: 7px !important;
          color: rgba(255,255,255,0.32) !important;
          font-size: 18px !important;
          transition: color 200ms ease !important;
        }

        .smart-weather-popup .leaflet-popup-close-button:hover {
          color: #67e8f9 !important;
        }

        @media (max-width: 1279px) {
          .smart-weather-pin-card {
            padding: 5px 7px;
          }

          .smart-weather-pin-city {
            font-size: 9px;
          }
        }

        @media (max-width: 767px) {
          .leaflet-control-zoom {
            transform: scale(0.9);
            transform-origin: top left;
          }

          .smart-weather-pin-card {
            gap: 5px;
            padding: 5px 6px;
            border-radius: 11px;
          }

          .smart-weather-pin-icon {
            font-size: 13px;
          }

          .smart-weather-pin-city {
            max-width: 65px;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 8px;
          }

          .smart-weather-pin-temp {
            font-size: 8px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .smart-weather-pin-pulse {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}