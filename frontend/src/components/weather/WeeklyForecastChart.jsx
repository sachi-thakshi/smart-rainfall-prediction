import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { Activity } from 'lucide-react';
import { fetch7DayForecast } from '../../services/api';

// Reads a CSS custom property at render time so the chart always matches
// whatever the design tokens currently say — no color ever hardcoded here.
function cssVar(name, fallback) {
  if (typeof window === 'undefined') return fallback;
  const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return val || fallback;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-dark min-w-42.5 rounded-xl p-3.5 text-xs shadow-2xl">
        <p className="mb-2 flex justify-between border-b border-white/10 pb-1.5 text-sm font-bold text-white">
          <span>{label}</span>
          <span className="text-[10px] text-white/50">{data.date}</span>
        </p>
        <div className="space-y-1.5">
          <Row label="Max Temp" value={`${data.temp_max}°C`} color="var(--chart-temp)" />
          <Row label="Feels Like" value={`${data.feels_like}°C`} color="var(--chart-feels)" />
          <Row label="Rainfall" value={`${data.rain_sum} mm`} color="var(--chart-rain)" />
          <Row label="Rainy Hours" value={`${data.precip_hours} h`} color="var(--chart-precip-hours)" />
          <Row label="Wind Speed" value={`${data.windspeed_10m_max} km/h`} color="var(--chart-wind)" />
          <Row label="UV Index" value={data.uv_index} color="var(--chart-uv)" />
        </div>
      </div>
    );
  }
  return null;
};

function Row({ label, value, color }) {
  return (
    <p className="flex justify-between font-medium" style={{ color }}>
      <span>{label}:</span> <span>{value}</span>
    </p>
  );
}

export default function WeeklyForecastChart({ city }) {
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!city) return;
    let cancelled = false;
    setLoading(true);

    fetch7DayForecast(city)
      .then(res => {
        if (!cancelled) {
          const formatted = res.forecast.map((d, i) => {
            const dateObj = new Date(d.date);
            return {
              ...d,
              dayName: i === 0 ? "TDY" : i === 1 ? "TMR" : dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
            };
          });
          setForecastData(formatted);
        }
      })
      .catch(err => console.error("Failed to load chart data:", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [city]);

  if (!city) return null;

  return (
    <div className="relative z-10 mx-auto mt-6 w-full max-w-5xl animate-fadeIn">

      {loading ? (
        <div className="glass-dark flex h-70 w-full items-center justify-center rounded-2xl animate-pulse">
          <span className="text-sm font-semibold text-white/60">Generating Analytics...</span>
        </div>
      ) : (
        <div className="glass-dark rounded-2xl p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                <Activity className="h-5 w-5" style={{ color: "var(--chart-rain)" }} />
                7-Day Meteorological Trends
              </h3>
              <p className="mt-0.5 text-[11px] uppercase tracking-wide text-white/60">
                Temperature, Precipitation & Wind Analytics for {city}
              </p>
            </div>
          </div>

          <div className="mt-2 h-62.5 w-full text-[11px] sm:text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecastData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={cssVar('--chart-grid', 'rgba(255,255,255,0.08)')} vertical={false} />
                <XAxis
                  dataKey="dayName"
                  stroke={cssVar('--chart-axis', '#cbd5e1')}
                  tick={{ fill: cssVar('--chart-axis', '#cbd5e1') }}
                  tickLine={false}
                />

                <YAxis
                  yAxisId="left"
                  stroke={cssVar('--chart-rain', '#38bdf8')}
                  tick={{ fill: cssVar('--chart-rain', '#38bdf8') }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}mm`}
                />

                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke={cssVar('--chart-temp', '#f8b84e')}
                  domain={['dataMin - 2', 'dataMax + 2']}
                  tick={{ fill: cssVar('--chart-temp', '#f8b84e') }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}°`}
                />

                <Tooltip content={<CustomTooltip />} cursor={{ fill: cssVar('--chart-cursor', 'rgba(255,255,255,0.06)') }} />

                <Legend wrapperStyle={{ paddingTop: '15px', color: cssVar('--chart-axis', '#cbd5e1') }} />

                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="feels_like"
                  name="Feels Like (°C)"
                  fill={cssVar('--chart-temp', '#f8b84e')}
                  stroke="none"
                  fillOpacity={0.15}
                />

                <Bar
                  yAxisId="left"
                  dataKey="rain_sum"
                  name="Rainfall (mm)"
                  fill={cssVar('--chart-rain', '#38bdf8')}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />

                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="temp_max"
                  name="Max Temp (°C)"
                  stroke={cssVar('--chart-temp', '#f8b84e')}
                  strokeWidth={3}
                  dot={{ r: 4, fill: cssVar('--color-surface', '#fbf9f4'), stroke: cssVar('--chart-temp', '#f8b84e'), strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}