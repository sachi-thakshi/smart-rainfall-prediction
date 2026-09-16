// import { useEffect, useState } from "react";
// import { fetch7DayForecast } from "../../services/api.js";
// import { resolveCondition } from "../../utils/weatherCondition.js";
// import { Droplets, Wind } from "lucide-react";

// export default function DailyForecastList({ city }) {
//   const [days, setDays] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!city) return;
//     let cancelled = false;
//     setLoading(true);

//     fetch7DayForecast(city)
//       .then((res) => {
//         if (!cancelled) setDays(res.forecast || []);
//       })
//       .catch((err) => console.error("Failed to load 7-day forecast:", err))
//       .finally(() => !cancelled && setLoading(false));

//     return () => { cancelled = true; };
//   }, [city]);

//   if (!city) return null;

//   return (
//     <div className="relative z-10 mx-auto w-full max-w-5xl animate-fadeIn">
//       <h3 className="mb-3 px-1 text-left text-sm font-bold uppercase tracking-wide text-white/80 md:text-center">
//         7-Day Extended Forecast
//       </h3>

//       <div className="relative">
//         {/* Edge fades hint that the row scrolls */}
//         <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-linear-to-r from-(--sky-from) to-transparent md:hidden" />
//         <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-linear-to-l from-(--sky-to) to-transparent md:hidden" />

//         {loading && (
//           <div className="flex w-full justify-start gap-3 overflow-hidden px-1 md:justify-center">
//             {[1, 2, 3, 4, 5, 6, 7].map((n) => (
//               <div
//                 key={n}
//                 className="h-44 w-27.5 min-w-27.5 shrink-0 animate-pulse rounded-2xl bg-white/10"
//               />
//             ))}
//           </div>
//         )}

//         {!loading && days.length === 0 && (
//           <div className="w-full px-2 text-center text-sm text-white/60">No forecast data available.</div>
//         )}

//         {!loading && days.length > 0 && (
//           <div className="no-scrollbar flex w-full snap-x justify-start gap-3 overflow-x-auto px-1 pb-2 md:justify-center">
//             {days.map((d, i) => {
//               const date = new Date(d.date);
//               const dayLabel = i === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" });
//               const dateLabel = date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" });
//               const { icon } = resolveCondition(d.weather_condition);

//               return (
//                 <div
//                   key={d.date}
//                   className={`flex h-44 w-27.5 min-w-27.5 shrink-0 snap-center flex-col items-center justify-between rounded-2xl border px-3 py-3.5 transition-all ${
//                     i === 0
//                       ? "border-white/40 bg-white/15"
//                       : "border-white/10 bg-white/5 hover:bg-white/10"
//                   }`}
//                 >
//                   <div className="flex flex-col items-center gap-0.5">
//                     <span className="text-[11px] font-semibold uppercase tracking-wide text-white/85">
//                       {dayLabel}
//                     </span>
//                     <span className="text-[10px] text-white/50">{dateLabel}</span>
//                   </div>

//                   <span className="text-3xl drop-shadow-sm" aria-hidden="true">{icon}</span>

//                   <div className="flex items-center gap-1.5 text-sm font-bold text-white">
//                     <span>{Math.round(d.temp_max)}°</span>
//                     <span className="font-medium text-white/45">{Math.round(d.temp_min)}°</span>
//                   </div>

//                   <div className="flex w-full flex-col gap-1 border-t border-white/10 pt-2 text-[10px] text-white/65">
//                     <span className="flex items-center gap-1">
//                       <Droplets className="h-3 w-3 text-sky-300" /> {d.rain_sum} mm
//                     </span>
//                     <span className="flex items-center gap-1">
//                       <Wind className="h-3 w-3 text-slate-300" /> {d.windspeed_10m_max} km/h
//                     </span>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import { useEffect, useRef, useState } from "react";
import { fetch7DayForecast } from "../../services/api.js";
import { resolveCondition } from "../../utils/weatherCondition.js";
import { Droplets, Wind, ChevronLeft, ChevronRight } from "lucide-react";
import AnimatedContent from "../reactbits/AnimatedContent.jsx";

function ForecastSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {[1, 2, 3, 4, 5, 6, 7].map((item) => (
        <div key={item} className="h-[230px] min-w-[150px] flex-1 animate-pulse rounded-[28px] border border-white/10 bg-white/[0.06]" />
      ))}
    </div>
  );
}

function RainBar({ value, max }) {
  const amount = Number(value) || 0;
  const maximum = Math.max(Number(max) || 1, 1);
  const percentage = Math.min((amount / maximum) * 100, 100);

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <div className="h-full rounded-full bg-gradient-to-r from-sky-300 to-blue-400 transition-all duration-1000 ease-out" style={{ width: `${percentage}%` }} />
    </div>
  );
}

