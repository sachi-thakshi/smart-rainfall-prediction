// import { resolveCondition } from "../../utils/weatherCondition.js";

// export default function WeatherHero({ prediction }) {
//   const { label } = resolveCondition(prediction.weather_condition);

//   return (
//     <div className="relative z-10 flex flex-col items-center justify-center px-4 pt-10 text-center text-white sm:pt-16">
//       <div className="flex items-start leading-none">
//         <span
//           className="font-display font-extralight tracking-tight"
//           style={{ fontSize: "clamp(5.5rem, 24vw, 10rem)" }}
//         >
//           {Math.round(prediction.temperature_c)}
//         </span>
//         <span className="mt-3 font-display text-3xl font-light text-white/45 sm:mt-5 sm:text-4xl">
//           °C
//         </span>
//       </div>
//       <p className="-mt-1 text-xl font-medium text-white/90 sm:text-2xl">{label}</p>
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from "react";
import { resolveCondition, alertTone } from "../../utils/weatherCondition.js";
import AnimatedContent from "../reactbits/AnimatedContent.jsx";
import CountUp from "../reactbits/CountUp.jsx";

export default function WeatherHero({ prediction }) {
  const [animationKey, setAnimationKey] = useState(0);

  const condition = useMemo(() => {
    return resolveCondition(prediction?.weather_condition);
  }, [prediction?.weather_condition]);

  const alertClass = useMemo(() => {
    return alertTone(prediction?.alert_status);
  }, [prediction?.alert_status]);

  useEffect(() => {
    setAnimationKey((prev) => prev + 1);
  }, [prediction?.temperature_c, prediction?.weather_condition]);

  if (!prediction) return null;

  const temperature = Number(prediction.temperature_c) || 0;

  return (
    <div key={animationKey} className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center justify-center px-4 text-center text-white">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.06] blur-[100px] sm:h-[520px] sm:w-[520px]" />

      {/* Floating atmospheric rings */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 animate-[weather-ring_8s_ease-in-out_infinite] rounded-full border border-white/[0.04] sm:h-[420px] sm:w-[420px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[390px] w-[390px] -translate-x-1/2 -translate-y-1/2 animate-[weather-ring_10s_ease-in-out_infinite_reverse] rounded-full border border-white/[0.03] sm:h-[540px] sm:w-[540px]" />

      {/* Live prediction badge */}
      <AnimatedContent distance={20} direction="vertical" reverse duration={0.65} ease="power3.out" initialOpacity={0}>
        <div className="relative mb-3 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.07] px-4 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.1)] backdrop-blur-xl">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/50 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>

          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/65">Live Prediction</span>
        </div>
      </AnimatedContent>

      {/* Condition icon */}
      <AnimatedContent distance={25} direction="vertical" reverse duration={0.75} delay={0.05} ease="power3.out" initialOpacity={0}>
        <div className="relative mb-1 flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
          <div className="absolute h-14 w-14 rounded-full bg-white/15 blur-2xl sm:h-20 sm:w-20" />

          <div className="relative animate-[weather-float_4s_ease-in-out_infinite] select-none text-5xl drop-shadow-[0_16px_24px_rgba(0,0,0,0.18)] sm:text-6xl">
            {condition.icon}
          </div>
        </div>
      </AnimatedContent>

      {/* Temperature */}
      <AnimatedContent distance={70} direction="vertical" duration={0.95} delay={0.08} ease="power3.out" initialOpacity={0}>
        <div className="relative flex items-start justify-center leading-none">
          <CountUp
            from={Math.max(0, temperature - 5)}
            to={temperature}
            duration={1.5}
            decimals={0}
            className="font-display text-[clamp(7rem,22vw,13rem)] font-extralight leading-[0.82] tracking-[-0.085em] text-white drop-shadow-[0_25px_55px_rgba(0,0,0,0.12)]"
          />

          <span className="ml-2 mt-3 font-display text-3xl font-light tracking-[-0.04em] text-white/40 sm:mt-5 sm:text-4xl md:text-5xl">°C</span>
        </div>
      </AnimatedContent>

      {/* Condition */}
      <AnimatedContent distance={35} direction="vertical" duration={0.8} delay={0.17} ease="power3.out" initialOpacity={0}>
        <div className="relative mt-5 flex flex-col items-center">
          <h1 className="font-display text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl md:text-[2.6rem]">{condition.label}</h1>

          {prediction.weather_condition && prediction.weather_condition.toLowerCase() !== condition.label.toLowerCase() && (
            <p className="mt-2 max-w-lg text-xs font-medium tracking-wide text-white/40 sm:text-sm">{prediction.weather_condition}</p>
          )}
        </div>
      </AnimatedContent>

      {/* Alert status */}
      {prediction.alert_status && (
        <AnimatedContent distance={25} direction="vertical" duration={0.7} delay={0.24} ease="power3.out" initialOpacity={0}>
          <div
            className={`mt-6 inline-flex items-center gap-2.5 rounded-full border px-4 py-2 text-xs font-semibold shadow-lg backdrop-blur-xl ${
              alertClass === "alert-high"
                ? "border-red-300/30 bg-red-500/20 text-red-50 shadow-red-950/10"
                : alertClass === "alert-moderate"
                ? "border-amber-300/30 bg-amber-400/15 text-amber-50 shadow-amber-950/10"
                : "border-emerald-300/20 bg-emerald-400/10 text-emerald-50 shadow-emerald-950/10"
            }`}
          >
            <span
              className={`relative flex h-2 w-2 items-center justify-center rounded-full ${
                alertClass === "alert-high"
                  ? "bg-red-300"
                  : alertClass === "alert-moderate"
                  ? "bg-amber-300"
                  : "bg-emerald-300"
              }`}
            >
              <span
                className={`absolute h-full w-full animate-ping rounded-full opacity-60 ${
                  alertClass === "alert-high"
                    ? "bg-red-300"
                    : alertClass === "alert-moderate"
                    ? "bg-amber-300"
                    : "bg-emerald-300"
                }`}
              />
            </span>

            <span>{prediction.alert_status}</span>
          </div>
        </AnimatedContent>
      )}

      {/* Small lower indicator */}
      <AnimatedContent distance={18} direction="vertical" duration={0.7} delay={0.32} ease="power3.out" initialOpacity={0}>
        <div className="mt-7 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">
          <span className="h-px w-7 bg-gradient-to-r from-transparent to-white/30" />
          <span>SmartRain Intelligence</span>
          <span className="h-px w-7 bg-gradient-to-l from-transparent to-white/30" />
        </div>
      </AnimatedContent>

      <style>{`
        @keyframes weather-float {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }

          50% {
            transform: translate3d(0, -10px, 0) rotate(2deg);
          }
        }

        @keyframes weather-ring {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.5;
          }

          50% {
            transform: translate(-50%, -50%) scale(1.06);
            opacity: 0.15;
          }
        }
      `}</style>
    </div>
  );
}