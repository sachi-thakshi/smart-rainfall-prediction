// import { alertTone } from "../../utils/weatherCondition.js";

// const TONE_DOT = {
//   "alert-low": "bg-emerald-300",
//   "alert-moderate": "bg-amber-300",
//   "alert-high": "bg-rose-300",
// };

// function Chip({ label, value, dot }) {
//   return (
//     <div className="flex flex-col items-center gap-1 px-5 text-white/85">
//       <span className="text-[11px] uppercase tracking-wider text-white/50">{label}</span>
//       <span className="flex items-center gap-1.5 text-sm font-semibold sm:text-base">
//         {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
//         {value}
//       </span>
//     </div>
//   );
// }

// export default function WeatherStatsStrip({ prediction }) {
//   const tone = alertTone(prediction.alert_status);
//   const hasWind = prediction.wind_speed_kmh !== undefined;
//   const hasHumidity = prediction.humidity_percent !== undefined;

//   return (
//     <div className="relative z-10 mx-auto mt-8 flex w-fit max-w-full flex-wrap items-center justify-center divide-x divide-white/15 px-2">
//       <Chip label="Rainfall" value={`${prediction.expected_rainfall_mm.toFixed(1)} mm`} />
//       <Chip label="Alert" value={prediction.alert_status} dot={TONE_DOT[tone]} />
//       {hasWind && <Chip label="Wind" value={`${Math.round(prediction.wind_speed_kmh)} km/h`} />}
//       {hasHumidity && <Chip label="Humidity" value={`${Math.round(prediction.humidity_percent)}%`} />}
//     </div>
//   );
// }

import { alertTone } from "../../utils/weatherCondition.js";
import AnimatedContent from "../reactbits/AnimatedContent.jsx";
import CountUp from "../reactbits/CountUp.jsx";

const ALERT_CONFIG = {
  "alert-low": {
    dot: "bg-emerald-400",
    ring: "ring-emerald-400/20",
    background: "bg-emerald-50",
    text: "text-emerald-700",
    glow: "bg-emerald-400/20",
  },
  "alert-moderate": {
    dot: "bg-amber-400",
    ring: "ring-amber-400/20",
    background: "bg-amber-50",
    text: "text-amber-700",
    glow: "bg-amber-400/20",
  },
  "alert-high": {
    dot: "bg-rose-400",
    ring: "ring-rose-400/20",
    background: "bg-rose-50",
    text: "text-rose-700",
    glow: "bg-rose-400/20",
  },
};

function RainIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 17.5C6.57 17.5 5 15.93 5 14c0-1.68 1.18-3.08 2.76-3.42A4.75 4.75 0 0 1 17 12c1.66 0 3 1.34 3 3s-1.34 3-3 3H8.5Z" />
      <path strokeLinecap="round" d="M9 20.5 8.5 22M13 20.5 12.5 22M17 20.5 16.5 22" />
    </svg>
  );
}

function WindIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.7">
      <path strokeLinecap="round" d="M3 8h11.5c1.38 0 2.5-1.12 2.5-2.5S15.88 3 14.5 3c-1.03 0-1.91.62-2.3 1.5M3 12h15.5a2.5 2.5 0 1 1-2.3 3.5M3 16h7" />
    </svg>
  );
}

function HumidityIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.5S6.5 9.3 6.5 14a5.5 5.5 0 0 0 11 0C17.5 9.3 12 3.5 12 3.5Z" />
      <path strokeLinecap="round" d="M9.5 14.5a2.8 2.8 0 0 0 2.8 2.8" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 2.8 19h18.4L12 3Z" />
      <path strokeLinecap="round" d="M12 9v4M12 16.5v.01" />
    </svg>
  );
}