export default function DailyForecastList({ city }) {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (!city) {
      setDays([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    setLoading(true);
    setSelectedIndex(0);

    fetch7DayForecast(city)
      .then((res) => {
        if (!cancelled) {
          setDays(res.forecast || []);
        }
      })
      .catch((err) => {
        console.error("Failed to load 7-day forecast:", err);

        if (!cancelled) {
          setDays([]);
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

  if (!city) return null;

  const rainfallValues = days.map((day) => Number(day.rain_sum) || 0);
  const maxRainfall = rainfallValues.length ? Math.max(...rainfallValues, 1) : 1;

  function scrollForecast(direction) {
    const container = scrollRef.current;

    if (!container) return;

    container.scrollBy({
      left: direction === "left" ? -360 : 360,
      behavior: "smooth",
    });
  }

  function handleSelectDay(index) {
    setSelectedIndex(index);

    const container = scrollRef.current;
    const element = container?.children?.[index];

    element?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }

  return (
    <div className="relative z-10 mx-auto w-full animate-fadeIn">
      <AnimatedContent distance={25} direction="vertical" duration={0.7} ease="power3.out" initialOpacity={0}>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">Extended outlook</p>
            <h3 className="mt-1 text-lg font-bold tracking-[-0.03em] text-white sm:text-xl">7-Day Forecast</h3>
          </div>

          {!loading && days.length > 0 && (
            <div className="hidden items-center gap-2 md:flex">
              <button type="button" onClick={() => scrollForecast("left")} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/60 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white" aria-label="Scroll forecast left">
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button type="button" onClick={() => scrollForecast("right")} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/60 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white" aria-label="Scroll forecast right">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </AnimatedContent>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-10 bg-gradient-to-r from-black/10 to-transparent md:hidden" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-10 bg-gradient-to-l from-black/10 to-transparent md:hidden" />

        {loading && <ForecastSkeleton />}

        {!loading && days.length === 0 && (
          <div className="flex min-h-[220px] items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.05] px-6 text-center backdrop-blur-xl">
            <div>
              <div className="text-3xl">🌥️</div>
              <p className="mt-3 text-sm font-semibold text-white/70">No forecast data available</p>
              <p className="mt-1 text-xs text-white/35">Try selecting another city.</p>
            </div>
          </div>
        )}

        {!loading && days.length > 0 && (
          <div ref={scrollRef} className="no-scrollbar flex w-full snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2">
            {days.map((day, index) => {
              const date = new Date(day.date);
              const active = selectedIndex === index;
              const isToday = index === 0;

              const dayLabel = isToday ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" });
              const dateLabel = date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });

              const condition = resolveCondition(day.weather_condition);

              const maxTemp = Number(day.temp_max) || 0;
              const minTemp = Number(day.temp_min) || 0;
              const rain = Number(day.rain_sum) || 0;
              const wind = Number(day.windspeed_10m_max) || 0;

              return (
                <AnimatedContent key={day.date} distance={35} direction="vertical" duration={0.7} delay={index * 0.05} ease="power3.out" initialOpacity={0} className="min-w-[150px] flex-1 snap-center">
                  <button type="button" onClick={() => handleSelectDay(index)} className={`group relative flex h-[230px] w-full flex-col overflow-hidden rounded-[28px] border p-4 text-left transition-all duration-500 ${active ? "border-white/35 bg-white/[0.16] shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-2xl" : "border-white/10 bg-white/[0.055] backdrop-blur-xl hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.09]"}`}>
                    <div className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-3xl transition-all duration-500 ${active ? "bg-sky-300/20" : "bg-white/[0.03] group-hover:bg-sky-300/10"}`} />

                    {active && <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />}

                    <div className="relative z-10 flex h-full flex-col">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold uppercase tracking-[0.12em] ${active ? "text-white" : "text-white/70"}`}>{dayLabel}</span>

                            {isToday && <span className="h-1.5 w-1.5 rounded-full bg-sky-300 shadow-[0_0_10px_rgba(125,211,252,0.8)]" />}
                          </div>

                          <span className="mt-1 block text-[10px] font-medium text-white/35">{dateLabel}</span>
                        </div>

                        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/25">{String(index + 1).padStart(2, "0")}</span>
                      </div>

                      <div className="my-auto flex items-center justify-between gap-3">
                        <div className="relative">
                          <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-xl" />
                          <span className="relative block text-4xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)] transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110" aria-hidden="true">{condition.icon}</span>
                        </div>

                        <div className="text-right">
                          <div className="flex items-start justify-end">
                            <span className="text-3xl font-black tracking-[-0.06em] text-white">{Math.round(maxTemp)}°</span>
                          </div>

                          <p className="mt-0.5 text-xs font-semibold text-white/35">Low {Math.round(minTemp)}°</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="mb-1.5 flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5 text-[10px] font-medium text-white/45">
                              <Droplets className="h-3 w-3 text-sky-300" />
                              Rain
                            </span>

                            <span className="text-[10px] font-bold text-white/70">{rain.toFixed(1)} mm</span>
                          </div>

                          <RainBar value={rain} max={maxRainfall} />
                        </div>

                        <div className="flex items-center justify-between border-t border-white/[0.08] pt-2">
                          <span className="flex items-center gap-1.5 text-[10px] font-medium text-white/40">
                            <Wind className="h-3 w-3 text-white/45" />
                            Wind
                          </span>

                          <span className="text-[10px] font-semibold text-white/60">{Math.round(wind)} km/h</span>
                        </div>
                      </div>
                    </div>
                  </button>
                </AnimatedContent>
              );
            })}
          </div>
        )}
      </div>

      {!loading && days.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {days.map((day, index) => (
            <button key={day.date} type="button" onClick={() => handleSelectDay(index)} className={`h-1.5 rounded-full transition-all duration-500 ${selectedIndex === index ? "w-7 bg-white" : "w-1.5 bg-white/25 hover:bg-white/45"}`} aria-label={`Select forecast day ${index + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}