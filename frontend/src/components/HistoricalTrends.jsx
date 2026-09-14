import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  MapPin, 
  Droplets, 
  Thermometer, 
  Wind, 
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { weatherApi } from '../api/weatherApi';

export default function HistoricalTrends({ cities }) {
  const [selectedCity, setSelectedCity] = useState('Colombo');
  const [selectedDate, setSelectedDate] = useState('2023-05-15');
  const [daysWindow, setDaysWindow] = useState(14);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = async (city = selectedCity, date = selectedDate, days = daysWindow) => {
    setLoading(true);
    setError(null);
    try {
      const res = await weatherApi.getCityHistory(city, date, days);
      setHistoryData(res.records || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch historical trends.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory('Colombo', '2023-05-15', 14);
  }, []);

  // Compute summary stats for the current window
  const totalRain = historyData.reduce((acc, curr) => acc + (curr.rain_sum || 0), 0);
  const avgTemp = historyData.length > 0 
    ? (historyData.reduce((acc, curr) => acc + (curr.temp_mean || 0), 0) / historyData.length).toFixed(1)
    : 0;
  const maxRainRecord = historyData.reduce((max, curr) => (curr.rain_sum > (max?.rain_sum || 0) ? curr : max), null);
  const rainyDaysCount = historyData.filter(d => (d.rain_sum || 0) > 0.1).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-semibold text-cyan-400 mb-1">
              <BarChart3 className="w-4 h-4" />
              <span>Time-Series Analytics</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Historical Weather & Precipitation Trends
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Analyze multi-day rainfall accumulation, temperature variation, and wind trends leading up to any date.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {[7, 14, 30].map(d => (
              <button
                key={d}
                onClick={() => {
                  setDaysWindow(d);
                  fetchHistory(selectedCity, selectedDate, d);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  daysWindow === d
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {d} Days
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mt-6 pt-4 border-t border-slate-800">
          
          <div className="sm:col-span-5 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target Station</span>
            </label>
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                fetchHistory(e.target.value, selectedDate, daysWindow);
              }}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white text-xs font-medium focus:ring-1 focus:ring-cyan-500 outline-none"
            >
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reference Anchor Date</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              min="2010-01-01"
              max="2023-06-16"
              onChange={(e) => {
                setSelectedDate(e.target.value);
                fetchHistory(selectedCity, e.target.value, daysWindow);
              }}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-white text-xs font-medium focus:ring-1 focus:ring-cyan-500 outline-none [color-scheme:dark]"
            />
          </div>

          <div className="sm:col-span-3 flex items-end">
            <button
              onClick={() => fetchHistory()}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Update Charts</span>
            </button>
          </div>

        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Window Rain</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {totalRain.toFixed(1)} <span className="text-sm font-normal text-slate-400">mm</span>
          </div>
          <span className="text-[11px] text-slate-500">Across {historyData.length} records</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Peak Daily Rain</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400 mt-1">
            {maxRainRecord?.rain_sum || 0} <span className="text-sm font-normal text-slate-400">mm</span>
          </div>
          <span className="text-[11px] text-slate-500">
            {maxRainRecord?.date || 'N/A'}
          </span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Average Temperature</span>
            <Thermometer className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {avgTemp}°C
          </div>
          <span className="text-[11px] text-slate-500">Mean 2m observation</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Rain Frequency</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {rainyDaysCount} <span className="text-sm font-normal text-slate-400">/ {historyData.length} days</span>
          </div>
          <span className="text-[11px] text-slate-500">
            {historyData.length > 0 ? ((rainyDaysCount / historyData.length) * 100).toFixed(0) : 0}% wet days
          </span>
        </div>

      </div>

      {/* Chart 1: Daily Rainfall & Rolling 7-Day Rainfall */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="font-bold text-white text-base flex items-center space-x-2">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span>Precipitation Volume & Cumulative Rolling Rainfall</span>
            </h3>
            <p className="text-xs text-slate-400">
              Daily rainfall (bars) compared with 7-day antecedent moving sum (line)
            </p>
          </div>
        </div>

        <div className="h-72 sm:h-80 w-full pt-2">
          {historyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  fontSize={11}
                  tickFormatter={(str) => str.slice(5)} 
                />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="rain_sum" name="Daily Rain (mm)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="rolling_rainfall" name="7-Day Rolling (mm)" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              No historical data available for selected period.
            </div>
          )}
        </div>
      </div>

      {/* Chart 2: Thermal Profile (Min, Mean, Max Temperatures) */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="font-bold text-white text-base flex items-center space-x-2">
              <Thermometer className="w-4 h-4 text-amber-400" />
              <span>Thermal Profile (Min, Mean, Max Temperatures)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Diurnal temperature envelope and mean thermal variance in °C
            </p>
          </div>
        </div>

        <div className="h-72 sm:h-80 w-full pt-2">
          {historyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  fontSize={11}
                  tickFormatter={(str) => str.slice(5)} 
                />
                <YAxis stroke="#64748b" fontSize={11} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="temp_max" name="Max Temp (°C)" fill="#f59e0b" fillOpacity={0.15} stroke="#f59e0b" strokeWidth={2} />
                <Line type="monotone" dataKey="temp_mean" name="Mean Temp (°C)" stroke="#38bdf8" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="temp_min" name="Min Temp (°C)" stroke="#60a5fa" strokeWidth={1.5} strokeDasharray="4 4" />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              No historical data available for selected period.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
