import React, { useState } from 'react';
import { 
  Sliders, 
  Sparkles, 
  Wind, 
  Thermometer, 
  Droplets, 
  RotateCcw, 
  CloudRain, 
  Sun, 
  Zap, 
  MapPin, 
  Calendar,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { weatherApi } from '../api/weatherApi';
import { getRainfallCategory, getProbabilityLevel, getSeasonDetails } from '../utils/helpers';

export default function Simulator({ cities }) {
  // Default values representative of typical Sri Lankan conditions
  const defaultParams = {
    city: 'Colombo',
    month: 5,
    temperature_2m_mean: 28.5,
    temperature_2m_max: 32.0,
    temperature_2m_min: 25.0,
    apparent_temperature_mean: 33.5,
    windspeed_10m_max: 18.0,
    winddirection_10m_dominant: 220,
    precipitation_hours: 3.5,
    rolling_rainfall: 25.0,
    rainfall_lag_1: 8.0,
  };

  const [params, setParams] = useState(defaultParams);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const scenarioPresets = [
    {
      name: 'Southwest Monsoon Torrential',
      description: 'Typical intense monsoon conditions on Sri Lanka’s western coast',
      values: {
        city: 'Colombo',
        month: 6,
        temperature_2m_mean: 27.5,
        temperature_2m_max: 29.5,
        temperature_2m_min: 24.5,
        apparent_temperature_mean: 32.0,
        windspeed_10m_max: 32.0,
        winddirection_10m_dominant: 240,
        precipitation_hours: 8.0,
        rolling_rainfall: 85.0,
        rainfall_lag_1: 28.0,
      }
    },
    {
      name: 'Jaffna Dry Northeast Summer',
      description: 'Arid, hot, dry period with minimal humidity and no antecedent rainfall',
      values: {
        city: 'Jaffna',
        month: 2,
        temperature_2m_mean: 29.0,
        temperature_2m_max: 34.0,
        temperature_2m_min: 24.0,
        apparent_temperature_mean: 31.0,
        windspeed_10m_max: 12.0,
        winddirection_10m_dominant: 45,
        precipitation_hours: 0.0,
        rolling_rainfall: 0.0,
        rainfall_lag_1: 0.0,
      }
    },
    {
      name: 'Central Highlands Heavy Mist (Hatton)',
      description: 'Cool, high-elevation saturated mountain atmosphere',
      values: {
        city: 'Hatton',
        month: 11,
        temperature_2m_mean: 18.0,
        temperature_2m_max: 21.0,
        temperature_2m_min: 15.0,
        apparent_temperature_mean: 18.5,
        windspeed_10m_max: 19.0,
        winddirection_10m_dominant: 70,
        precipitation_hours: 6.0,
        rolling_rainfall: 55.0,
        rainfall_lag_1: 18.0,
      }
    },
    {
      name: 'Inter-Monsoon Convective Afternoon Storm',
      description: 'Hot midday sun triggering severe evening thunderstorms',
      values: {
        city: 'Kandy',
        month: 4,
        temperature_2m_mean: 29.5,
        temperature_2m_max: 34.5,
        temperature_2m_min: 23.0,
        apparent_temperature_mean: 36.0,
        windspeed_10m_max: 14.0,
        winddirection_10m_dominant: 180,
        precipitation_hours: 2.5,
        rolling_rainfall: 18.0,
        rainfall_lag_1: 4.0,
      }
    }
  ];

  const handleSimulate = async (customPayload = params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await weatherApi.predictCustom(customPayload);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Simulation failed.');
    } finally {
      setLoading(false);
    }
  };

  const updateParam = (field, value) => {
    setParams(prev => {
      const updated = { ...prev, [field]: value };
      // Ensure max temp >= mean temp >= min temp logically
      if (field === 'temperature_2m_mean') {
        if (value > updated.temperature_2m_max) updated.temperature_2m_max = value + 2;
        if (value < updated.temperature_2m_min) updated.temperature_2m_min = value - 2;
      }
      return updated;
    });
  };

  const loadPreset = (presetValues) => {
    setParams(presetValues);
    handleSimulate(presetValues);
  };

  const rainfallCat = result ? getRainfallCategory(result.rainfall_mm) : null;
  const probLevel = result ? getProbabilityLevel(result.probability) : null;
  const seasonInfo = result?.season ? getSeasonDetails(result.season) : null;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-semibold text-cyan-400 mb-1">
              <Zap className="w-4 h-4" />
              <span>Interactive ML Simulator</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              What-If Weather Scenario Simulator
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Adjust atmospheric variables in real-time to observe how the Gradient Boosting and Linear Regression models evaluate rain risk and quantity.
            </p>
          </div>

          <button
            onClick={() => {
              setParams(defaultParams);
              setResult(null);
            }}
            className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs font-medium border border-slate-700/80 flex items-center space-x-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Sliders</span>
          </button>
        </div>

        {/* Preset scenario shortcuts */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <span className="text-xs text-slate-400 block mb-2 font-medium">Load Meteorological Scenario:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {scenarioPresets.map((p, i) => (
              <button
                key={i}
                onClick={() => loadPreset(p.values)}
                className="text-left p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/90 border border-slate-800/80 hover:border-cyan-500/30 transition-all group"
              >
                <div className="text-xs font-semibold text-white group-hover:text-cyan-400 transition-colors">
                  {p.name}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {p.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Simulator Controls & Realtime Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sliders Form */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Atmospheric Parameter Controls</span>
            </h3>
            <span className="text-xs text-slate-400">Live Adjustment</span>
          </div>

          {/* City & Month Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5 mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Station / Location</span>
              </label>
              <select
                value={params.city}
                onChange={(e) => updateParam('city', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white text-xs font-medium focus:ring-1 focus:ring-cyan-500 outline-none"
              >
                {cities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Observation Month: {params.month} ({['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][params.month - 1]})</span>
              </label>
              <input
                type="range"
                min="1"
                max="12"
                step="1"
                value={params.month}
                onChange={(e) => updateParam('month', parseInt(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

          </div>

          {/* Temperature Controls */}
          <div className="space-y-4 pt-2 border-t border-slate-800/60">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Thermal Profile</span>
            </h4>

            {/* Mean Temp */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span>Mean Temperature (2m)</span>
                <span className="text-cyan-400 font-bold font-mono">{params.temperature_2m_mean}°C</span>
              </div>
              <input
                type="range"
                min="14"
                max="36"
                step="0.5"
                value={params.temperature_2m_mean}
                onChange={(e) => updateParam('temperature_2m_mean', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Apparent Temp */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span>Apparent "Feels-Like" Temperature</span>
                <span className="text-cyan-400 font-bold font-mono">{params.apparent_temperature_mean}°C</span>
              </div>
              <input
                type="range"
                min="14"
                max="44"
                step="0.5"
                value={params.apparent_temperature_mean}
                onChange={(e) => updateParam('apparent_temperature_mean', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

          </div>

          {/* Wind Controls */}
          <div className="space-y-4 pt-2 border-t border-slate-800/60">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              <span>Wind Dynamics</span>
            </h4>

            {/* Wind speed */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span>Max Wind Speed (10m)</span>
                <span className="text-cyan-400 font-bold font-mono">{params.windspeed_10m_max} km/h</span>
              </div>
              <input
                type="range"
                min="2"
                max="55"
                step="1"
                value={params.windspeed_10m_max}
                onChange={(e) => updateParam('windspeed_10m_max', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Wind direction */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span>Dominant Wind Direction</span>
                <span className="text-cyan-400 font-bold font-mono">{params.winddirection_10m_dominant}° ({
                  params.winddirection_10m_dominant > 315 || params.winddirection_10m_dominant <= 45 ? 'N' :
                  params.winddirection_10m_dominant <= 135 ? 'E (NE Monsoon)' :
                  params.winddirection_10m_dominant <= 225 ? 'S' : 'W (SW Monsoon)'
                })</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="10"
                value={params.winddirection_10m_dominant}
                onChange={(e) => updateParam('winddirection_10m_dominant', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Moisture & Rolling Rainfall Controls */}
          <div className="space-y-4 pt-2 border-t border-slate-800/60">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span>Antecedent Precipitation & Soil Moisture</span>
            </h4>

            {/* Rolling 7-day rainfall */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span>Past 7-Day Cumulative Rainfall</span>
                <span className="text-cyan-400 font-bold font-mono">{params.rolling_rainfall} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                step="2"
                value={params.rolling_rainfall}
                onChange={(e) => updateParam('rolling_rainfall', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Precipitation hours */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span>Observed Precipitation Duration</span>
                <span className="text-cyan-400 font-bold font-mono">{params.precipitation_hours} hours</span>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                step="0.5"
                value={params.precipitation_hours}
                onChange={(e) => updateParam('precipitation_hours', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => handleSimulate()}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>{loading ? 'Simulating ML Predictions...' : 'Run Scenario Simulation'}</span>
          </button>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

        </div>

        {/* Simulation Output Card */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="glass-panel-glow rounded-2xl p-6 border border-cyan-500/30">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Zap className="w-4 h-4" />
                <span>Simulated Inference Result</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                Real-Time ML
              </span>
            </div>

            {result ? (
              <div className="space-y-6">
                
                {/* Result Hero */}
                <div className="text-center py-4">
                  <div className="inline-flex p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner mb-3">
                    {result.rain_tomorrow === 'YES' ? (
                      <CloudRain className="w-12 h-12 text-blue-400 animate-bounce" />
                    ) : (
                      <Sun className="w-12 h-12 text-amber-400" />
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-white">
                    {result.rain_tomorrow === 'YES' ? 'RAIN PREDICTED' : 'NO RAIN PREDICTED'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Simulation for {result.city} under specified conditions
                  </p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                      Rain Probability
                    </span>
                    <div className="text-3xl font-extrabold text-white mt-1">
                      {result.probability}%
                    </div>
                    <span className={`text-[11px] font-bold ${probLevel?.color}`}>
                      {probLevel?.label}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                      Estimated Volume
                    </span>
                    <div className="text-3xl font-extrabold text-cyan-400 mt-1">
                      {result.rainfall_mm} <span className="text-sm font-normal text-slate-400">mm</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block mt-0.5 ${rainfallCat?.badgeClass}`}>
                      {rainfallCat?.name}
                    </span>
                  </div>
                </div>

                {/* Season Details */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                  <div className="text-slate-400 font-medium mb-1">Assigned Sri Lankan Season:</div>
                  <div className="text-white font-bold">{seasonInfo?.name}</div>
                  <div className="text-slate-400 text-[11px] mt-1">{seasonInfo?.characteristics}</div>
                </div>

              </div>
            ) : (
              <div className="py-16 text-center space-y-3 text-slate-400">
                <Sliders className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-sm font-medium">Adjust sliders and click "Run Scenario Simulation"</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Try testing high wind with heavy rolling rainfall to observe how the Gradient Boosting classifier sensitivity triggers.
                </p>
              </div>
            )}

          </div>

          {/* Model Feature Influence Note */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>How this Simulation Works</span>
            </div>
            <p className="leading-relaxed">
              When you adjust the sliders, the system replicates the exact feature engineering logic used during model training:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-400">
              <li>Calculates seasonal index (1 to 4) based on month</li>
              <li>Derives temperature-apparent temperature interaction (<code className="text-cyan-300">temp × apparent_temp</code>)</li>
              <li>Categorizes wind speed into Low, Moderate, or High classes</li>
              <li>Looks up station coordinates and terrain elevation (e.g. Colombo 16m vs Hatton 1281m)</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
