// export default function WindLines({ active = false }) {
//   if (!active) return null;

//   const lines = Array.from({ length: 5 }, (_, i) => ({
//     id: i,
//     top: 25 + Math.random() * 45,
//     width: 60 + Math.random() * 120,
//     duration: 4 + Math.random() * 3,
//     delay: -Math.random() * 6,
//     thickness: Math.random() > 0.5 ? 1 : 1.5,
//   }));

//   return (
//     <>
//       {lines.map((l) => (
//         <span
//           key={l.id}
//           className="absolute rounded-full bg-white/35"
//           style={{
//             top: `${l.top}%`,
//             left: 0,
//             width: l.width,
//             height: l.thickness,
//             filter: "blur(0.5px)",
//             animation: `wind-drift ${l.duration}s ease-in-out infinite`,
//             animationDelay: `${l.delay}s`,
//           }}
//         />
//       ))}
//     </>
//   );
// }

import { useMemo } from "react";

function createWindLines(count, layer) {
  const configs = {
    far: {
      minTop: 14,
      maxTop: 72,
      minWidth: 90,
      maxWidth: 180,
      minDuration: 8,
      maxDuration: 13,
      minOpacity: 0.08,
      maxOpacity: 0.18,
      minThickness: 0.6,
      maxThickness: 1,
      blur: 1.4,
      drift: 115,
    },
    mid: {
      minTop: 18,
      maxTop: 78,
      minWidth: 120,
      maxWidth: 240,
      minDuration: 5,
      maxDuration: 8,
      minOpacity: 0.14,
      maxOpacity: 0.3,
      minThickness: 0.8,
      maxThickness: 1.3,
      blur: 0.6,
      drift: 125,
    },
    front: {
      minTop: 24,
      maxTop: 82,
      minWidth: 150,
      maxWidth: 290,
      minDuration: 3.2,
      maxDuration: 5.4,
      minOpacity: 0.2,
      maxOpacity: 0.42,
      minThickness: 1,
      maxThickness: 1.7,
      blur: 0.2,
      drift: 138,
    },
  };

  const config = configs[layer];

  return Array.from({ length: count }, (_, index) => ({
    id: `${layer}-${index}`,
    top: config.minTop + Math.random() * (config.maxTop - config.minTop),
    width: config.minWidth + Math.random() * (config.maxWidth - config.minWidth),
    duration: config.minDuration + Math.random() * (config.maxDuration - config.minDuration),
    delay: -Math.random() * config.maxDuration,
    opacity: config.minOpacity + Math.random() * (config.maxOpacity - config.minOpacity),
    thickness: config.minThickness + Math.random() * (config.maxThickness - config.minThickness),
    blur: config.blur,
    curve: -12 + Math.random() * 24,
    drift: config.drift + Math.random() * 20,
    scale: 0.9 + Math.random() * 0.25,
  }));
}

function WindLine({ line, layer }) {
  return (
    <span
      className="smart-wind-line absolute left-[-35%] block will-change-transform"
      data-layer={layer}
      style={{
        top: `${line.top}%`,
        width: `${line.width}px`,
        height: `${line.thickness}px`,
        opacity: line.opacity,
        filter: line.blur ? `blur(${line.blur}px)` : undefined,
        animationDuration: `${line.duration}s`,
        animationDelay: `${line.delay}s`,
        "--wind-drift": `${line.drift}vw`,
        "--wind-curve": `${line.curve}px`,
        "--wind-scale": line.scale,
      }}
    >
      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/65 to-transparent" />

      <span className="absolute right-0 top-1/2 h-[3px] w-[18%] -translate-y-1/2 rounded-full bg-white/25 blur-sm" />
    </span>
  );
}

