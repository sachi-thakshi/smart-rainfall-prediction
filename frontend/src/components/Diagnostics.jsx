import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Server, 
  RefreshCw, 
  Code, 
  Layers, 
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';
import { weatherApi } from '../api/weatherApi';

export default function Diagnostics() {
  const [healthData, setHealthData] = useState(null);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [rootStatus, setRootStatus] = useState(null);
  const [latency, setLatency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkStatus = async () => {
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      const [h, m, r] = await Promise.all([
        weatherApi.getHealth(),
        weatherApi.getModelMetrics(),
        weatherApi.getRootStatus()
      ]);
      const end = performance.now();
      setLatency(Math.round(end - start));
      setHealthData(h);
      setModelMetrics(m);
      setRootStatus(r);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const featureExplanations = [
    { name: 'temperature_2m_mean', type: 'Float (°C)', role: 'Mean ambient temperature at 2m height' },
    { name: 'temperature_2m_max', type: 'Float (°C)', role: 'Maximum daytime thermal peak' },
    { name: 'temperature_2m_min', type: 'Float (°C)', role: 'Minimum nighttime diurnal temperature' },
    { name: 'apparent_temperature_mean', type: 'Float (°C)', role: 'Heat index / humidity adjusted human perceived temp' },
    { name: 'windspeed_10m_max', type: 'Float (km/h)', role: 'Peak sustained wind velocity at 10m' },
    { name: 'windgusts_10m_max', type: 'Float (km/h)', role: 'Maximum turbulent wind gusts recorded' },
    { name: 'winddirection_10m_dominant', type: 'Float (Degrees)', role: 'Azimuth angle indicating monsoonal wind flow' },
    { name: 'precipitation_hours', type: 'Float (Hours)', role: 'Duration of recorded precipitation during the day' },
    { name: 'latitude', type: 'Float (°N)', role: 'Station geographic latitude' },
    { name: 'longitude', type: 'Float (°E)', role: 'Station geographic longitude' },
    { name: 'elevation', type: 'Float (m)', role: 'Topographic altitude above sea level (e.g. Hatton 1281m)' },
    { name: 'month', type: 'Integer (1-12)', role: 'Calendar month indicator' },
    { name: 'season', type: 'Categorical (1-4)', role: 'Sri Lanka Monsoonal regime (Maha, Yala, Inter-monsoons)' },
    { name: 'rolling_rainfall', type: 'Float (mm)', role: '7-day antecedent moving sum of precipitation' },
    { name: 'rainfall_lag_1', type: 'Float (mm)', role: 'Rainfall observed on the previous consecutive day' },
    { name: 'temp_diff', type: 'Float (°C)', role: 'Diurnal day-over-day temperature shift' },
    { name: 'wind_change', type: 'Float (km/h)', role: 'Day-over-day wind velocity delta' },
    { name: 'temp_apparent_temp_interaction', type: 'Float', role: 'Engineered interaction term (temp × apparent_temp)' },
    { name: 'wind_category', type: 'Categorical (0-2)', role: 'Binned wind tier: Low (<=10), Moderate (<=20), High (>20)' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-semibold text-cyan-400 mb-1">
              <Cpu className="w-4 h-4" />
              <span>System & Architecture Diagnostics</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Machine Learning Pipeline & Backend Diagnostics
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Live telemetry monitoring FastAPI backend operational status, model weights, and feature normalization layers.
            </p>
          </div>

          <button
            onClick={checkStatus}
            disabled={loading}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center space-x-2 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Ping Backend API</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <p className="font-bold">Connection Warning</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Backend & ML Status KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Status */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>FastAPI Server</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-full ${
              healthData?.status === 'healthy' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
            }`} />
            <span className="text-lg font-bold text-white capitalize">
              {healthData?.status || 'Offline'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-2">
            Roundtrip ping latency: <strong className="text-cyan-400">{latency ?? '—'} ms</strong>
          </span>
        </div>

        {/* Classifier */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Binary Classifier</span>
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-lg font-bold text-white">
            {healthData?.classification_model || 'GradientBoosting'}
          </div>
          <span className="text-[11px] text-slate-400 block mt-2">
            Target: <code className="text-cyan-300">rain_tomorrow (0 / 1)</code>
          </span>
        </div>

        {/* Regressor */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Precipitation Regressor</span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-lg font-bold text-white">
            {healthData?.regression_model || 'Linear Regression'}
          </div>
          <span className="text-[11px] text-slate-400 block mt-2">
            Target: <code className="text-cyan-300">rainfall_amount_tomorrow (mm)</code>
          </span>
        </div>

        {/* Dataset Rows */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Dataset Observations</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-white">
            {healthData?.dataset_rows ? healthData.dataset_rows.toLocaleString() : '147,480'}
          </div>
          <span className="text-[11px] text-slate-400 block mt-2">
            {healthData?.number_of_cities || 30} Stations • 2010 to 2023
          </span>
        </div>

      </div>

      {/* Feature Engineering Architecture (The 19 Features) */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-white text-base flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Model Feature Matrix (19 Engineered Meteorological Inputs)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Features ingested into the scikit-learn models, reproducing preprocessing from SmartRain_EDA
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
            19 Columns
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {featureExplanations.map((f, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <code className="text-xs font-bold text-cyan-300 font-mono">{f.name}</code>
                <span className="text-[10px] text-slate-400 font-medium px-1.5 py-0.5 rounded bg-slate-800">
                  {f.type}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {f.role}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Backend API Endpoints Reference */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="font-bold text-white text-base flex items-center space-x-2">
            <Code className="w-4 h-4 text-cyan-400" />
            <span>FastAPI Endpoints Reference</span>
          </h3>
          <p className="text-xs text-slate-400">
            Complete API contracts implemented and integrated between Frontend and Backend
          </p>
        </div>

        <div className="space-y-2 text-xs">
          {[
            { method: 'POST', path: '/predict', desc: 'Generate rainfall classification and mm regression for a city and historical date.' },
            { method: 'POST', path: '/predict-custom', desc: 'Simulate custom weather conditions with temperature, wind, and rolling rainfall sliders.' },
            { method: 'POST', path: '/predict-batch', desc: 'Evaluate rainfall predictions across multiple cities simultaneously for comparative analysis.' },
            { method: 'GET', path: '/city-history', desc: 'Fetch sequential historical daily records for time-series trend charting.' },
            { method: 'GET', path: '/cities-overview', desc: 'Return all 30 stations with latitude, longitude, elevation, and climate zone.' },
            { method: 'GET', path: '/cities', desc: 'Retrieve list of available Sri Lankan cities.' },
            { method: 'GET', path: '/dataset-info', desc: 'Dataset summary including date boundaries (2010-01-01 to 2023-06-17).' },
            { method: 'GET', path: '/health', desc: 'FastAPI health check, loaded model statuses, and active row counts.' },
            { method: 'GET', path: '/model-metrics', desc: 'Machine learning feature specifications and training target metadata.' },
          ].map((ep, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  ep.method === 'POST' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {ep.method}
                </span>
                <code className="text-xs text-white font-mono">{ep.path}</code>
              </div>
              <span className="text-slate-400 text-[11px] sm:text-right">{ep.desc}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
