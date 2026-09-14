import React, { useState, useEffect } from 'react';
import { 
  CloudRain, 
  Sun, 
  Droplets, 
  Wind, 
  Thermometer, 
  Calendar, 
  MapPin, 
  Sparkles, 
  AlertTriangle, 
  ArrowRight, 
  RefreshCw, 
  ShieldCheck, 
  Compass, 
  TrendingUp,
  History,
  Clock,
  CheckCircle2,
  Info
} from 'lucide-react';
import { weatherApi } from '../api/weatherApi';
import { getRainfallCategory, getProbabilityLevel, getSeasonDetails, generateAdvisory } from '../utils/helpers';

export default function Dashboard({ cities, datasetInfo, preselectedCity, onSelectCityOnMap }) {
  const [selectedCity, setSelectedCity] = useState(preselectedCity || 'Colombo');
  const [selectedDate, setSelectedDate] = useState('2023-05-10');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (preselectedCity && preselectedCity !== selectedCity) {
      setSelectedCity(preselectedCity);
      handlePredict(preselectedCity, selectedDate);
    }
  }, [preselectedCity]);
  const [recentPredictions, setRecentPredictions] = useState(() => {
    try {
      const saved = localStorage.getItem('smartrain_recent');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Preset historical scenarios for quick testing
  const presets = [
    { label: 'Colombo Monsoon Peak', city: 'Colombo', date: '2023-05-10', tag: 'High Rain' },
    { label: 'Jaffna Dry Spell', city: 'Jaffna', date: '2023-02-15', tag: 'Dry' },
    { label: 'Hatton Hill Country', city: 'Hatton', date: '2022-11-20', tag: 'Torrential' },
    { label: 'Galle Coastal Storm', city: 'Galle', date: '2023-05-18', tag: 'Moderate' },
    { label: 'Latest Available Record', city: 'Colombo', date: '2023-06-15', tag: 'Recent' },
  ];

  // Save recent search
  const saveRecent = (predData) => {
    setRecentPredictions(prev => {
      const filtered = prev.filter(p => !(p.city === predData.city && p.date === predData.date));
      const updated = [predData, ...filtered].slice(0, 5);
      try {
        localStorage.setItem('smartrain_recent', JSON.stringify(updated));
      } catch (e) {
        console.error('Storage error', e);
      }
      return updated;
    });
  };

  // Run prediction
  const handlePredict = async (cityToUse = selectedCity, dateToUse = selectedDate) => {
    if (!cityToUse || !dateToUse) {
      setError('Please select both a city and a date.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await weatherApi.predictRainfall(cityToUse, dateToUse);
      setPrediction(data);
      saveRecent(data);
    } catch (err) {
      setError(err.message || 'Failed to generate rainfall prediction. Check backend status or date range.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load prediction
  useEffect(() => {
    handlePredict('Colombo', '2023-05-10');
  }, []);

  const rainfallCat = prediction ? getRainfallCategory(prediction.rainfall_mm) : null;
  const probLevel = prediction ? getProbabilityLevel(prediction.probability) : null;
  const seasonInfo = prediction?.weather_summary?.season ? getSeasonDetails(prediction.weather_summary.season) : null;
  const advisory = prediction ? generateAdvisory(
    prediction.rain_tomorrow, 
    prediction.probability, 
    prediction.rainfall_mm, 
    prediction.weather_summary?.rolling_rainfall || 0
  ) : null;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sri Lanka Meteorological ML Model</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            Tomorrow's Rainfall Prediction Engine
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Select any of Sri Lanka's 30 meteorological stations and a historical observation date.
            Our dual-stage <span className="text-cyan-400 font-medium">Gradient Boosting Classifier</span> and <span className="text-cyan-400 font-medium">Linear Regression Regressor</span> will predict rain likelihood and expected precipitation volume in millimeters.
          </p>
        </div>
      </div>

      {/* Prediction Query Controls & Preset Selector */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
          <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <span>Select Forecast Parameters</span>
          </h2>
          <span className="text-xs text-slate-400">
            Dataset Range: {datasetInfo?.start_date || '2010-01-01'} to {datasetInfo?.end_date || '2023-06-16'}
          </span>
        </div>

        {/* Input Form */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          
          {/* City Selection */}
          <div className="sm:col-span-5 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target City / Station</span>
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-white text-sm font-medium focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none"
            >
              {cities.map((city) => (
                <option key={city} value={city} className="bg-slate-900 text-white">
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="sm:col-span-4 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Observation Date</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              min={datasetInfo?.start_date || '2010-01-01'}
              max="2023-06-16"
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-white text-sm font-medium focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none [color-scheme:dark]"
            />
          </div>

          {/* Predict Action Button */}
          <div className="sm:col-span-3">
            <button
              onClick={() => handlePredict()}
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98] text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Computing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>Predict Rainfall</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="pt-2">
          <p className="text-xs text-slate-400 mb-2 font-medium">Quick Benchmark Scenarios:</p>
          <div className="flex flex-wrap gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedCity(p.city);
                  setSelectedDate(p.date);
                  handlePredict(p.city, p.date);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs text-slate-300 hover:text-white flex items-center space-x-2 transition-all"
              >
                <span>{p.label}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900/80 text-cyan-400 font-mono">
                  {p.tag}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-200">Prediction Notice</p>
              <p className="text-xs text-rose-300/90 mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Prediction Results Display */}
      {prediction && (
        <div className="space-y-6">
          
          {/* Main Forecast Hero Card */}
          <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border border-cyan-500/30 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
              
              <div>
                <div className="flex items-center space-x-2 text-xs font-medium text-cyan-400 uppercase tracking-wider mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>Station: {prediction.city}, Sri Lanka</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white">
                  Forecast for {prediction.prediction_for}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Calculated from atmospheric observations recorded on {prediction.date}
                </p>
              </div>

              {/* Rain Yes / No Badge */}
              <div className="flex items-center space-x-4">
                <div className={`px-5 py-3 rounded-2xl border flex items-center space-x-3 shadow-xl ${
                  prediction.rain_tomorrow === 'YES'
                    ? 'bg-blue-600/20 text-blue-300 border-blue-500/40 shadow-blue-500/10'
                    : 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10'
                }`}>
                  <div className={`p-2.5 rounded-xl ${
                    prediction.rain_tomorrow === 'YES' ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white'
                  }`}>
                    {prediction.rain_tomorrow === 'YES' ? (
                      <CloudRain className="w-7 h-7 animate-bounce" />
                    ) : (
                      <Sun className="w-7 h-7" />
                    )}
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-semibold opacity-80 block">
                      Rain Tomorrow?
                    </span>
                    <span className="text-2xl font-black tracking-wide">
                      {prediction.rain_tomorrow === 'YES' ? 'YES, RAIN EXPECTED' : 'NO RAIN EXPECTED'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Core Metrics: Probability Gauge & Volume */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
              
              {/* Rain Probability Card */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold uppercase tracking-wider">Occurrence Probability</span>
                  <span className={`font-bold ${probLevel?.color}`}>{probLevel?.label}</span>
                </div>
                <div className="flex items-baseline space-x-2 my-2">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white">
                    {prediction.probability}%
                  </span>
                  <span className="text-xs text-slate-400">confidence</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-2">
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${Math.min(100, Math.max(5, prediction.probability))}%`,
                      backgroundColor: probLevel?.progressColor || '#0ea5e9'
                    }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Estimated by Gradient Boosting Classification model.
                </p>
              </div>

              {/* Rain Volume (mm) */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold uppercase tracking-wider">Predicted Amount</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${rainfallCat?.badgeClass}`}>
                    {rainfallCat?.name}
                  </span>
                </div>
                <div className="flex items-baseline space-x-2 my-2">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white">
                    {prediction.rainfall_mm}
                  </span>
                  <span className="text-lg font-semibold text-cyan-400">mm</span>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  {rainfallCat?.desc}
                </p>
                <p className="text-[11px] text-slate-400 mt-2">
                  Estimated by Ridge/Linear Regression Pipeline with feature normalization.
                </p>
              </div>

              {/* Climate Season Context */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold uppercase tracking-wider">Meteorological Regime</span>
                  <Compass className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">
                    {seasonInfo?.name || 'Tropical Monsoonal'}
                  </h4>
                  <span className="text-xs text-cyan-400 font-medium">
                    {seasonInfo?.months}
                  </span>
                  <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                    {seasonInfo?.characteristics}
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Elevation: {prediction.weather_summary?.elevation ?? '—'} m</span>
                  <span>Station Lat: {prediction.weather_summary?.latitude ?? '—'}° N</span>
                </div>
              </div>

            </div>

            {/* Smart Advisory Banner */}
            {advisory && (
              <div className={`mt-6 p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                advisory.alertType === 'danger'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                  : advisory.alertType === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              }`}>
                <div className="flex items-start space-x-3.5">
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    advisory.alertType === 'danger' ? 'bg-rose-500/20 text-rose-400' :
                    advisory.alertType === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-white mb-0.5">
                      {advisory.headline}
                    </h5>
                    <p className="text-xs text-slate-300">
                      {advisory.advice}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 italic">
                      Transit notice: {advisory.travelNotice}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Atmospheric Input Conditions Breakdown */}
          {prediction.weather_summary && (
            <div className="glass-panel rounded-2xl p-6 border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
                <div>
                  <h4 className="font-semibold text-white text-base flex items-center space-x-2">
                    <Thermometer className="w-5 h-5 text-cyan-400" />
                    <span>Atmospheric Predictor Features ({prediction.date})</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Key meteorological telemetry features fed into the ML inference pipeline
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                
                {/* Mean Temp */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="text-xs text-slate-400 font-medium">Mean Temp</div>
                  <div className="text-xl font-bold text-white mt-1">
                    {prediction.weather_summary.temperature_2m_mean}°C
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Min {prediction.weather_summary.temperature_2m_min}° / Max {prediction.weather_summary.temperature_2m_max}°
                  </span>
                </div>

                {/* Apparent Temp */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="text-xs text-slate-400 font-medium">Feels Like</div>
                  <div className="text-xl font-bold text-cyan-400 mt-1">
                    {prediction.weather_summary.apparent_temperature_mean}°C
                  </div>
                  <span className="text-[10px] text-slate-500">Heat index combo</span>
                </div>

                {/* Wind Speed */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="text-xs text-slate-400 font-medium">Max Wind Speed</div>
                  <div className="text-xl font-bold text-white mt-1">
                    {prediction.weather_summary.windspeed_10m_max} <span className="text-xs font-normal text-slate-400">km/h</span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Gusts: {prediction.weather_summary.windgusts_10m_max} km/h
                  </span>
                </div>

                {/* Rain Today */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="text-xs text-slate-400 font-medium">Observed Rain</div>
                  <div className="text-xl font-bold text-blue-400 mt-1">
                    {prediction.weather_summary.rain_today} <span className="text-xs font-normal text-slate-400">mm</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Lag-1: {prediction.weather_summary.rainfall_lag_1} mm</span>
                </div>

                {/* Rolling 7-day */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="text-xs text-slate-400 font-medium">7-Day Rolling Rain</div>
                  <div className="text-xl font-bold text-sky-300 mt-1">
                    {prediction.weather_summary.rolling_rainfall} <span className="text-xs font-normal text-slate-400">mm</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Soil moisture driver</span>
                </div>

                {/* Precip Hours */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="text-xs text-slate-400 font-medium">Precip. Duration</div>
                  <div className="text-xl font-bold text-white mt-1">
                    {prediction.weather_summary.precipitation_hours} <span className="text-xs font-normal text-slate-400">hrs</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Rainfall hours</span>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* Recent Predictions History */}
      {recentPredictions.length > 0 && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-white text-sm flex items-center space-x-2">
              <History className="w-4 h-4 text-cyan-400" />
              <span>Recent Query History</span>
            </h4>
            <button
              onClick={() => {
                setRecentPredictions([]);
                localStorage.removeItem('smartrain_recent');
              }}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {recentPredictions.map((rec, i) => (
              <div
                key={i}
                onClick={() => {
                  setSelectedCity(rec.city);
                  setSelectedDate(rec.date);
                  setPrediction(rec);
                }}
                className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/30 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{rec.city}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    rec.rain_tomorrow === 'YES' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {rec.rain_tomorrow === 'YES' ? 'RAIN' : 'DRY'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                  <span>{rec.date}</span>
                  <span className="text-cyan-400 font-medium">{rec.rainfall_mm} mm</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