function CurvedCurrent({ top, delay, duration, opacity, reverse = false }) {
  return (
    <svg
      viewBox="0 0 620 110"
      preserveAspectRatio="none"
      className={`smart-wind-current absolute left-[-45%] w-[620px] overflow-visible ${reverse ? "smart-wind-current-reverse" : ""}`}
      style={{
        top,
        height: 100,
        opacity,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      }}
    >
      <defs>
        <linearGradient id={`wind-gradient-${top}-${delay}`} x1="0" x2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="30%" stopColor="rgba(255,255,255,0.14)" />
          <stop offset="65%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      <path
        d="M0 72 C120 18 230 98 350 48 C445 8 520 74 620 38"
        fill="none"
        stroke={`url(#wind-gradient-${top}-${delay})`}
        strokeWidth="1.3"
        strokeLinecap="round"
      />

      <path
        d="M20 82 C150 36 245 106 365 58 C455 21 530 84 620 51"
        fill="none"
        stroke={`url(#wind-gradient-${top}-${delay})`}
        strokeWidth="0.7"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

export default function WindLines({ active = false }) {
  const farLines = useMemo(() => createWindLines(6, "far"), []);
  const midLines = useMemo(() => createWindLines(7, "mid"), []);
  const frontLines = useMemo(() => createWindLines(5, "front"), []);

  const currents = useMemo(
    () => [
      { top: "18%", delay: -2.5, duration: 11, opacity: 0.38 },
      { top: "36%", delay: -6.2, duration: 13, opacity: 0.26, reverse: true },
      { top: "55%", delay: -1.8, duration: 10, opacity: 0.32 },
      { top: "72%", delay: -8.5, duration: 14, opacity: 0.2, reverse: true },
    ],
    []
  );

  if (!active) return null;

  return (
    <div className="absolute inset-0 isolate overflow-hidden">
      <div className="absolute inset-0 z-[1]">
        {farLines.map((line) => (
          <WindLine key={line.id} line={line} layer="far" />
        ))}
      </div>

      <div className="absolute inset-0 z-[3]">
        {currents.map((current, index) => (
          <CurvedCurrent key={index} {...current} />
        ))}
      </div>

      <div className="absolute inset-0 z-[4]">
        {midLines.map((line) => (
          <WindLine key={line.id} line={line} layer="mid" />
        ))}
      </div>

      <div className="absolute inset-0 z-[6]">
        {frontLines.map((line) => (
          <WindLine key={line.id} line={line} layer="front" />
        ))}
      </div>

      <div className="absolute left-[-25%] top-[38%] z-[2] h-32 w-[70%] animate-[wind-haze-a_15s_ease-in-out_infinite] rounded-full bg-white/[0.025] blur-[60px]" />
      <div className="absolute right-[-30%] top-[58%] z-[2] h-28 w-[65%] animate-[wind-haze-b_18s_ease-in-out_infinite] rounded-full bg-sky-100/[0.02] blur-[70px]" />

      <style>{`
        .smart-wind-line {
          animation-name: smart-wind-drift;
          animation-timing-function: cubic-bezier(0.35, 0.05, 0.18, 1);
          animation-iteration-count: infinite;
          transform-origin: left center;
        }

        .smart-wind-line[data-layer="far"] {
          mix-blend-mode: screen;
        }

        .smart-wind-line[data-layer="front"] {
          filter: drop-shadow(0 0 4px rgba(255,255,255,0.08));
        }

        @keyframes smart-wind-drift {
          0% {
            transform: translate3d(-15vw, 0, 0) scaleX(0.7) scaleY(var(--wind-scale));
            opacity: 0;
          }

          12% {
            opacity: 1;
          }

          35% {
            transform: translate3d(35vw, var(--wind-curve), 0) scaleX(1) scaleY(var(--wind-scale));
          }

          65% {
            transform: translate3d(78vw, calc(var(--wind-curve) * -0.5), 0) scaleX(1.08) scaleY(var(--wind-scale));
          }

          88% {
            opacity: 1;
          }

          100% {
            transform: translate3d(var(--wind-drift), 0, 0) scaleX(0.82) scaleY(var(--wind-scale));
            opacity: 0;
          }
        }

        .smart-wind-current {
          animation-name: smart-wind-current-drift;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .smart-wind-current-reverse {
          animation-name: smart-wind-current-drift-reverse;
        }

        @keyframes smart-wind-current-drift {
          0% {
            transform: translate3d(-15vw, 0, 0);
            opacity: 0;
          }

          15% {
            opacity: 1;
          }

          85% {
            opacity: 1;
          }

          100% {
            transform: translate3d(145vw, -8px, 0);
            opacity: 0;
          }
        }

        @keyframes smart-wind-current-drift-reverse {
          0% {
            transform: translate3d(-20vw, 8px, 0) scaleY(-1);
            opacity: 0;
          }

          15% {
            opacity: 1;
          }

          85% {
            opacity: 1;
          }

          100% {
            transform: translate3d(145vw, -5px, 0) scaleY(-1);
            opacity: 0;
          }
        }

        @keyframes wind-haze-a {
          0%, 100% {
            transform: translate3d(-8%, 0, 0) scale(1);
            opacity: 0.45;
          }

          50% {
            transform: translate3d(30%, -5%, 0) scale(1.08);
            opacity: 0.85;
          }
        }

        @keyframes wind-haze-b {
          0%, 100% {
            transform: translate3d(10%, 3%, 0) scale(1.05);
            opacity: 0.35;
          }

          50% {
            transform: translate3d(-28%, -4%, 0) scale(0.96);
            opacity: 0.7;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .smart-wind-line,
          .smart-wind-current {
            animation: none !important;
            opacity: 0.15 !important;
          }
        }
      `}</style>
    </div>
  );
}