function MetricCard({ icon, label, children, description, delay = 0, accent = "sky" }) {
  const accentStyles = {
    sky: {
      icon: "bg-sky-50 text-sky-600",
      glow: "bg-sky-400/10",
    },
    blue: {
      icon: "bg-blue-50 text-blue-600",
      glow: "bg-blue-400/10",
    },
    cyan: {
      icon: "bg-cyan-50 text-cyan-600",
      glow: "bg-cyan-400/10",
    },
  };

  const styles = accentStyles[accent] || accentStyles.sky;

  return (
    <AnimatedContent distance={35} direction="vertical" duration={0.75} delay={delay} ease="power3.out" initialOpacity={0}>
      <div className="group relative h-full overflow-hidden rounded-[26px] border border-slate-200/70 bg-white/70 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-slate-300/80 hover:bg-white hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        <div className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-3xl transition-all duration-500 group-hover:scale-125 ${styles.glow}`} />

        <div className="relative z-10">
          <div className="mb-7 flex items-center justify-between">
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${styles.icon}`}>{icon}</div>

            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-300">Live</span>
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>

          <div className="mt-2 flex min-h-[42px] items-center text-3xl font-black tracking-[-0.05em] text-slate-950">{children}</div>

          {description && <p className="mt-2 text-xs leading-5 text-slate-400">{description}</p>}
        </div>
      </div>
    </AnimatedContent>
  );
}

export default function WeatherStatsStrip({ prediction }) {
  if (!prediction) return null;

  const tone = alertTone(prediction.alert_status);
  const alertConfig = ALERT_CONFIG[tone] || ALERT_CONFIG["alert-low"];

  const rainfall = Number(prediction.expected_rainfall_mm) || 0;
  const hasWind = prediction.wind_speed_kmh !== undefined && prediction.wind_speed_kmh !== null;
  const hasHumidity = prediction.humidity_percent !== undefined && prediction.humidity_percent !== null;

  return (
    <div className="relative z-10 mx-auto w-full">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-sky-600">Current atmosphere</p>
          <h3 className="mt-1 text-xl font-bold tracking-[-0.03em] text-slate-950">Weather intelligence</h3>
        </div>

        <p className="max-w-sm text-xs leading-5 text-slate-400">Live prediction indicators based on the currently selected location and forecast period.</p>
      </div>

      <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${hasWind && hasHumidity ? "xl:grid-cols-4" : "xl:grid-cols-2"}`}>
        <MetricCard icon={<RainIcon />} label="Expected Rainfall" description="Predicted accumulated rainfall" delay={0.05} accent="sky">
          <CountUp from={0} to={rainfall} duration={1.5} decimals={1} />

          <span className="ml-2 text-sm font-semibold tracking-normal text-slate-400">mm</span>
        </MetricCard>

        <AnimatedContent distance={35} direction="vertical" duration={0.75} delay={0.1} ease="power3.out" initialOpacity={0}>
          <div className="group relative h-full overflow-hidden rounded-[26px] border border-slate-200/70 bg-white/70 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-slate-300/80 hover:bg-white hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <div className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl transition-transform duration-500 group-hover:scale-125 ${alertConfig.glow}`} />

            <div className="relative z-10">
              <div className="mb-7 flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${alertConfig.background} ${alertConfig.text}`}>
                  <AlertIcon />
                </div>

                <div className={`flex items-center gap-2 rounded-full px-2.5 py-1 ring-1 ${alertConfig.background} ${alertConfig.ring}`}>
                  <span className={`relative flex h-1.5 w-1.5 rounded-full ${alertConfig.dot}`}>
                    <span className={`absolute h-full w-full animate-ping rounded-full opacity-50 ${alertConfig.dot}`} />
                  </span>

                  <span className={`text-[9px] font-bold uppercase tracking-[0.12em] ${alertConfig.text}`}>Active</span>
                </div>
              </div>

              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Weather Alert</p>

              <div className="mt-2 flex min-h-[42px] items-center">
                <span className={`text-2xl font-black tracking-[-0.04em] ${alertConfig.text}`}>{prediction.alert_status || "Low"}</span>
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-400">Current weather risk classification</p>
            </div>
          </div>
        </AnimatedContent>

        {hasWind && (
          <MetricCard icon={<WindIcon />} label="Wind Speed" description="Current predicted wind velocity" delay={0.15} accent="blue">
            <CountUp from={0} to={Number(prediction.wind_speed_kmh) || 0} duration={1.6} decimals={0} />

            <span className="ml-2 text-sm font-semibold tracking-normal text-slate-400">km/h</span>
          </MetricCard>
        )}

        {hasHumidity && (
          <MetricCard icon={<HumidityIcon />} label="Humidity" description="Predicted atmospheric moisture" delay={0.2} accent="cyan">
            <CountUp from={0} to={Number(prediction.humidity_percent) || 0} duration={1.7} decimals={0} />

            <span className="ml-1 text-sm font-semibold tracking-normal text-slate-400">%</span>
          </MetricCard>
        )}
      </div>
    </div>
  );
}