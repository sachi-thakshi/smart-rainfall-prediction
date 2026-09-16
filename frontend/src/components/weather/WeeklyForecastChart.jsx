// import React, { useEffect, useState } from 'react';
// import {
//   ResponsiveContainer,
//   ComposedChart,
//   Bar,
//   Line,
//   Area,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   Legend
// } from 'recharts';
// import { Activity } from 'lucide-react';
// import { fetch7DayForecast } from '../../services/api';

// // Reads a CSS custom property at render time so the chart always matches
// // whatever the design tokens currently say — no color ever hardcoded here.
// function cssVar(name, fallback) {
//   if (typeof window === 'undefined') return fallback;
//   const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
//   return val || fallback;
// }

// const CustomTooltip = ({ active, payload, label }) => {
//   if (active && payload && payload.length) {
//     const data = payload[0].payload;
//     return (
//       <div className="glass-dark min-w-42.5 rounded-xl p-3.5 text-xs shadow-2xl">
//         <p className="mb-2 flex justify-between border-b border-white/10 pb-1.5 text-sm font-bold text-white">
//           <span>{label}</span>
//           <span className="text-[10px] text-white/50">{data.date}</span>
//         </p>
//         <div className="space-y-1.5">
//           <Row label="Max Temp" value={`${data.temp_max}°C`} color="var(--chart-temp)" />
//           <Row label="Feels Like" value={`${data.feels_like}°C`} color="var(--chart-feels)" />
//           <Row label="Rainfall" value={`${data.rain_sum} mm`} color="var(--chart-rain)" />
//           <Row label="Rainy Hours" value={`${data.precip_hours} h`} color="var(--chart-precip-hours)" />
//           <Row label="Wind Speed" value={`${data.windspeed_10m_max} km/h`} color="var(--chart-wind)" />
//           <Row label="UV Index" value={data.uv_index} color="var(--chart-uv)" />
//         </div>
//       </div>
//     );
//   }
//   return null;
// };

// function Row({ label, value, color }) {
//   return (
//     <p className="flex justify-between font-medium" style={{ color }}>
//       <span>{label}:</span> <span>{value}</span>
//     </p>
//   );
// }

// export default function WeeklyForecastChart({ city }) {
//   const [forecastData, setForecastData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!city) return;
//     let cancelled = false;
//     setLoading(true);

//     fetch7DayForecast(city)
//       .then(res => {
//         if (!cancelled) {
//           const formatted = res.forecast.map((d, i) => {
//             const dateObj = new Date(d.date);
//             return {
//               ...d,
//               dayName: i === 0 ? "TDY" : i === 1 ? "TMR" : dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
//             };
//           });
//           setForecastData(formatted);
//         }
//       })
//       .catch(err => console.error("Failed to load chart data:", err))
//       .finally(() => {
//         if (!cancelled) setLoading(false);
//       });

//     return () => { cancelled = true; };
//   }, [city]);

//   if (!city) return null;

//   return (
//     <div className="relative z-10 mx-auto mt-6 w-full max-w-5xl animate-fadeIn">

//       {loading ? (
//         <div className="glass-dark flex h-70 w-full items-center justify-center rounded-2xl animate-pulse">
//           <span className="text-sm font-semibold text-white/60">Generating Analytics...</span>
//         </div>
//       ) : (
//         <div className="glass-dark rounded-2xl p-4 sm:p-6">
//           <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
//             <div>
//               <h3 className="flex items-center gap-2 text-lg font-bold text-white">
//                 <Activity className="h-5 w-5" style={{ color: "var(--chart-rain)" }} />
//                 7-Day Meteorological Trends
//               </h3>
//               <p className="mt-0.5 text-[11px] uppercase tracking-wide text-white/60">
//                 Temperature, Precipitation & Wind Analytics for {city}
//               </p>
//             </div>
//           </div>

