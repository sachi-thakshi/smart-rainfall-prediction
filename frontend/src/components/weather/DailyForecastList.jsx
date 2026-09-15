import { useEffect, useState } from "react";
import { fetch7DayForecast } from "../../services/api.js";
import { resolveCondition } from "../../utils/weatherCondition.js";
import { Droplets, Wind } from "lucide-react";

export default function DailyForecastList({ city }) {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!city) return;
    let cancelled = false;
    setLoading(true);

    fetch7DayForecast(city)
      .then((res) => {
        if (!cancelled) setDays(res.forecast || []);
      })
      .catch((err) => console.error("Failed to load 7-day forecast:", err))
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [city]);

  if (!city) return null;

  return (
    <div className="relative z-10 mx-auto w-full max-w-5xl animate-fadeIn">
      <h3 className="mb-3 px-1 text-left text-sm font-bold uppercase tracking-wide text-white/80 md:text-center">
        7-Day Extended Forecast
      </h3>

      <div className="relative">
        {/* Edge fades hint that the row scrolls */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-linear-to-r from-(--sky-from) to-transparent md:hidden" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-linear-to-l from-(--sky-to) to-transparent md:hidden" />

        {loading && (
          <div className="flex w-full justify-start gap-3 overflow-hidden px-1 md:justify-center">
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <div
                key={n}
                className="h-44 w-27.5 min-w-27.5 shrink-0 animate-pulse rounded-2xl bg-white/10"
              />
            ))}
          </div>
        )}

        {!loading && days.length === 0 && (
          <div className="w-full px-2 text-center text-sm text-white/60">No forecast data available.</div>
        )}

        {!loading && days.length > 0 && (
          <div className="no-scrollbar flex w-full snap-x justify-start gap-3 overflow-x-auto px-1 pb-2 md:justify-center">
            {days.map((d, i) => {
              const date = new Date(d.date);
              const dayLabel = i === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" });
              const dateLabel = date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" });
              const { icon } = resolveCondition(d.weather_condition);

              return (
                <div
                  key={d.date}
                  className={`flex h-44 w-27.5 min-w-27.5 shrink-0 snap-center flex-col items-center justify-between rounded-2xl border px-3 py-3.5 transition-all ${
                    i === 0
                      ? "border-white/40 bg-white/15"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-white/85">
                      {dayLabel}
                    </span>
                    <span className="text-[10px] text-white/50">{dateLabel}</span>
                  </div>

                  <span className="text-3xl drop-shadow-sm" aria-hidden="true">{icon}</span>

                  <div className="flex items-center gap-1.5 text-sm font-bold text-white">
                    <span>{Math.round(d.temp_max)}°</span>
                    <span className="font-medium text-white/45">{Math.round(d.temp_min)}°</span>
                  </div>

                  <div className="flex w-full flex-col gap-1 border-t border-white/10 pt-2 text-[10px] text-white/65">
                    <span className="flex items-center gap-1">
                      <Droplets className="h-3 w-3 text-sky-300" /> {d.rain_sum} mm
                    </span>
                    <span className="flex items-center gap-1">
                      <Wind className="h-3 w-3 text-slate-300" /> {d.windspeed_10m_max} km/h
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}