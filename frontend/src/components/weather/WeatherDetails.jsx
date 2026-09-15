import { alertTone } from "../../utils/weatherCondition.js";

const TONE_STYLES = {
  "alert-low": "bg-white/15 text-white",
  "alert-moderate": "bg-alert-moderate/90 text-white",
  "alert-high": "bg-alert-high/90 text-white",
};

function Stat({ label, value, sub }) {
  return (
    <div className="clay-glass flex flex-col gap-1 px-4 py-3.5">
      <p className="text-[11px] uppercase tracking-wide text-white/60">{label}</p>
      <p className="font-display text-xl font-semibold text-white sm:text-2xl">{value}</p>
      {sub && <p className="text-xs text-white/60">{sub}</p>}
    </div>
  );
}

export default function WeatherDetails({ prediction }) {
  const tone = alertTone(prediction.alert_status);

  // Optional fields — only render if the API actually provides them.
  const hasWind = prediction.wind_speed_kmh !== undefined;
  const hasHumidity = prediction.humidity_percent !== undefined;

  return (
    <div className="relative z-10 mx-auto grid w-full max-w-4xl grid-cols-2 gap-3 px-4 pb-4 sm:grid-cols-2 md:grid-cols-4">
      <Stat
        label="Rainfall"
        value={`${prediction.expected_rainfall_mm.toFixed(1)} mm`}
        sub={prediction.rain_expected === "YES" ? "Rain expected" : "No rain expected"}
      />

      <div className="clay-glass flex flex-col gap-1 px-4 py-3.5">
        <p className="text-[11px] uppercase tracking-wide text-white/60">Alert</p>
        <span className={`clay-chip mt-1 inline-block w-fit px-2.5 py-1 text-xs font-medium ${TONE_STYLES[tone]}`}>
          {prediction.alert_status}
        </span>
      </div>

      {hasWind && <Stat label="Wind" value={`${Math.round(prediction.wind_speed_kmh)} km/h`} />}
      {hasHumidity && <Stat label="Humidity" value={`${Math.round(prediction.humidity_percent)}%`} />}
    </div>
  );
}