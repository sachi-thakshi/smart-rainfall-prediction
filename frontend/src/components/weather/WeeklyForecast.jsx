import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { CalendarDays, CloudRain, Thermometer } from 'lucide-react';
import { fetch7DayForecast } from '../../services/api';

export default function WeeklyForecast({ city }) {
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!city) return;
    setLoading(true);
    fetch7DayForecast(city)
      .then(res => {
        const formatted = res.forecast.map(d => ({
          ...d,
          dayName: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
          temp_avg: parseFloat(((d.temp_max + d.temp_min) / 2).toFixed(1))
        }));
        setForecastData(formatted);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load forecast:", err);
        setLoading(false);
      });
  }, [city]);

  if (!city || loading) return (
    <div className="glass-panel rounded-2xl p-5 border border-white/20 mt-4 animate-pulse flex items-center justify-center h-75">
      <span className="text-white/70 font-semibold text-sm">Loading 7-Day Forecast...</span>
    </div>
  );

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/20 mt-4 animate-fadeIn shadow-xl">
      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-cyan-400" />
            7-Day Extended Forecast
          </h3>
          <p className="text-xs text-white/60 mt-0.5">Precipitation & Temperature trends for {city}</p>
        </div>
      </div>

      <div className="h-62.5 w-full mt-2 text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={forecastData} margin={{ top: 10, right: -10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" vertical={false} />
            <XAxis dataKey="dayName" stroke="#94a3b8" />
            
            <YAxis yAxisId="left" stroke="#38bdf8" tickFormatter={(val) => `${val}mm`} />
            
            <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" domain={['dataMin - 2', 'dataMax + 2']} tickFormatter={(val) => `${val}°C`} />
            
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff' }}
              itemStyle={{ fontWeight: 'bold' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }}/>

            <Bar yAxisId="left" dataKey="rain_sum" name="Rainfall (mm)" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={30} />
            
            <Line yAxisId="right" type="monotone" dataKey="temp_avg" name="Avg Temp (°C)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: "#f59e0b" }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}