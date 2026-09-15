import { alertTone } from "../../utils/weatherCondition.js";

const TONE_DOT = {
  "alert-low": "bg-emerald-300",
  "alert-moderate": "bg-amber-300",
  "alert-high": "bg-rose-300",
};

function Chip({ label, value, dot }) {
  return (
    <div className="flex flex-col items-center gap-1 px-5 text-white/85">
      <span className="text-[11px] uppercase tracking-wider text-white/50">{label}</span>
      <span className="flex items-center gap-1.5 text-sm font-semibold sm:text-base">
        {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
        {value}
      </span>
    </div>
  );
}

export default function WeatherStatsStrip({ prediction }) {
  const tone = alertTone(prediction.alert_status);
  const hasWind = prediction.wind_speed_kmh !== undefined;
  const hasHumidity = prediction.humidity_percent !== undefined;

  return (
    <div className="relative z-10 mx-auto mt-8 flex w-fit max-w-full flex-wrap items-center justify-center divide-x divide-white/15 px-2">
      <Chip label="Rainfall" value={`${prediction.expected_rainfall_mm.toFixed(1)} mm`} />
      <Chip label="Alert" value={prediction.alert_status} dot={TONE_DOT[tone]} />
      {hasWind && <Chip label="Wind" value={`${Math.round(prediction.wind_speed_kmh)} km/h`} />}
      {hasHumidity && <Chip label="Humidity" value={`${Math.round(prediction.humidity_percent)}%`} />}
    </div>
  );
}