import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, 
  Search, 
  Filter, 
  Compass, 
  Droplets, 
  Mountain, 
  Sparkles, 
  ArrowRight,
  Sun,
  CloudRain,
  Layers
} from 'lucide-react';
import { weatherApi } from '../api/weatherApi';

// Custom Map Panner helper component
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

// Function to generate stylish Leaflet DivIcons
function createCustomPin(zone, isSelected = false) {
  let color = '#0ea5e9'; // default blue
  if (zone === 'Wet Zone') color = '#0284c7';
  if (zone === 'Dry Zone') color = '#eab308';
  if (zone === 'Intermediate Zone') color = '#10b981';

  const size = isSelected ? 'w-7 h-7' : 'w-5 h-5';

  return L.divIcon({
    className: 'custom-weather-pin',
    html: `
      <div style="
        display: flex; 
        align-items: center; 
        justify-content: center; 
        width: ${isSelected ? '28px' : '20px'}; 
        height: ${isSelected ? '28px' : '20px'}; 
        background: ${color}; 
        border-radius: 50%; 
        border: 2px solid white; 
        box-shadow: 0 0 ${isSelected ? '12px' : '6px'} ${color};
        cursor: pointer;
        transition: transform 0.2s;
      ">
        <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14]
  });
}

export default function WeatherMap({ onSelectCityForPrediction }) {
  const [citiesData, setCitiesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('All');
  const [activeCity, setActiveCity] = useState(null);
  const [mapCenter, setMapCenter] = useState([7.8731, 80.7718]); // Sri Lanka center
  const [mapZoom, setMapZoom] = useState(8);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await weatherApi.getCitiesOverview();
        setCitiesData(res.cities || []);
      } catch (err) {
        console.error('Failed to load cities overview', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredCities = citiesData.filter(c => {
    const matchesSearch = c.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesZone = selectedZone === 'All' || c.zone === selectedZone;
    return matchesSearch && matchesZone;
  });

  const handleCityFocus = (cityObj) => {
    setActiveCity(cityObj);
    setMapCenter([cityObj.latitude, cityObj.longitude]);
    setMapZoom(10);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel rounded-2xl p-6 border border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-cyan-400 mb-1">
            <Compass className="w-4 h-4" />
            <span>Sri Lanka Meteorological Network</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Island Meteorological Stations Map
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Explore all 30 observation weather stations across Sri Lanka's Wet, Dry, and Intermediate agro-climatic zones.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs bg-slate-900/80 p-3 rounded-xl border border-slate-800 self-start sm:self-auto">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-sky-500 shadow-sm shadow-sky-500/50" />
            <span className="text-slate-300">Wet Zone</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
            <span className="text-slate-300">Dry Zone</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span className="text-slate-300">Intermediate</span>
          </div>
        </div>
      </div>

      {/* Map + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Map Container */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-3 border border-slate-800 h-[560px] relative overflow-hidden shadow-2xl">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
              Loading Sri Lanka Geographic Stations...
            </div>
          ) : (
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              scrollWheelZoom={true}
              className="w-full h-full rounded-xl"
              style={{ minHeight: '520px', background: '#0b1329' }}
            >
              <ChangeView center={mapCenter} zoom={mapZoom} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />

              {filteredCities.map((c) => (
                <Marker
                  key={c.city}
                  position={[c.latitude, c.longitude]}
                  icon={createCustomPin(c.zone, activeCity?.city === c.city)}
                  eventHandlers={{
                    click: () => setActiveCity(c)
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="p-2 text-slate-900 min-w-[200px]">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-900">{c.city}</h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {c.zone}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-2 space-y-1">
                        <div>Elevation: <strong>{c.elevation} m</strong></div>
                        <div>Coordinates: {c.latitude.toFixed(2)}° N, {c.longitude.toFixed(2)}° E</div>
                        <div>Avg Daily Rain: <strong>{c.avg_daily_rainfall_mm} mm</strong></div>
                        <div>Rainy Days: <strong>{c.rainy_days_percentage}%</strong></div>
                      </div>
                      <button
                        onClick={() => onSelectCityForPrediction(c.city)}
                        className="mt-3 w-full py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold flex items-center justify-center space-x-1 transition-colors"
                      >
                        <span>Predict Tomorrow's Rain</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}

          {/* Quick Island Center Reset Button */}
          <button
            onClick={() => {
              setActiveCity(null);
              setMapCenter([7.8731, 80.7718]);
              setMapZoom(8);
            }}
            className="absolute bottom-6 right-6 z-[400] px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/80 shadow-lg backdrop-blur-sm"
          >
            Reset Island View
          </button>
        </div>

        {/* Stations Filter & Directory Sidebar */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col h-[560px]">
          
          <div className="space-y-3 pb-3 border-b border-slate-800">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search station or district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
            </div>

            {/* Zone Filter Chips */}
            <div className="flex flex-wrap gap-1.5">
              {['All', 'Wet Zone', 'Dry Zone', 'Intermediate Zone'].map((z) => (
                <button
                  key={z}
                  onClick={() => setSelectedZone(z)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                    selectedZone === z
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {z}
                </button>
              ))}
            </div>
          </div>

          {/* City List Scrollable */}
          <div className="flex-1 overflow-y-auto space-y-2 pt-3 pr-1">
            {filteredCities.map((c) => {
              const isSelected = activeCity?.city === c.city;
              return (
                <div
                  key={c.city}
                  onClick={() => handleCityFocus(c)}
                  className={`p-3 rounded-xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-white">{c.city}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      c.zone === 'Wet Zone' ? 'bg-sky-500/20 text-sky-300' :
                      c.zone === 'Dry Zone' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {c.zone}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 mt-2">
                    <div className="flex items-center space-x-1">
                      <Mountain className="w-3 h-3 text-slate-500" />
                      <span>{c.elevation} m</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Droplets className="w-3 h-3 text-cyan-400" />
                      <span>Avg {c.avg_daily_rainfall_mm} mm/d</span>
                    </div>
                  </div>

                  {isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCityForPrediction(c.city);
                      }}
                      className="mt-2.5 w-full py-1.5 px-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Load in Prediction Dashboard</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
