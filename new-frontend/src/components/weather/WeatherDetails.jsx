import { alertTone } from "../../utils/weatherCondition.js";

const TONE_STYLES = {
  "alert-low": "bg-white/15 text-white",
  "alert-moderate": "bg-alert-moderate/90 text-white",
  "alert-high": "bg-alert-high/90 text-white",
};

export default function WeatherDetails({ prediction }) {
  const tone = alertTone(prediction.alert_status);

  return (
    <div className="glass-panel grid grid-cols-2 divide-x divide-white/20 rounded-2xl text-white">
      <div className="px-4 py-3.5">
        <p className="text-xs uppercase tracking-wide text-white/60">Rainfall</p>
        <p className="mt-1 font-display text-2xl font-semibold">
          {prediction.expected_rainfall_mm.toFixed(1)}
          <span className="ml-1 text-sm font-normal text-white/75">mm</span>
        </p>
        <p className="mt-0.5 text-xs text-white/60">
          Rain expected: {prediction.rain_expected === "YES" ? "Yes" : "No"}
        </p>
      </div>
      <div className="px-4 py-3.5">
        <p className="text-xs uppercase tracking-wide text-white/60">Alert</p>
        <span
          className={`mt-1.5 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${TONE_STYLES[tone]}`}
        >
          {prediction.alert_status}
        </span>
      </div>
    </div>
  );
}