//           <div className="mt-2 h-62.5 w-full text-[11px] sm:text-xs">
//             <ResponsiveContainer width="100%" height="100%">
//               <ComposedChart data={forecastData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
//                 <CartesianGrid strokeDasharray="3 3" stroke={cssVar('--chart-grid', 'rgba(255,255,255,0.08)')} vertical={false} />
//                 <XAxis
//                   dataKey="dayName"
//                   stroke={cssVar('--chart-axis', '#cbd5e1')}
//                   tick={{ fill: cssVar('--chart-axis', '#cbd5e1') }}
//                   tickLine={false}
//                 />

//                 <YAxis
//                   yAxisId="left"
//                   stroke={cssVar('--chart-rain', '#38bdf8')}
//                   tick={{ fill: cssVar('--chart-rain', '#38bdf8') }}
//                   tickLine={false}
//                   axisLine={false}
//                   tickFormatter={(val) => `${val}mm`}
//                 />

//                 <YAxis
//                   yAxisId="right"
//                   orientation="right"
//                   stroke={cssVar('--chart-temp', '#f8b84e')}
//                   domain={['dataMin - 2', 'dataMax + 2']}
//                   tick={{ fill: cssVar('--chart-temp', '#f8b84e') }}
//                   tickLine={false}
//                   axisLine={false}
//                   tickFormatter={(val) => `${val}°`}
//                 />

//                 <Tooltip content={<CustomTooltip />} cursor={{ fill: cssVar('--chart-cursor', 'rgba(255,255,255,0.06)') }} />

//                 <Legend wrapperStyle={{ paddingTop: '15px', color: cssVar('--chart-axis', '#cbd5e1') }} />

//                 <Area
//                   yAxisId="right"
//                   type="monotone"
//                   dataKey="feels_like"
//                   name="Feels Like (°C)"
//                   fill={cssVar('--chart-temp', '#f8b84e')}
//                   stroke="none"
//                   fillOpacity={0.15}
//                 />

//                 <Bar
//                   yAxisId="left"
//                   dataKey="rain_sum"
//                   name="Rainfall (mm)"
//                   fill={cssVar('--chart-rain', '#38bdf8')}
//                   radius={[4, 4, 0, 0]}
//                   maxBarSize={40}
//                 />

//                 <Line
//                   yAxisId="right"
//                   type="monotone"
//                   dataKey="temp_max"
//                   name="Max Temp (°C)"
//                   stroke={cssVar('--chart-temp', '#f8b84e')}
//                   strokeWidth={3}
//                   dot={{ r: 4, fill: cssVar('--color-surface', '#fbf9f4'), stroke: cssVar('--chart-temp', '#f8b84e'), strokeWidth: 2 }}
//                   activeDot={{ r: 6 }}
//                 />
//               </ComposedChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, ComposedChart, Bar, Line, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Activity, CloudRain, Droplets, ThermometerSun, Wind } from "lucide-react";
import { fetch7DayForecast } from "../../services/api";
import AnimatedContent from "../reactbits/AnimatedContent.jsx";
import CountUp from "../reactbits/CountUp.jsx";

function cssVar(name, fallback) {
  if (typeof window === "undefined") return fallback;

  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  return value || fallback;
}

