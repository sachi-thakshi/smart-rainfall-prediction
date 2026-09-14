import { resolveCondition } from "../../utils/weatherCondition.js";

export default function WeatherHero({ station, prediction }) {
  const { icon, label } = resolveCondition(prediction.weather_condition);
  const dateLabel = new Date(prediction.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="px-1 pb-2 pt-6 text-white">
      <p className="text-sm text-white/75">{station} · {dateLabel}</p>
      <div className="mt-1 flex items-end gap-3">
        <span className="font-display text-7xl font-semibold leading-none tracking-tight">
          {Math.round(prediction.temperature_c)}°
        </span>
        <div className="mb-1.5 flex items-center gap-1.5 text-lg">
          <span aria-hidden="true">{icon}</span>
          <span className="text-white/90">{label}</span>
        </div>
      </div>
    </div>
  );
}
