import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Calendar, 
  Sparkles, 
  CloudRain, 
  Sun, 
  Plus, 
  Trash2, 
  ArrowRight,
  TrendingUp,
  BarChart2,
  AlertCircle,
  RefreshCw,
  Table,
  LayoutGrid,
  Info,
  Droplets,
  Thermometer,
  Wind,
  Compass,
  CheckCircle2,
  X,
  Search,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell,
  Legend
} from 'recharts';
import { weatherApi } from '../api/weatherApi';
import { getRainfallCategory, getProbabilityLevel } from '../utils/helpers';

// Agro-climatic zones dictionary for Sri Lankan cities
const CITY_ZONES = {
  Colombo: 'Wet Zone', Galle: 'Wet Zone', Matara: 'Wet Zone', Kalutara: 'Wet Zone',
  Ratnapura: 'Wet Zone', Kandy: 'Wet Zone', Hatton: 'Wet Zone', Gampaha: 'Wet Zone',
  Maharagama: 'Wet Zone', Moratuwa: 'Wet Zone', 'Mount Lavinia': 'Wet Zone', Kesbewa: 'Wet Zone',
  Kolonnawa: 'Wet Zone', 'Sri Jayewardenepura Kotte': 'Wet Zone', Weligama: 'Wet Zone',
  Athurugiriya: 'Wet Zone', Mabole: 'Wet Zone', Oruwala: 'Wet Zone', Bentota: 'Wet Zone',
  Jaffna: 'Dry Zone', Mannar: 'Dry Zone', Trincomalee: 'Dry Zone', Kalmunai: 'Dry Zone',
  Hambantota: 'Dry Zone', Puttalam: 'Dry Zone',
  Kurunegala: 'Intermediate Zone', Badulla: 'Intermediate Zone', Matale: 'Intermediate Zone',
  Negombo: 'Intermediate Zone', Pothuhera: 'Intermediate Zone'
};

