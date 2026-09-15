import { resolveCondition } from "../../utils/weatherCondition.js";

export default function WeatherHero({ prediction }) {
  const { label } = resolveCondition(prediction.weather_condition);

  return (
    <div className="relative z-10 flex flex-col items-center justify-center px-4 pt-10 text-center text-white sm:pt-16">
      <div className="flex items-start leading-none">
        <span
          className="font-display font-extralight tracking-tight"
          style={{ fontSize: "clamp(5.5rem, 24vw, 10rem)" }}
        >
          {Math.round(prediction.temperature_c)}
        </span>
        <span className="mt-3 font-display text-3xl font-light text-white/45 sm:mt-5 sm:text-4xl">
          °C
        </span>
      </div>
      <p className="-mt-1 text-xl font-medium text-white/90 sm:text-2xl">{label}</p>
    </div>
  );
}