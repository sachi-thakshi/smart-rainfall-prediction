// import { useEffect, useState } from "react";

// function Bolt({ left, delayClass }) {
//   return (
//     <svg
//       viewBox="0 0 60 160"
//       className={`absolute top-0 ${delayClass}`}
//       style={{ left: `${left}%`, width: 50, height: 140, opacity: 0 }}
//     >
//       <polygon
//         points="30,0 10,70 26,70 14,160 50,60 32,60 44,0"
//         fill="white"
//         style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.9))" }}
//       />
//     </svg>
//   );
// }

// export default function LightningLayer() {
//   // Re-randomize bolt position every cycle so strikes don't feel mechanical
//   const [bolts] = useState(() => [
//     { left: 15 + Math.random() * 20, delayClass: "bolt-strike-a" },
//     { left: 55 + Math.random() * 25, delayClass: "bolt-strike-b" },
//   ]);

//   return (
//     <>
//       <div className="lightning-flash" />
//       {bolts.map((b, i) => (
//         <Bolt key={i} left={b.left} delayClass={b.delayClass} />
//       ))}
//     </>
//   );
// }

import { useEffect, useMemo, useState } from "react";

const BOLT_PATHS = [
  {
    main: "M31 0 L21 39 L31 39 L17 77 L28 77 L10 144 L45 65 L34 65 L48 28 L37 28 L46 0 Z",
    branches: [
      "M26 52 L10 74 L20 68",
      "M27 78 L44 96 L35 86",
      "M19 102 L4 118 L15 111",
    ],
  },
  {
    main: "M38 0 L20 47 L31 47 L14 82 L28 82 L9 150 L49 69 L36 69 L52 35 L40 35 L52 0 Z",
    branches: [
      "M24 58 L7 78 L18 70",
      "M30 84 L48 102 L38 91",
      "M17 111 L3 126 L14 119",
    ],
  },
  {
    main: "M27 0 L17 44 L29 44 L12 79 L25 79 L8 150 L43 73 L32 73 L47 34 L35 34 L43 0 Z",
    branches: [
      "M21 50 L5 69 L17 61",
      "M24 81 L41 99 L32 88",
      "M15 108 L2 124 L13 116",
    ],
  },
];

function Bolt({ strike }) {
  const path = BOLT_PATHS[strike.variant % BOLT_PATHS.length];

  return (
    <div className="absolute top-0" style={{ left: `${strike.left}%`, transform: `scale(${strike.scale}) rotate(${strike.rotate}deg)`, transformOrigin: "top center", opacity: strike.opacity }}>
      <svg viewBox="0 0 60 160" className="lightning-bolt h-[150px] w-[56px] overflow-visible">
        <defs>
          <filter id={`bolt-glow-${strike.id}`} x="-150%" y="-50%" width="400%" height="250%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id={`bolt-gradient-${strike.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#bfdbfe" />
          </linearGradient>
        </defs>

        <path d={path.main} fill={`url(#bolt-gradient-${strike.id})`} filter={`url(#bolt-glow-${strike.id})`} />

        {path.branches.map((branch, index) => (
          <path key={index} d={branch} fill="none" stroke="rgba(224,242,254,0.9)" strokeWidth="1.8" strokeLinecap="round" filter={`url(#bolt-glow-${strike.id})`} />
        ))}
      </svg>
    </div>
  );
}

function createStrike(id, primary = false) {
  return {
    id,
    left: primary ? 18 + Math.random() * 58 : 5 + Math.random() * 85,
    scale: primary ? 0.95 + Math.random() * 0.45 : 0.65 + Math.random() * 0.3,
    rotate: -7 + Math.random() * 14,
    opacity: primary ? 0.95 : 0.6,
    variant: Math.floor(Math.random() * BOLT_PATHS.length),
  };
}