function TooltipRow({ label, value, color }) {
  return (
    <div className="flex items-center justify-between gap-8">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-[11px] font-medium text-slate-500">{label}</span>
      </div>

      <span className="text-[11px] font-bold text-slate-900">{value}</span>
    </div>
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const data = payload[0]?.payload;

  if (!data) return null;

  return (
    <div className="min-w-[220px] rounded-[20px] border border-slate-200/80 bg-white/95 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur-2xl">
      <div className="mb-3 flex items-start justify-between gap-6 border-b border-slate-100 pb-3">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">Forecast Day</p>
          <p className="mt-1 text-sm font-bold text-slate-950">{data.fullDayName}</p>
        </div>

        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold text-slate-500">{data.dateLabel}</span>
      </div>

      <div className="space-y-2.5">
        <TooltipRow label="Max Temperature" value={`${Number(data.temp_max || 0).toFixed(1)}°C`} color={cssVar("--chart-temp", "#f8b84e")} />
        <TooltipRow label="Feels Like" value={`${Number(data.feels_like || 0).toFixed(1)}°C`} color={cssVar("--chart-feels", "#fb923c")} />
        <TooltipRow label="Rainfall" value={`${Number(data.rain_sum || 0).toFixed(1)} mm`} color={cssVar("--chart-rain", "#38bdf8")} />
        <TooltipRow label="Rainy Hours" value={`${Number(data.precip_hours || 0).toFixed(1)} h`} color={cssVar("--chart-precip-hours", "#818cf8")} />
        <TooltipRow label="Wind Speed" value={`${Number(data.windspeed_10m_max || 0).toFixed(0)} km/h`} color={cssVar("--chart-wind", "#94a3b8")} />
        <TooltipRow label="UV Index" value={Number(data.uv_index || 0).toFixed(1)} color={cssVar("--chart-uv", "#f59e0b")} />
      </div>
    </div>
  );
}

function MetricButton({ active, icon, label, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.1em] transition-all duration-300 ${active ? "border-sky-200 bg-sky-50 text-sky-700 shadow-sm" : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-700"}`}>
      {icon}
      {label}
    </button>
  );
}

function SummaryCard({ icon, label, children, description, delay = 0 }) {
  return (
    <AnimatedContent distance={25} direction="vertical" duration={0.65} delay={delay} ease="power3.out" initialOpacity={0}>
      <div className="group relative overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/70 p-4 transition-all duration-500 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_40px_rgba(15,23,42,0.07)]">
        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-sky-300/10 blur-3xl transition-transform duration-500 group-hover:scale-125" />

        <div className="relative z-10">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">{icon}</div>
            <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-slate-300">7 Days</span>
          </div>

          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>

          <div className="mt-1.5 flex items-baseline text-2xl font-black tracking-[-0.05em] text-slate-950">{children}</div>

          <p className="mt-1.5 text-[10px] leading-4 text-slate-400">{description}</p>
        </div>
      </div>
    </AnimatedContent>
  );
}

export default function WeeklyForecastChart({ city }) {
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("overview");

  useEffect(() => {
    if (!city) {
      setForecastData([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError("");

    fetch7DayForecast(city)
      .then((res) => {
        if (cancelled) return;

        const formatted = (res.forecast || []).map((day, index) => {
          const date = new Date(day.date);

          return {
            ...day,
            dayName: index === 0 ? "TDY" : index === 1 ? "TMR" : date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
            fullDayName: index === 0 ? "Today" : index === 1 ? "Tomorrow" : date.toLocaleDateString("en-US", { weekday: "long" }),
            dateLabel: date.toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
            temp_max: Number(day.temp_max) || 0,
            feels_like: Number(day.feels_like) || 0,
            rain_sum: Number(day.rain_sum) || 0,
            precip_hours: Number(day.precip_hours) || 0,
            windspeed_10m_max: Number(day.windspeed_10m_max) || 0,
            uv_index: Number(day.uv_index) || 0,
          };
        });

        setForecastData(formatted);
      })
      .catch((err) => {
        console.error("Failed to load chart data:", err);

        if (!cancelled) {
          setForecastData([]);
          setError("Unable to load weekly forecast analytics.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [city]);

  const summary = useMemo(() => {
    if (!forecastData.length) {
      return {
        rainfall: 0,
        hottest: 0,
        wind: 0,
        rainyHours: 0,
      };
    }

    return {
      rainfall: forecastData.reduce((total, day) => total + day.rain_sum, 0),
      hottest: Math.max(...forecastData.map((day) => day.temp_max)),
      wind: Math.max(...forecastData.map((day) => day.windspeed_10m_max)),
      rainyHours: forecastData.reduce((total, day) => total + day.precip_hours, 0),
    };
  }, [forecastData]);

  if (!city) return null;

  if (loading) {
    return (
      <div className="relative flex min-h-[500px] w-full items-center justify-center overflow-hidden rounded-[34px] border border-slate-200/70 bg-slate-50">
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-200/30 blur-[100px]" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full border border-sky-300/30" />
            <div className="absolute inset-3 animate-pulse rounded-full bg-sky-200/40 blur-xl" />
            <Activity className="relative h-7 w-7 animate-pulse text-sky-500" />
          </div>

          <p className="mt-3 text-sm font-bold text-slate-700">Building weather analytics</p>
          <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">Processing seven day forecast</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-[32px] border border-rose-100 bg-rose-50/50 px-6 text-center">
        <div>
          <CloudRain className="mx-auto h-9 w-9 text-rose-400" />
          <p className="mt-4 text-sm font-bold text-slate-900">Forecast analytics unavailable</p>
          <p className="mt-2 text-xs text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!forecastData.length) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-[32px] border border-slate-200 bg-slate-50 px-6 text-center">
        <div>
          <Activity className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-4 text-sm font-bold text-slate-900">No forecast analytics</p>
          <p className="mt-1 text-xs text-slate-400">No seven-day forecast is currently available for {city}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 mx-auto w-full">
      <AnimatedContent distance={30} direction="vertical" duration={0.7} ease="power3.out" initialOpacity={0}>
        <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
              </span>

              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-sky-600">Meteorological Intelligence</span>
            </div>

            <h3 className="text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-3xl">Seven-day weather trend</h3>

            <p className="mt-2 text-xs leading-5 text-slate-400">Temperature, rainfall and atmospheric activity forecast for <span className="font-bold text-slate-600">{city}</span>.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <MetricButton active={view === "overview"} label="Overview" icon={<Activity className="h-3.5 w-3.5" />} onClick={() => setView("overview")} />
            <MetricButton active={view === "temperature"} label="Temperature" icon={<ThermometerSun className="h-3.5 w-3.5" />} onClick={() => setView("temperature")} />
            <MetricButton active={view === "rain"} label="Rainfall" icon={<Droplets className="h-3.5 w-3.5" />} onClick={() => setView("rain")} />
          </div>
        </div>
      </AnimatedContent>

      <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <SummaryCard icon={<Droplets className="h-4 w-4 text-sky-500" />} label="Total Rainfall" description="Accumulated predicted rainfall" delay={0.05}>
          <CountUp from={0} to={summary.rainfall} duration={1.3} decimals={1} />
          <span className="ml-1.5 text-xs font-bold tracking-normal text-slate-400">mm</span>
        </SummaryCard>

        <SummaryCard icon={<ThermometerSun className="h-4 w-4 text-amber-500" />} label="Peak Temperature" description="Highest predicted temperature" delay={0.1}>
          <CountUp from={0} to={summary.hottest} duration={1.4} decimals={1} />
          <span className="ml-1 text-xs font-bold tracking-normal text-slate-400">°C</span>
        </SummaryCard>

        <SummaryCard icon={<Wind className="h-4 w-4 text-slate-500" />} label="Maximum Wind" description="Highest predicted wind velocity" delay={0.15}>
          <CountUp from={0} to={summary.wind} duration={1.5} decimals={0} />
          <span className="ml-1.5 text-xs font-bold tracking-normal text-slate-400">km/h</span>
        </SummaryCard>

        <SummaryCard icon={<CloudRain className="h-4 w-4 text-indigo-500" />} label="Rainy Hours" description="Total precipitation hours" delay={0.2}>
          <CountUp from={0} to={summary.rainyHours} duration={1.6} decimals={1} />
          <span className="ml-1.5 text-xs font-bold tracking-normal text-slate-400">h</span>
        </SummaryCard>
      </div>

      <AnimatedContent distance={40} direction="vertical" duration={0.8} delay={0.15} ease="power3.out" initialOpacity={0}>
        <div className="relative overflow-hidden rounded-[30px] border border-slate-200/70 bg-gradient-to-b from-white to-slate-50/80 p-3 shadow-[0_25px_70px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="pointer-events-none absolute -right-32 -top-32 h-[350px] w-[350px] rounded-full bg-sky-200/20 blur-[120px]" />

          <div className="relative z-10 mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">{view === "overview" ? "Combined Analysis" : view === "temperature" ? "Temperature Analysis" : "Precipitation Analysis"}</p>
              <p className="mt-1 text-sm font-bold text-slate-800">{view === "overview" ? "Temperature & rainfall relationship" : view === "temperature" ? "Maximum and perceived temperature" : "Rainfall volume and rainy hours"}</p>
            </div>

            <div className="hidden items-center gap-4 sm:flex">
              {(view === "overview" || view === "temperature") && (
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="text-[9px] font-semibold text-slate-400">Temperature</span>
                </div>
              )}

              {(view === "overview" || view === "rain") && (
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-sky-400" />
                  <span className="text-[9px] font-semibold text-slate-400">Rainfall</span>
                </div>
              )}

              {view === "temperature" && (
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-orange-300" />
                  <span className="text-[9px] font-semibold text-slate-400">Feels Like</span>
                </div>
              )}
            </div>
          </div>

          <div className="relative z-10 h-[340px] w-full sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecastData} margin={{ top: 20, right: 10, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="temperatureAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={cssVar("--chart-temp", "#f8b84e")} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={cssVar("--chart-temp", "#f8b84e")} stopOpacity={0.01} />
                  </linearGradient>

                  <linearGradient id="rainBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={cssVar("--chart-rain", "#38bdf8")} stopOpacity={1} />
                    <stop offset="100%" stopColor={cssVar("--chart-rain", "#38bdf8")} stopOpacity={0.35} />
                  </linearGradient>

                  <filter id="temperatureGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <CartesianGrid strokeDasharray="5 5" stroke={cssVar("--chart-grid", "rgba(148,163,184,0.16)")} vertical={false} />

                <XAxis dataKey="dayName" axisLine={false} tickLine={false} dy={10} tick={{ fill: cssVar("--chart-axis", "#94a3b8"), fontSize: 10, fontWeight: 700 }} />

                <YAxis yAxisId="rain" axisLine={false} tickLine={false} tick={{ fill: cssVar("--chart-rain", "#38bdf8"), fontSize: 9 }} tickFormatter={(value) => `${value}mm`} hide={view === "temperature"} />

                <YAxis yAxisId="temp" orientation="right" axisLine={false} tickLine={false} domain={["dataMin - 2", "dataMax + 2"]} tick={{ fill: cssVar("--chart-temp", "#f59e0b"), fontSize: 9 }} tickFormatter={(value) => `${Math.round(value)}°`} hide={view === "rain"} />

                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(148,163,184,0.25)", strokeWidth: 1, strokeDasharray: "4 4" }} />

                {(view === "overview" || view === "temperature") && (
                  <Area yAxisId="temp" type="monotone" dataKey="feels_like" fill="url(#temperatureAreaGradient)" stroke={view === "temperature" ? cssVar("--chart-feels", "#fb923c") : "none"} strokeWidth={view === "temperature" ? 1.5 : 0} fillOpacity={1} animationDuration={1200} animationEasing="ease-out" />
                )}

                {(view === "overview" || view === "rain") && (
                  <Bar yAxisId="rain" dataKey="rain_sum" fill="url(#rainBarGradient)" radius={[8, 8, 3, 3]} maxBarSize={44} animationDuration={1000} animationEasing="ease-out" />
                )}

                {(view === "overview" || view === "temperature") && (
                  <Line yAxisId="temp" type="monotone" dataKey="temp_max" stroke={cssVar("--chart-temp", "#f59e0b")} strokeWidth={3} filter="url(#temperatureGlow)" dot={{ r: 4, fill: "#ffffff", stroke: cssVar("--chart-temp", "#f59e0b"), strokeWidth: 2.5 }} activeDot={{ r: 6, fill: "#ffffff", stroke: cssVar("--chart-temp", "#f59e0b"), strokeWidth: 3 }} animationDuration={1400} animationEasing="ease-out" />
                )}

                {view === "rain" && (
                  <Line yAxisId="rain" type="monotone" dataKey="precip_hours" stroke={cssVar("--chart-precip-hours", "#818cf8")} strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3, fill: "#ffffff", stroke: cssVar("--chart-precip-hours", "#818cf8"), strokeWidth: 2 }} activeDot={{ r: 5 }} animationDuration={1200} animationEasing="ease-out" />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="relative z-10 mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="text-[9px] font-medium leading-4 text-slate-400">Move across the graph to inspect each forecast day in detail.</p>

            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>

              <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-slate-400">Forecast Model Active</span>
            </div>
          </div>
        </div>
      </AnimatedContent>
    </div>
  );
}