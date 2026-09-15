import React, { useState, useEffect, useMemo } from 'react';
import { 
  CloudRain, 
  Droplets, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar, 
  MapPin, 
  Search, 
  ArrowUpDown, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Wind, 
  Thermometer, 
  BarChart2, 
  LayoutGrid, 
  Table as TableIcon,
  RefreshCw,
  Radio,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Percent
} from 'lucide-react';
import { 
  fetchLiveDistrictWeather, 
  getCurrentDates, 
  getRainStatus, 
  computeIslandSummary 
} from '../data/districtRainfallData';

export default function DistrictRainfallWidget({ onSelectStationForPrediction }) {
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'yesterday' | 'comparison'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('All');
  const [sortBy, setSortBy] = useState('rain_desc'); // 'rain_desc', 'rain_asc', 'name_asc', 'delta_desc', 'pct_desc'
  const [expandedDistrict, setExpandedDistrict] = useState(null);
  const [comparisonLayout, setComparisonLayout] = useState('cards'); // 'cards' | 'table'

  // Live state
  const [dates, setDates] = useState(getCurrentDates());
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('live'); // 'live' | 'estimated'
  const [sourceLabel, setSourceLabel] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchLiveDistrictWeather();
      setDates(result.dates || getCurrentDates());
      setDistricts(result.districts || []);
      setDataSource(result.dataSource);
      setSourceLabel(result.sourceLabel);
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (e) {
      console.error('Error loading live weather', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadData, 300000);
    return () => clearInterval(interval);
  }, []);

  const summary = useMemo(() => computeIslandSummary(districts), [districts]);

  // Filter & Sort
  const filteredDistricts = useMemo(() => {
    return districts.filter((d) => {
      const matchesSearch = 
        d.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.stations.some(s => s.station.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesZone = selectedZone === 'All' || d.zone === selectedZone;
      return matchesSearch && matchesZone;
    }).sort((a, b) => {
      if (sortBy === 'rain_desc') {
        const valA = activeTab === 'yesterday' ? a.yesterday_rain_mm : a.today_rain_mm;
        const valB = activeTab === 'yesterday' ? b.yesterday_rain_mm : b.today_rain_mm;
        return valB - valA;
      }
      if (sortBy === 'rain_asc') {
        const valA = activeTab === 'yesterday' ? a.yesterday_rain_mm : a.today_rain_mm;
        const valB = activeTab === 'yesterday' ? b.yesterday_rain_mm : b.today_rain_mm;
        return valA - valB;
      }
      if (sortBy === 'name_asc') {
        return a.district.localeCompare(b.district);
      }
      if (sortBy === 'delta_desc') {
        return b.delta_mm - a.delta_mm;
      }
      if (sortBy === 'pct_desc') {
        return b.pct_change - a.pct_change;
      }
      return 0;
    });
  }, [districts, searchQuery, selectedZone, sortBy, activeTab]);

  const toggleExpand = (districtName) => {
    setExpandedDistrict(prev => prev === districtName ? null : districtName);
  };

  // Scaling maximum
  const maxRainIsland = useMemo(() => {
    if (districts.length === 0) return 10;
    return Math.max(...districts.map(d => Math.max(d.today_rain_mm, d.yesterday_rain_mm, 8)));
  }, [districts]);

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6 animate-fadeIn">
      
      {/* Top Header & Real-Time Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          {/* Status and dynamic date badge */}
          <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
            <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              dataSource === 'live' 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}>
              <Radio className={`w-3.5 h-3.5 ${dataSource === 'live' ? 'animate-pulse text-emerald-400' : 'text-amber-400'}`} />
              <span>{dataSource === 'live' ? 'Real-Time Observed Telemetry' : 'Historical Pattern Estimate (Offline)'}</span>
            </span>

            <span className="text-xs text-slate-300 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-800 font-medium flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Current System Date: <strong>{dates.todaySlash}</strong></span>
            </span>

            {lastRefreshed && (
              <span className="text-[11px] text-slate-400 bg-slate-900/60 px-2.5 py-0.5 rounded-full border border-slate-800/80 font-mono hidden sm:inline">
                Synced: {lastRefreshed}
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <CloudRain className="w-7 h-7 text-cyan-400 shrink-0" />
            <span>District-wise Live Rainfall & Weather</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Live rainfall observations and telemetry across Sri Lanka's 17 meteorological districts and 30 stations.
            <span className="text-cyan-400 font-semibold"> Today</span> represents the active current date (<strong className="text-white">{dates.todaySlash}</strong> – {dates.todayFormatted}), and <span className="text-sky-400 font-semibold">Yesterday</span> represents (<strong className="text-white">{dates.yesterdaySlash}</strong> – {dates.yesterdayFormatted}).
          </p>
        </div>

        {/* View Switcher Tabs & Refresh */}
        <div className="flex items-center gap-2.5 self-start lg:self-auto shrink-0">
          <div className="flex items-center p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setActiveTab('today')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 ${
                activeTab === 'today'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
              <span>Today's Live Rain</span>
              <span className="text-[10px] opacity-80 font-mono hidden sm:inline">({dates.todaySlash})</span>
            </button>

            <button
              onClick={() => setActiveTab('yesterday')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 ${
                activeTab === 'yesterday'
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Yesterday</span>
              <span className="text-[10px] opacity-80 font-mono hidden sm:inline">({dates.yesterdaySlash})</span>
            </button>

            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 ${
                activeTab === 'comparison'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Today vs Yesterday</span>
            </button>
          </div>

          {/* Refresh Action */}
          <button
            onClick={loadData}
            disabled={loading}
            title="Refresh Live Telemetry"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Island Avg Today */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold uppercase tracking-wider">Island Avg Today</span>
              <span className="text-[10px] font-mono text-cyan-400">{dates.todaySlash}</span>
            </div>
            <div className="flex items-baseline space-x-2 my-1">
              <span className="text-3xl font-extrabold text-white">{summary.todayAvg}</span>
              <span className="text-sm font-semibold text-cyan-400">mm</span>
              <span className={`text-xs font-semibold flex items-center ml-auto ${
                summary.deltaAvg > 0 ? 'text-emerald-400' : summary.deltaAvg < 0 ? 'text-sky-300' : 'text-slate-400'
              }`}>
                {summary.deltaAvg > 0 ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
                {summary.deltaAvg > 0 ? `+${summary.deltaAvg}` : summary.deltaAvg} mm ({summary.pctAvg > 0 ? `+${summary.pctAvg}` : summary.pctAvg}%)
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              National 17-district average (Yesterday: {summary.yesterdayAvg} mm)
            </p>
          </div>

          {/* Island Avg Yesterday */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold uppercase tracking-wider">Island Avg Yesterday</span>
              <span className="text-[10px] font-mono text-sky-400">{dates.yesterdaySlash}</span>
            </div>
            <div className="flex items-baseline space-x-2 my-1">
              <span className="text-3xl font-extrabold text-white">{summary.yesterdayAvg}</span>
              <span className="text-sm font-semibold text-sky-400">mm</span>
              <span className="text-xs text-slate-400 ml-auto">Prior 24h baseline</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Preceding 24-hour recorded cycle across the island
            </p>
          </div>

          {/* Wettest District Today */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold uppercase tracking-wider">Wettest District Today</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold">
                {summary.wettestToday?.zone}
              </span>
            </div>
            <div className="flex items-baseline space-x-2 my-1">
              <span className="text-2xl font-extrabold text-white truncate">
                {summary.wettestToday?.district}
              </span>
              <span className="text-lg font-bold text-cyan-400">{summary.wettestToday?.today_rain_mm} mm</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Temp: {summary.wettestToday?.today_temp_mean}°C • Wind: {summary.wettestToday?.today_wind_max} km/h
            </p>
          </div>

          {/* Rainy Districts Count */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold uppercase tracking-wider">Districts with Rain</span>
              <span className="text-[10px] font-mono text-emerald-400">
                {Math.round((summary.rainyDistrictsToday / summary.totalDistricts) * 100)}% coverage
              </span>
            </div>
            <div className="flex items-baseline space-x-2 my-1">
              <span className="text-3xl font-extrabold text-white">{summary.rainyDistrictsToday}</span>
              <span className="text-sm font-semibold text-slate-400">/ {summary.totalDistricts} districts</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {summary.totalStations} total observation stations reporting
            </p>
          </div>

        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search district or station (e.g., Colombo, Galle, Kandy, Jaffna)..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          
          {/* Zone Selector Pills */}
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            {['All', 'Wet Zone', 'Dry Zone', 'Intermediate Zone'].map((z) => (
              <button
                key={z}
                onClick={() => setSelectedZone(z)}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  selectedZone === z
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {z === 'Intermediate Zone' ? 'Intermediate' : z}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 text-xs focus:ring-2 focus:ring-cyan-500 outline-none cursor-pointer"
            >
              <option value="rain_desc">Highest Rain First</option>
              <option value="rain_asc">Lowest Rain First</option>
              <option value="name_asc">District Name (A-Z)</option>
              <option value="delta_desc">Highest 24h mm Increase</option>
              <option value="pct_desc">Highest % Change</option>
            </select>
          </div>

          {/* Comparison View Layout Toggle (Only in comparison tab) */}
          {activeTab === 'comparison' && (
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setComparisonLayout('cards')}
                className={`p-1.5 rounded-lg transition-all ${
                  comparisonLayout === 'cards' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setComparisonLayout('table')}
                className={`p-1.5 rounded-lg transition-all ${
                  comparisonLayout === 'table' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
                }`}
                title="Comparison Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="py-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-white">Fetching Real-Time Meteorological Telemetry...</p>
          <p className="text-xs text-slate-400">Querying live satellite & weather station feeds for {dates.todaySlash}</p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TODAY'S LIVE RAINFALL VIEW */}
      {/* ========================================================================= */}
      {!loading && activeTab === 'today' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-400 px-1">
            <span className="font-semibold text-slate-200">
              Showing {filteredDistricts.length} Districts • Actual Current Date: <strong className="text-cyan-400">{dates.todaySlash}</strong> ({dates.todayFormatted})
            </span>
            <span className="text-[11px] text-slate-400 flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${dataSource === 'live' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span>{sourceLabel}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDistricts.map((d) => {
              const status = getRainStatus(d.today_rain_mm);
              const isExpanded = expandedDistrict === d.district;
              const hasMultipleStations = d.stations.length > 1;

              return (
                <div
                  key={d.district}
                  className="rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 p-5 transition-all shadow-lg flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Row: District & Zone */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                          <h3 className="font-bold text-white text-base tracking-wide group-hover:text-cyan-300 transition-colors">
                            {d.district}
                          </h3>
                        </div>
                        <span className="text-[11px] text-slate-400 ml-5.5 block">
                          {d.zone} • {d.stations.length} {d.stations.length > 1 ? 'stations' : 'station'}
                        </span>
                      </div>

                      {/* Rain Status Badge */}
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${status.badgeClass} shrink-0`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Rain Amount Display */}
                    <div className="my-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-1.5 mb-0.5">
                          <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                            Today's Live Rainfall
                          </span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/10 text-cyan-300 font-mono">
                            {dates.todaySlash}
                          </span>
                        </div>
                        <div className="flex items-baseline space-x-1.5">
                          <span className="text-3xl font-extrabold text-white">
                            {d.today_rain_mm}
                          </span>
                          <span className="text-xs font-semibold text-cyan-400">mm</span>
                        </div>
                      </div>

                      {/* 24h Delta vs Yesterday */}
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">
                          vs Yesterday
                        </span>
                        <div className={`text-xs font-bold inline-flex items-center px-2 py-0.5 rounded-md ${
                          d.delta_mm > 0 ? 'bg-emerald-500/20 text-emerald-300' :
                          d.delta_mm < 0 ? 'bg-sky-500/20 text-sky-300' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {d.delta_mm > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> :
                           d.delta_mm < 0 ? <TrendingDown className="w-3 h-3 mr-1" /> :
                           <Minus className="w-3 h-3 mr-1" />}
                          {d.delta_mm > 0 ? `+${d.delta_mm}` : d.delta_mm} mm
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          ({d.pct_change > 0 ? `+${d.pct_change}` : d.pct_change}%)
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar of rainfall intensity */}
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mb-3">
                      <div 
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(100, Math.max(3, (d.today_rain_mm / maxRainIsland) * 100))}%`,
                          backgroundColor: status.dotColor
                        }}
                      />
                    </div>

                    {/* Real-time Current Telemetry */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-1 pb-2">
                      <div className="flex items-center space-x-1.5">
                        <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                        <span>Current: <strong className="text-white">{d.today_temp_mean}°C</strong></span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Wind className="w-3.5 h-3.5 text-sky-400" />
                        <span>Wind: <strong className="text-white">{d.today_wind_max} km/h</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Sub-stations Breakdown (Expandable if multiple) */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80">
                    {hasMultipleStations ? (
                      <div>
                        <button
                          onClick={() => toggleExpand(d.district)}
                          className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-cyan-400 transition-colors py-1"
                        >
                          <span>Station Breakdown ({d.stations.length})</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {isExpanded && (
                          <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {d.stations.map((st) => (
                              <div
                                key={st.station}
                                onClick={() => onSelectStationForPrediction && onSelectStationForPrediction(st.station)}
                                className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 cursor-pointer text-xs transition-all"
                              >
                                <div className="flex items-center space-x-1.5">
                                  <Sparkles className="w-3 h-3 text-cyan-400" />
                                  <span className="text-slate-200 font-medium">{st.station}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold text-cyan-300">{st.today_rain} mm</span>
                                  <span className="text-[10px] text-slate-500">({st.today_temp}°C)</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => onSelectStationForPrediction && onSelectStationForPrediction(d.stations[0].station)}
                        className="w-full py-2 px-3 rounded-xl bg-slate-800/60 hover:bg-cyan-500/20 hover:border-cyan-500/40 border border-slate-700/60 text-xs text-slate-300 hover:text-cyan-300 font-semibold flex items-center justify-center space-x-1.5 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Predict for {d.stations[0].station}</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. YESTERDAY'S RAINFALL VIEW */}
      {/* ========================================================================= */}
      {!loading && activeTab === 'yesterday' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-400 px-1">
            <span className="font-semibold text-slate-200">
              Showing {filteredDistricts.length} Districts • Actual Previous Date: <strong className="text-sky-400">{dates.yesterdaySlash}</strong> ({dates.yesterdayFormatted})
            </span>
            <span className="text-[11px] text-slate-400">Preceding 24-Hour Cycle Records</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDistricts.map((d) => {
              const status = getRainStatus(d.yesterday_rain_mm);
              const isExpanded = expandedDistrict === d.district;
              const hasMultipleStations = d.stations.length > 1;

              return (
                <div
                  key={d.district}
                  className="rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/40 p-5 transition-all shadow-lg flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Row: District & Zone */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                          <h3 className="font-bold text-white text-base tracking-wide group-hover:text-sky-300 transition-colors">
                            {d.district}
                          </h3>
                        </div>
                        <span className="text-[11px] text-slate-400 ml-5.5 block">
                          {d.zone} • {d.stations.length} {d.stations.length > 1 ? 'stations' : 'station'}
                        </span>
                      </div>

                      {/* Rain Status Badge */}
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${status.badgeClass} shrink-0`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Rain Amount Display */}
                    <div className="my-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-1.5 mb-0.5">
                          <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                            Yesterday's Rainfall
                          </span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-sky-500/10 text-sky-300 font-mono">
                            {dates.yesterdaySlash}
                          </span>
                        </div>
                        <div className="flex items-baseline space-x-1.5">
                          <span className="text-3xl font-extrabold text-white">
                            {d.yesterday_rain_mm}
                          </span>
                          <span className="text-xs font-semibold text-sky-400">mm</span>
                        </div>
                      </div>

                      <div className="text-right text-xs text-slate-400">
                        <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-0.5">
                          Cycle
                        </span>
                        <span className="font-mono text-slate-300">{dates.yesterdaySlash}</span>
                      </div>
                    </div>

                    {/* Progress Bar of rainfall intensity */}
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mb-3">
                      <div 
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(100, Math.max(3, (d.yesterday_rain_mm / maxRainIsland) * 100))}%`,
                          backgroundColor: status.dotColor
                        }}
                      />
                    </div>

                    {/* Telemetry */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-1 pb-2">
                      <div className="flex items-center space-x-1.5">
                        <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                        <span>Temp: <strong className="text-white">{d.today_temp_mean}°C</strong></span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Wind className="w-3.5 h-3.5 text-sky-400" />
                        <span>Wind: <strong className="text-white">{d.today_wind_max} km/h</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Sub-stations Breakdown */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80">
                    {hasMultipleStations ? (
                      <div>
                        <button
                          onClick={() => toggleExpand(d.district)}
                          className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-sky-400 transition-colors py-1"
                        >
                          <span>Station Breakdown ({d.stations.length})</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {isExpanded && (
                          <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {d.stations.map((st) => (
                              <div
                                key={st.station}
                                onClick={() => onSelectStationForPrediction && onSelectStationForPrediction(st.station)}
                                className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40 cursor-pointer text-xs transition-all"
                              >
                                <div className="flex items-center space-x-1.5">
                                  <Sparkles className="w-3 h-3 text-sky-400" />
                                  <span className="text-slate-200 font-medium">{st.station}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold text-sky-300">{st.yesterday_rain} mm</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => onSelectStationForPrediction && onSelectStationForPrediction(d.stations[0].station)}
                        className="w-full py-2 px-3 rounded-xl bg-slate-800/60 hover:bg-sky-500/20 hover:border-sky-500/40 border border-slate-700/60 text-xs text-slate-300 hover:text-sky-300 font-semibold flex items-center justify-center space-x-1.5 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                        <span>Predict for {d.stations[0].station}</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TODAY VS YESTERDAY COMPARISON VIEW */}
      {/* ========================================================================= */}
      {!loading && activeTab === 'comparison' && (
        <div className="space-y-4">
          
          {/* Comparison Info Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-cyan-400 shadow-sm shadow-cyan-500/50" />
                <span className="text-slate-200 font-medium">Today ({dates.todaySlash})</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-indigo-500 shadow-sm shadow-indigo-500/50" />
                <span className="text-slate-200 font-medium">Yesterday ({dates.yesterdaySlash})</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
              <span>Metrics: <strong>Difference ($\Delta$ mm)</strong> &amp; <strong>Percentage Change (%)</strong></span>
            </div>
          </div>

          {comparisonLayout === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDistricts.map((d) => {
                return (
                  <div
                    key={d.district}
                    className="rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 p-5 transition-all shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      {/* Top District Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <MapPin className="w-4 h-4 text-cyan-400" />
                            <h3 className="font-bold text-white text-base">{d.district}</h3>
                          </div>
                          <span className="text-[11px] text-slate-400 ml-5.5">{d.zone}</span>
                        </div>

                        {/* Delta & Percentage Badges */}
                        <div className="flex flex-col items-end gap-1">
                          <div className={`text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center space-x-1 ${
                            d.delta_mm > 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                            d.delta_mm < 0 ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' :
                            'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {d.delta_mm > 0 ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> :
                             d.delta_mm < 0 ? <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> :
                             <Minus className="w-3.5 h-3.5 mr-0.5" />}
                            <span>{d.delta_mm > 0 ? `+${d.delta_mm}` : d.delta_mm} mm</span>
                          </div>
                          <span className={`text-[10px] font-bold ${
                            d.pct_change > 0 ? 'text-emerald-400' : d.pct_change < 0 ? 'text-sky-400' : 'text-slate-400'
                          }`}>
                            {d.pct_change > 0 ? `+${d.pct_change}` : d.pct_change}% change
                          </span>
                        </div>
                      </div>

                      {/* Comparative Dual Values */}
                      <div className="space-y-3 my-3">
                        
                        {/* Today Bar */}
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-cyan-400 font-semibold flex items-center space-x-1">
                              <span>Today ({dates.todaySlash})</span>
                            </span>
                            <span className="font-bold text-white">{d.today_rain_mm} mm</span>
                          </div>
                          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700"
                              style={{ width: `${Math.min(100, Math.max(3, (d.today_rain_mm / maxRainIsland) * 100))}%` }}
                            />
                          </div>
                        </div>

                        {/* Yesterday Bar */}
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-indigo-400 font-semibold flex items-center space-x-1">
                              <span>Yesterday ({dates.yesterdaySlash})</span>
                            </span>
                            <span className="font-bold text-slate-300">{d.yesterday_rain_mm} mm</span>
                          </div>
                          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-600 transition-all duration-700"
                              style={{ width: `${Math.min(100, Math.max(3, (d.yesterday_rain_mm / maxRainIsland) * 100))}%` }}
                            />
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Quick Station Forecast Button */}
                    <div className="mt-3 pt-3 border-t border-slate-800/80">
                      <button
                        onClick={() => onSelectStationForPrediction && onSelectStationForPrediction(d.stations[0].station)}
                        className="w-full py-2 px-3 rounded-xl bg-slate-800/60 hover:bg-cyan-500/20 hover:border-cyan-500/40 border border-slate-700/60 text-xs text-slate-300 hover:text-cyan-300 font-semibold flex items-center justify-center space-x-1.5 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Predict for {d.stations[0].station}</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            /* Comparison Table View */
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                    <th className="p-3.5 font-semibold">District</th>
                    <th className="p-3.5 font-semibold">Zone</th>
                    <th className="p-3.5 font-semibold text-cyan-400">Today ({dates.todaySlash})</th>
                    <th className="p-3.5 font-semibold text-indigo-400">Yesterday ({dates.yesterdaySlash})</th>
                    <th className="p-3.5 font-semibold">Difference ($\Delta$ mm)</th>
                    <th className="p-3.5 font-semibold">% Change</th>
                    <th className="p-3.5 font-semibold">Status Today</th>
                    <th className="p-3.5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                  {filteredDistricts.map((d) => {
                    const status = getRainStatus(d.today_rain_mm);
                    return (
                      <tr key={d.district} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-bold text-white flex items-center space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{d.district}</span>
                        </td>
                        <td className="p-3.5 text-slate-300">{d.zone}</td>
                        <td className="p-3.5 font-extrabold text-cyan-300 text-sm">
                          {d.today_rain_mm} mm
                        </td>
                        <td className="p-3.5 font-semibold text-slate-300">
                          {d.yesterday_rain_mm} mm
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded font-bold ${
                            d.delta_mm > 0 ? 'bg-emerald-500/20 text-emerald-300' :
                            d.delta_mm < 0 ? 'bg-sky-500/20 text-sky-300' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {d.delta_mm > 0 ? `+${d.delta_mm}` : d.delta_mm} mm
                          </span>
                        </td>
                        <td className="p-3.5 font-bold">
                          <span className={d.pct_change > 0 ? 'text-emerald-400' : d.pct_change < 0 ? 'text-sky-400' : 'text-slate-400'}>
                            {d.pct_change > 0 ? `+${d.pct_change}` : d.pct_change}%
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${status.badgeClass}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => onSelectStationForPrediction && onSelectStationForPrediction(d.stations[0].station)}
                            className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[11px] font-semibold transition-all"
                          >
                            Predict
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