export default function LightningLayer() {
  const [strikeCycle, setStrikeCycle] = useState(0);

  useEffect(() => {
    let timeout;

    function scheduleNextStrike() {
      const delay = 3800 + Math.random() * 5200;

      timeout = window.setTimeout(() => {
        setStrikeCycle((value) => value + 1);
        scheduleNextStrike();
      }, delay);
    }

    scheduleNextStrike();

    return () => {
      window.clearTimeout(timeout);
    };
  }, []);

  const strikes = useMemo(() => {
    const primary = createStrike(`primary-${strikeCycle}`, true);
    const secondary = createStrike(`secondary-${strikeCycle}`, false);

    return [primary, secondary];
  }, [strikeCycle]);

  return (
    <div key={strikeCycle} className="absolute inset-0 isolate overflow-hidden">
      {/* Large atmospheric flash */}
      <div className="lightning-global-flash absolute inset-0 z-[1] bg-white" />

      {/* Cool storm illumination */}
      <div className="lightning-blue-flash absolute inset-0 z-[2] bg-gradient-to-br from-blue-100/50 via-indigo-200/20 to-transparent" />

      {/* Local strike glow */}
      <div className="lightning-local-glow absolute -top-[10%] z-[3] h-[70%] w-[60%] rounded-full bg-blue-100/35 blur-[100px]" style={{ left: `${Math.max(0, strikes[0].left - 28)}%` }} />

      {/* Distant horizon flash */}
      <div className="lightning-horizon-flash absolute inset-x-0 top-[8%] z-[2] h-[45%] bg-gradient-to-b from-white/25 via-blue-100/10 to-transparent blur-2xl" />

      {/* Main bolt */}
      <div className="lightning-strike-main absolute inset-0 z-[6]">
        <Bolt strike={strikes[0]} />
      </div>

      {/* Secondary distant bolt */}
      <div className="lightning-strike-secondary absolute inset-0 z-[4] blur-[0.4px]">
        <Bolt strike={strikes[1]} />
      </div>

      {/* Secondary afterglow */}
      <div className="lightning-afterglow absolute inset-0 z-[5] bg-white/[0.12]" />

      {/* Slight storm exposure shift */}
      <div className="lightning-exposure absolute inset-0 z-[7] bg-blue-50/[0.05] mix-blend-screen" />

      <style>{`
        .lightning-global-flash {
          opacity: 0;
          animation: lightning-global-flash 1.1s ease-out forwards;
        }

        .lightning-blue-flash {
          opacity: 0;
          animation: lightning-blue-flash 1.25s ease-out forwards;
        }

        .lightning-horizon-flash {
          opacity: 0;
          animation: lightning-horizon-flash 1.4s ease-out forwards;
        }

        .lightning-local-glow {
          opacity: 0;
          animation: lightning-local-glow 1.25s ease-out forwards;
        }

        .lightning-strike-main {
          opacity: 0;
          animation: lightning-main-strike 1.1s linear forwards;
        }

        .lightning-strike-secondary {
          opacity: 0;
          animation: lightning-secondary-strike 1.4s linear forwards;
        }

        .lightning-afterglow {
          opacity: 0;
          animation: lightning-afterglow 1.7s ease-out forwards;
        }

        .lightning-exposure {
          opacity: 0;
          animation: lightning-exposure 1.4s ease-out forwards;
        }

        .lightning-bolt {
          filter: drop-shadow(0 0 5px rgba(255,255,255,0.95)) drop-shadow(0 0 15px rgba(147,197,253,0.8)) drop-shadow(0 0 28px rgba(96,165,250,0.45));
        }

        @keyframes lightning-global-flash {
          0% {
            opacity: 0;
          }

          4% {
            opacity: 0.16;
          }

          8% {
            opacity: 0;
          }

          15% {
            opacity: 0.42;
          }

          20% {
            opacity: 0.05;
          }

          25% {
            opacity: 0.28;
          }

          38% {
            opacity: 0;
          }

          100% {
            opacity: 0;
          }
        }

        @keyframes lightning-blue-flash {
          0% {
            opacity: 0;
          }

          12% {
            opacity: 0.08;
          }

          17% {
            opacity: 0.32;
          }

          25% {
            opacity: 0.06;
          }

          42% {
            opacity: 0;
          }

          100% {
            opacity: 0;
          }
        }

        @keyframes lightning-horizon-flash {
          0% {
            opacity: 0;
          }

          13% {
            opacity: 0.08;
          }

          18% {
            opacity: 0.75;
          }

          26% {
            opacity: 0.12;
          }

          48% {
            opacity: 0;
          }

          100% {
            opacity: 0;
          }
        }

        @keyframes lightning-local-glow {
          0% {
            transform: scale(0.75);
            opacity: 0;
          }

          12% {
            transform: scale(0.9);
            opacity: 0.1;
          }

          17% {
            transform: scale(1);
            opacity: 0.85;
          }

          28% {
            transform: scale(1.08);
            opacity: 0.14;
          }

          50% {
            transform: scale(1.15);
            opacity: 0;
          }

          100% {
            opacity: 0;
          }
        }

        @keyframes lightning-main-strike {
          0% {
            opacity: 0;
          }

          11% {
            opacity: 0;
          }

          13% {
            opacity: 0.55;
          }

          15% {
            opacity: 0;
          }

          17% {
            opacity: 1;
          }

          21% {
            opacity: 0.18;
          }

          23% {
            opacity: 0.95;
          }

          29% {
            opacity: 0;
          }

          100% {
            opacity: 0;
          }
        }

        @keyframes lightning-secondary-strike {
          0% {
            opacity: 0;
          }

          24% {
            opacity: 0;
          }

          27% {
            opacity: 0.45;
          }

          30% {
            opacity: 0;
          }

          32% {
            opacity: 0.65;
          }

          38% {
            opacity: 0;
          }

          100% {
            opacity: 0;
          }
        }

        @keyframes lightning-afterglow {
          0% {
            opacity: 0;
          }

          16% {
            opacity: 0;
          }

          20% {
            opacity: 0.18;
          }

          30% {
            opacity: 0.04;
          }

          52% {
            opacity: 0;
          }

          100% {
            opacity: 0;
          }
        }

        @keyframes lightning-exposure {
          0% {
            opacity: 0;
          }

          15% {
            opacity: 0;
          }

          18% {
            opacity: 1;
          }

          30% {
            opacity: 0.15;
          }

          48% {
            opacity: 0;
          }

          100% {
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .lightning-global-flash,
          .lightning-blue-flash,
          .lightning-horizon-flash,
          .lightning-local-glow,
          .lightning-strike-main,
          .lightning-strike-secondary,
          .lightning-afterglow,
          .lightning-exposure {
            animation: none !important;
            opacity: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}