export default function CityComparison({ cities = [], datasetInfo, onSelectCityForPrediction }) {
  const [selectedCities, setSelectedCities] = useState(['Colombo', 'Kandy', 'Galle', 'Jaffna']);
  const [selectedDate, setSelectedDate] = useState('2023-05-10');
  const [comparisonResults, setComparisonResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [activeChartMetric, setActiveChartMetric] = useState('probability'); // 'probability' | 'rainfall' | 'temperature' | 'wind'
  const [stationSearch, setStationSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Available cities from props with fallback
  const allCities = cities.length > 0 ? cities : [
    'Athurugiriya', 'Badulla', 'Bentota', 'Colombo', 'Galle', 'Gampaha',
    'Hambantota', 'Hatton', 'Jaffna', 'Kalmunai', 'Kalutara', 'Kandy',
    'Kesbewa', 'Kolonnawa', 'Kurunegala', 'Mabole', 'Maharagama', 'Mannar',
    'Matale', 'Matara', 'Moratuwa', 'Mount Lavinia', 'Negombo', 'Oruwala',
    'Pothuhera', 'Puttalam', 'Ratnapura', 'Sri Jayewardenepura Kotte',
    'Trincomalee', 'Weligama'
  ];

  // Benchmark Date Presets
  const datePresets = [
    { label: 'Monsoon Peak', date: '2023-05-10', tag: 'High Rain' },
    { label: 'SW Storm Surge', date: '2023-05-18', tag: 'Coastal' },
    { label: 'Northeast Monsoon', date: '2022-12-15', tag: 'East/North' },
    { label: 'Dry Spell', date: '2023-02-15', tag: 'Low Rain' },
    { label: 'Latest Record', date: '2023-06-15', tag: 'Recent' },
  ];

  // Regional Cluster Presets
  const regionalPresets = [
    { name: 'Major Metros', stations: ['Colombo', 'Kandy', 'Galle', 'Jaffna'] },
    { name: 'Coastal Belt', stations: ['Colombo', 'Galle', 'Trincomalee', 'Hambantota'] },
    { name: 'Central Highlands', stations: ['Kandy', 'Hatton', 'Badulla', 'Matale'] },
    { name: 'Dry Zone Network', stations: ['Jaffna', 'Mannar', 'Trincomalee', 'Puttalam'] },
    { name: 'Wet Zone Basins', stations: ['Colombo', 'Ratnapura', 'Kalutara', 'Gampaha'] },
  ];

  // Run batch prediction
  const runComparison = async (citiesToCompare = selectedCities, dateToCompare = selectedDate) => {
    if (!citiesToCompare || citiesToCompare.length === 0) {
      setComparisonResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await weatherApi.predictBatch(citiesToCompare, dateToCompare);
      setComparisonResults(res.predictions || []);
    } catch (err) {
      setError(err.message || 'Comparison failed. Please verify backend connectivity and dates.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    runComparison(['Colombo', 'Kandy', 'Galle', 'Jaffna'], '2023-05-10');
  }, []);

  const addCity = (cityName) => {
    if (!cityName || selectedCities.includes(cityName)) return;
    if (selectedCities.length >= 8) {
      setError('You can compare up to 8 stations simultaneously.');
      return;
    }
    const updated = [...selectedCities, cityName];
    setSelectedCities(updated);
    runComparison(updated, selectedDate);
    setShowAddModal(false);
  };

  const removeCity = (cityName) => {
    if (selectedCities.length <= 1) {
      setError('Please keep at least 1 station selected for comparison.');
      return;
    }
    const updated = selectedCities.filter(c => c !== cityName);
    setSelectedCities(updated);
    runComparison(updated, selectedDate);
  };

  const setRegionalGroup = (stations) => {
    setSelectedCities(stations);
    runComparison(stations, selectedDate);
  };

  // Valid results filter
  const validResults = comparisonResults.filter(r => !r.error);

  // Compute insights
  const highestRainStation = validResults.length > 0 
    ? validResults.reduce((max, curr) => (curr.rainfall_mm > (max?.rainfall_mm || 0) ? curr : max), validResults[0])
    : null;

  const lowestRainStation = validResults.length > 0 
    ? validResults.reduce((min, curr) => (curr.rainfall_mm < (min?.rainfall_mm ?? Infinity) ? curr : min), validResults[0])
    : null;

  const rainExpectedCount = validResults.filter(r => r.rain_tomorrow === 'YES').length;
  const avgExpectedRain = validResults.length > 0 
    ? (validResults.reduce((acc, curr) => acc + (curr.rainfall_mm || 0), 0) / validResults.length).toFixed(1)
    : 0;

  // Chart data formatting
  const chartData = validResults.map(r => ({
    city: r.city,
    probability: r.probability,
    rainfall_mm: r.rainfall_mm,
    rain_tomorrow: r.rain_tomorrow,
    temp_mean: r.weather_summary?.temperature_2m_mean || 0,
    temp_max: r.weather_summary?.temperature_2m_max || 0,
    windspeed: r.weather_summary?.windspeed_10m_max || 0,
    rolling_rain: r.weather_summary?.rolling_rainfall || 0
  }));

  // Available cities to add
  const availableToAdd = allCities.filter(c => 
    !selectedCities.includes(c) && 
    c.toLowerCase().includes(stationSearch.toLowerCase())
  );

  // Check if date is out of dataset range
  const isDateOutOfRange = selectedDate > '2023-06-16' || selectedDate < '2010-01-01';

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Hero Header */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold mb-3">
              <Layers className="w-3.5 h-3.5" />
              <span>Cross-Station Comparative Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Multi-City Rainfall & Weather Comparison
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Compare rainfall probability, anticipated precipitation in millimeters, and atmospheric predictors side-by-side across Sri Lanka's 30 meteorological stations for any historical date.
            </p>
          </div>

          {/* Date Picker & Action Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Observation Date
              </label>
              <input
                type="date"
                value={selectedDate}
                min="2010-01-01"
                max="2023-06-16"
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  runComparison(selectedCities, e.target.value);
                }}
                className="w-full sm:w-auto bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-white text-xs font-medium outline-none focus:ring-1 focus:ring-cyan-500 [color-scheme:dark]"
              />
            </div>

            <button
              onClick={() => runComparison()}
              disabled={loading}
              className="mt-auto py-2.5 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98] text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Evaluating...' : 'Run Comparison'}</span>
            </button>
          </div>
        </div>

        {/* Date Presets */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Benchmark Dates:</span>
          </span>
          {datePresets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedDate(p.date);
                runComparison(selectedCities, p.date);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all flex items-center space-x-1.5 ${
                selectedDate === p.date
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                  : 'bg-slate-900/70 text-slate-300 hover:text-white border-slate-800'
              }`}
            >
              <span>{p.label}</span>
              <span className="text-[10px] opacity-60 font-mono">({p.date})</span>
            </button>
          ))}
        </div>

        {/* Out-of-Range Date Warning Banner */}
        {isDateOutOfRange && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Selected date is outside the dataset coverage range (<strong>2010-01-01</strong> to <strong>2023-06-16</strong>).
              </span>
            </div>
            <button
              onClick={() => {
                setSelectedDate('2023-05-10');
                runComparison(selectedCities, '2023-05-10');
              }}
              className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 self-start sm:self-auto transition-colors"
            >
              Reset to Valid Monsoon Peak (2023-05-10)
            </button>
          </div>
        )}

      </div>

      {/* Station Selector & Regional Groups Bar */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Compared Stations ({selectedCities.length}/8):
            </span>
          </div>

          {/* Regional Group Shortcuts */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 mr-1 hidden md:inline">Quick Clusters:</span>
            {regionalPresets.map((group, i) => (
              <button
                key={i}
                onClick={() => setRegionalGroup(group.stations)}
                className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-300 hover:text-white transition-all"
              >
                {group.name}
              </button>
            ))}
          </div>

        </div>

        {/* Selected City Tags & Add Button */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {selectedCities.map(city => {
            const zone = CITY_ZONES[city] || 'Wet Zone';
            return (
              <div
                key={city}
                className="inline-flex items-center space-x-2 pl-3 pr-1.5 py-1 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-medium text-white shadow-sm"
              >
                <span>{city}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                  zone === 'Wet Zone' ? 'bg-sky-500/20 text-sky-300' :
                  zone === 'Dry Zone' ? 'bg-amber-500/20 text-amber-300' :
                  'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {zone.replace(' Zone', '')}
                </span>
                {selectedCities.length > 1 && (
                  <button
                    onClick={() => removeCity(city)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title={`Remove ${city}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Add Station Trigger */}
          {selectedCities.length < 8 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-dashed border-cyan-500/40 text-xs font-semibold text-cyan-300 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Station</span>
            </button>
          )}
        </div>

        {/* Add Station Modal / Dropdown */}
        {showAddModal && (
          <div className="mt-3 p-4 rounded-xl bg-slate-900/95 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Select Station to Add</span>
              </span>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by city name..."
                value={stationSearch}
                onChange={(e) => setStationSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto pt-1">
              {availableToAdd.map(city => (
                <button
                  key={city}
                  onClick={() => addCity(city)}
                  className="p-2 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-left border border-slate-800 hover:border-cyan-500/40 transition-all text-xs text-slate-200"
                >
                  <div className="font-semibold text-white truncate">{city}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{CITY_ZONES[city] || 'Wet Zone'}</div>
                </button>
              ))}
              {availableToAdd.length === 0 && (
                <div className="col-span-full py-4 text-center text-xs text-slate-500">
                  No matching unselected stations found.
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Key Comparative Insights Banner */}
      {validResults.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Highest Rain Risk</span>
              <CloudRain className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white truncate">
                {highestRainStation?.city}
              </div>
              <div className="text-xs text-blue-400 font-semibold mt-0.5">
                {highestRainStation?.probability}% chance • {highestRainStation?.rainfall_mm} mm
              </div>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Clearest / Lowest Risk</span>
              <Sun className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white truncate">
                {lowestRainStation?.city}
              </div>
              <div className="text-xs text-amber-400 font-semibold mt-0.5">
                {lowestRainStation?.probability}% chance • {lowestRainStation?.rainfall_mm} mm
              </div>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Rainfall Coverage</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">
                {rainExpectedCount} of {validResults.length} Stations
              </div>
              <div className="text-xs text-emerald-400 font-semibold mt-0.5">
                {((rainExpectedCount / validResults.length) * 100).toFixed(0)}% expecting precipitation
              </div>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Average Expected Rain</span>
              <Droplets className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">
                {avgExpectedRain} <span className="text-xs font-normal text-slate-400">mm</span>
              </div>
              <div className="text-xs text-cyan-400 font-semibold mt-0.5">
                Mean across compared stations
              </div>
            </div>
          </div>

        </div>
      )}

      {/* View Mode Switcher */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
          Forecast Results for {comparisonResults[0]?.prediction_for || 'Selected Date'}
        </div>
        
        <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'cards'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Cards</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'table'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Detailed Table</span>
          </button>
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="glass-panel p-5 rounded-2xl border border-slate-800 animate-pulse space-y-4">
              <div className="h-5 bg-slate-800 rounded w-1/2"></div>
              <div className="h-10 bg-slate-800 rounded"></div>
              <div className="h-4 bg-slate-800 rounded w-3/4"></div>
              <div className="h-4 bg-slate-800 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      )}

      {/* CARDS VIEW */}
      {!loading && viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {comparisonResults.map((item, idx) => {
            if (item.error) {
              return (
                <div key={idx} className="glass-panel p-5 rounded-2xl border border-rose-500/20 bg-rose-500/5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-base">{item.city}</h4>
                      <button 
                        onClick={() => removeCity(item.city)}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1">{item.date}</span>
                    <p className="text-xs text-rose-300/90 mt-3 leading-relaxed">{item.error}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedDate('2023-05-10');
                      runComparison(selectedCities, '2023-05-10');
                    }}
                    className="w-full py-1.5 rounded-lg bg-slate-800 text-[11px] text-slate-300 hover:text-white"
                  >
                    Try Peak Date (2023-05-10)
                  </button>
                </div>
              );
            }

            const cat = getRainfallCategory(item.rainfall_mm);
            const prob = getProbabilityLevel(item.probability);
            const zone = CITY_ZONES[item.city] || 'Wet Zone';

            return (
              <div 
                key={idx} 
                className="glass-panel-glow p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-bold text-white text-lg group-hover:text-cyan-400 transition-colors">
                      {item.city}
                    </h4>
                    <button
                      onClick={() => removeCity(item.city)}
                      className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded"
                      title={`Remove ${item.city}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtitle Zone & Elevation */}
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400 mb-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      zone === 'Wet Zone' ? 'bg-sky-500/20 text-sky-300' :
                      zone === 'Dry Zone' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {zone}
                    </span>
                    {item.weather_summary?.elevation !== undefined && (
                      <span>{item.weather_summary.elevation} m</span>
                    )}
                  </div>

                  {/* Rain Tomorrow Status Badge */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between mb-4 ${
                    item.rain_tomorrow === 'YES'
                      ? 'bg-blue-600/15 text-blue-300 border-blue-500/30'
                      : 'bg-emerald-600/15 text-emerald-300 border-emerald-500/30'
                  }`}>
                    <div className="flex items-center space-x-2.5">
                      {item.rain_tomorrow === 'YES' ? (
                        <CloudRain className="w-5 h-5 text-blue-400 animate-bounce" />
                      ) : (
                        <Sun className="w-5 h-5 text-emerald-400" />
                      )}
                      <span className="text-xs font-black tracking-wide">
                        {item.rain_tomorrow === 'YES' ? 'RAIN EXPECTED' : 'DRY WEATHER'}
                      </span>
                    </div>
                  </div>

                  {/* Probability & Volume Grid */}
                  <div className="space-y-3 py-1">
                    
                    {/* Probability */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400 font-medium">Probability:</span>
                        <span className={`font-bold ${prob?.color}`}>{item.probability}%</span>
                      </div>
                      <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min(100, Math.max(5, item.probability))}%`,
                            backgroundColor: prob?.progressColor || '#0ea5e9'
                          }}
                        />
                      </div>
                    </div>

                    {/* Rainfall mm */}
                    <div className="flex justify-between items-baseline pt-1">
                      <span className="text-xs text-slate-400 font-medium">Expected Volume:</span>
                      <span className="font-extrabold text-xl text-white">
                        {item.rainfall_mm} <span className="text-xs font-normal text-cyan-400">mm</span>
                      </span>
                    </div>

                    {/* Intensity */}
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium">Category:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${cat?.badgeClass}`}>
                        {cat?.name}
                      </span>
                    </div>

                  </div>

                </div>

                {/* Card Footer: Weather Telemetry & Action */}
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  {item.weather_summary && (
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                        <span>{item.weather_summary.temperature_2m_mean}°C</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Wind className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{item.weather_summary.windspeed_10m_max} km/h</span>
                      </div>
                    </div>
                  )}

                  {onSelectCityForPrediction && (
                    <button
                      onClick={() => onSelectCityForPrediction(item.city)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-cyan-400 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/30 flex items-center justify-center space-x-1.5 transition-all"
                    >
                      <span>Full Station Forecast</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {!loading && viewMode === 'table' && (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3 font-bold">Station</th>
                  <th className="px-4 py-3 font-bold">Zone</th>
                  <th className="px-4 py-3 font-bold">Rain Tomorrow?</th>
                  <th className="px-4 py-3 font-bold">Probability</th>
                  <th className="px-4 py-3 font-bold">Expected (mm)</th>
                  <th className="px-4 py-3 font-bold">Category</th>
                  <th className="px-4 py-3 font-bold">Mean Temp</th>
                  <th className="px-4 py-3 font-bold">Max Wind</th>
                  <th className="px-4 py-3 font-bold">7-Day Rain</th>
                  <th className="px-4 py-3 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {comparisonResults.map((item, i) => {
                  if (item.error) {
                    return (
                      <tr key={i} className="hover:bg-slate-900/40">
                        <td className="px-5 py-3.5 font-bold text-white">{item.city}</td>
                        <td className="px-4 py-3.5 text-slate-400">{CITY_ZONES[item.city] || '—'}</td>
                        <td colSpan="7" className="px-4 py-3.5 text-rose-400">{item.error}</td>
                        <td className="px-4 py-3.5 text-right">
                          <button 
                            onClick={() => removeCity(item.city)}
                            className="text-slate-400 hover:text-rose-400"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  const cat = getRainfallCategory(item.rainfall_mm);
                  const prob = getProbabilityLevel(item.probability);
                  const zone = CITY_ZONES[item.city] || 'Wet Zone';

                  return (
                    <tr key={i} className="hover:bg-slate-900/50 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-white flex items-center space-x-2">
                        <span>{item.city}</span>
                        {item.weather_summary?.elevation && (
                          <span className="text-[10px] text-slate-500">({item.weather_summary.elevation}m)</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          zone === 'Wet Zone' ? 'bg-sky-500/20 text-sky-300' :
                          zone === 'Dry Zone' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {zone}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          item.rain_tomorrow === 'YES' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {item.rain_tomorrow === 'YES' ? 'YES (RAIN)' : 'NO (DRY)'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold">
                        <span className={prob?.color}>{item.probability}%</span>
                      </td>
                      <td className="px-4 py-3.5 font-extrabold text-white">
                        {item.rainfall_mm} mm
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${cat?.badgeClass}`}>
                          {cat?.name}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-300">
                        {item.weather_summary ? `${item.weather_summary.temperature_2m_mean}°C` : '—'}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-300">
                        {item.weather_summary ? `${item.weather_summary.windspeed_10m_max} km/h` : '—'}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-cyan-400">
                        {item.weather_summary ? `${item.weather_summary.rolling_rainfall} mm` : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-2">
                        {onSelectCityForPrediction && (
                          <button
                            onClick={() => onSelectCityForPrediction(item.city)}
                            className="text-cyan-400 hover:text-cyan-300 font-semibold"
                          >
                            Forecast
                          </button>
                        )}
                        <button
                          onClick={() => removeCity(item.city)}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COMPARATIVE CHARTS SECTION */}
      {chartData.length > 0 && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6 shadow-xl">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <BarChart2 className="w-5 h-5 text-cyan-400" />
                <span>Station Visual Comparison Charts</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-metric cross-station comparative graphs for {selectedDate}
              </p>
            </div>

            {/* Metric Selector Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {[
                { id: 'probability', label: 'Rain Probability (%)' },
                { id: 'rainfall', label: 'Rain Volume (mm)' },
                { id: 'temperature', label: 'Mean Temperature (°C)' },
                { id: 'wind', label: 'Wind Speed (km/h)' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveChartMetric(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeChartMetric === tab.id
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Display Container */}
          <div className="h-72 sm:h-80 w-full min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              {activeChartMetric === 'probability' ? (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="city" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" domain={[0, 100]} fontSize={11} tickFormatter={(val) => `${val}%`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: '#334155', 
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                    formatter={(val) => [`${val}%`, 'Rain Probability']}
                  />
                  <Bar dataKey="probability" name="Rain Probability (%)" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.probability >= 50 ? '#0ea5e9' : '#10b981'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              ) : activeChartMetric === 'rainfall' ? (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="city" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `${val} mm`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: '#334155', 
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                    formatter={(val) => [`${val} mm`, 'Predicted Amount']}
                  />
                  <Bar dataKey="rainfall_mm" name="Predicted Amount (mm)" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : activeChartMetric === 'temperature' ? (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="city" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" domain={['dataMin - 3', 'dataMax + 3']} fontSize={11} tickFormatter={(val) => `${val}°C`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: '#334155', 
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                    formatter={(val) => [`${val}°C`, 'Temperature']}
                  />
                  <Bar dataKey="temp_mean" name="Mean Temp (°C)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="city" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `${val} km/h`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: '#334155', 
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                    formatter={(val) => [`${val} km/h`, 'Wind Velocity']}
                  />
                  <Bar dataKey="windspeed" name="Max Wind Speed (km/h)" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

        </div>
      )}

    </div>
  );
}
