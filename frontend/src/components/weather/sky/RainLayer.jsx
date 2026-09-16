import { useMemo } from "react";

function createDrops(count, heavy, layer) {
  return Array.from({ length: count }, (_, index) => {
    const depth = Math.random();

    const configs = {
      far: {
        minLength: 10,
        maxLength: heavy ? 22 : 17,
        minDuration: heavy ? 0.8 : 1.05,
        maxDuration: heavy ? 1.25 : 1.6,
        minOpacity: 0.08,
        maxOpacity: 0.2,
        minWidth: 0.6,
        maxWidth: 0.9,
        blur: 1.3,
      },
      mid: {
        minLength: 18,
        maxLength: heavy ? 38 : 28,
        minDuration: heavy ? 0.48 : 0.7,
        maxDuration: heavy ? 0.8 : 1.05,
        minOpacity: 0.18,
        maxOpacity: heavy ? 0.48 : 0.36,
        minWidth: 0.9,
        maxWidth: 1.35,
        blur: 0.45,
      },
      front: {
        minLength: 28,
        maxLength: heavy ? 58 : 42,
        minDuration: heavy ? 0.3 : 0.5,
        maxDuration: heavy ? 0.5 : 0.72,
        minOpacity: 0.3,
        maxOpacity: heavy ? 0.72 : 0.55,
        minWidth: 1.2,
        maxWidth: heavy ? 2.1 : 1.7,
        blur: 0,
      },
    };

    const config = configs[layer];

    return {
      id: `${layer}-${index}`,
      left: Math.random() * 108 - 4,
      top: Math.random() * -80,
      length: config.minLength + Math.random() * (config.maxLength - config.minLength),
      duration: config.minDuration + Math.random() * (config.maxDuration - config.minDuration),
      delay: Math.random() * -3,
      opacity: config.minOpacity + depth * (config.maxOpacity - config.minOpacity),
      width: config.minWidth + depth * (config.maxWidth - config.minWidth),
      blur: config.blur,
      drift: (heavy ? 90 : 55) + Math.random() * (heavy ? 70 : 45),
      sway: Math.random() * 10 - 5,
    };
  });
}

function RainDepthLayer({ drops, className = "" }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {drops.map((drop) => (
        <span
          key={drop.id}
          className="smart-rain-drop absolute block rounded-full will-change-transform"
          style={{
            left: `${drop.left}%`,
            top: `${drop.top}%`,
            width: `${drop.width}px`,
            height: `${drop.length}px`,
            opacity: drop.opacity,
            filter: drop.blur ? `blur(${drop.blur}px)` : undefined,
            animationDuration: `${drop.duration}s`,
            animationDelay: `${drop.delay}s`,
            "--rain-drift": `${drop.drift}px`,
            "--rain-sway": `${drop.sway}px`,
          }}
        />
      ))}
    </div>
  );
}

function GroundMist({ heavy }) {
  return (
    <div className="absolute inset-x-0 bottom-0 h-[32%] overflow-hidden">
      <div className={`absolute inset-x-0 bottom-0 h-full bg-gradient-to-t transition-opacity duration-1000 ${heavy ? "from-white/[0.14] via-sky-100/[0.045] to-transparent" : "from-white/[0.07] via-sky-100/[0.02] to-transparent"}`} />

      <div className={`absolute -bottom-16 left-[-15%] h-48 w-[70%] animate-[rain-mist-left_14s_ease-in-out_infinite] rounded-full blur-[70px] ${heavy ? "bg-slate-200/15" : "bg-white/[0.07]"}`} />

      <div className={`absolute -bottom-20 right-[-20%] h-52 w-[75%] animate-[rain-mist-right_18s_ease-in-out_infinite] rounded-full blur-[80px] ${heavy ? "bg-blue-100/10" : "bg-sky-100/[0.05]"}`} />
    </div>
  );
}

function SplashLayer({ heavy }) {
  const splashes = useMemo(() => {
    const count = heavy ? 18 : 9;

    return Array.from({ length: count }, (_, index) => ({
      id: index,
      left: Math.random() * 100,
      bottom: Math.random() * 12,
      width: 10 + Math.random() * (heavy ? 20 : 12),
      duration: 1.2 + Math.random() * 1.6,
      delay: Math.random() * -3,
      opacity: 0.1 + Math.random() * (heavy ? 0.28 : 0.15),
    }));
  }, [heavy]);

  return (
    <div className="absolute inset-x-0 bottom-0 h-[16%] overflow-hidden">
      {splashes.map((splash) => (
        <span
          key={splash.id}
          className="smart-rain-splash absolute block rounded-[50%] border-t border-white"
          style={{
            left: `${splash.left}%`,
            bottom: `${splash.bottom}%`,
            width: `${splash.width}px`,
            height: `${Math.max(3, splash.width * 0.2)}px`,
            opacity: splash.opacity,
            animationDuration: `${splash.duration}s`,
            animationDelay: `${splash.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function RainLayer({ heavy = false }) {
  const farDrops = useMemo(() => createDrops(heavy ? 65 : 32, heavy, "far"), [heavy]);
  const midDrops = useMemo(() => createDrops(heavy ? 75 : 40, heavy, "mid"), [heavy]);
  const frontDrops = useMemo(() => createDrops(heavy ? 42 : 20, heavy, "front"), [heavy]);

  return (
    <div className="absolute inset-0 isolate overflow-hidden">
      {/* Distant rain */}
      <RainDepthLayer drops={farDrops} className="z-[1]" />

      {/* Mid-distance rainfall */}
      <RainDepthLayer drops={midDrops} className="z-[3]" />

      {/* Subtle atmospheric rainfall veil */}
      <div className={`absolute inset-0 z-[4] transition-opacity duration-700 ${heavy ? "opacity-100" : "opacity-50"}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-sky-100/[0.02] to-white/[0.035]" />
      </div>

      {/* Close rain streaks */}
      <RainDepthLayer drops={frontDrops} className="z-[6]" />

      {/* Fast foreground streaks during storms */}
      {heavy && (
        <div className="absolute inset-0 z-[7] overflow-hidden opacity-40">
          <div className="animate-[storm-rain-sheet_2.8s_linear_infinite] absolute -left-[30%] -top-[20%] h-[140%] w-[160%] bg-[repeating-linear-gradient(105deg,transparent_0px,transparent_13px,rgba(255,255,255,0.07)_14px,transparent_15px)]" />
        </div>
      )}

      {/* Ground moisture */}
      <div className="absolute inset-0 z-[8]">
        <GroundMist heavy={heavy} />
      </div>

      {/* Tiny rain impacts near bottom */}
      <div className="absolute inset-0 z-[9]">
        <SplashLayer heavy={heavy} />
      </div>

      {/* Storm lower haze */}
      {heavy && <div className="absolute inset-x-0 bottom-0 z-[10] h-[20%] bg-gradient-to-t from-slate-950/10 to-transparent" />}

      <style>{`
        .smart-rain-drop {
          background: linear-gradient(
            to bottom,
            rgba(255,255,255,0),
            rgba(220,240,255,0.18) 18%,
            rgba(235,248,255,0.8) 82%,
            rgba(255,255,255,0.95)
          );

          transform: rotate(-10deg);
          animation-name: smart-rain-fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        @keyframes smart-rain-fall {
          0% {
            transform: translate3d(0, -15vh, 0) rotate(-10deg);
          }

          100% {
            transform: translate3d(
              var(--rain-drift),
              125vh,
              0
            ) rotate(-10deg);
          }
        }

        .smart-rain-splash {
          animation-name: smart-rain-splash;
          animation-timing-function: ease-out;
          animation-iteration-count: infinite;
          transform-origin: center;
        }

        @keyframes smart-rain-splash {
          0% {
            transform: scaleX(0.15) scaleY(0.3);
            opacity: 0;
          }

          20% {
            opacity: 0.5;
          }

          65% {
            transform: scaleX(1) scaleY(1);
            opacity: 0.16;
          }

          100% {
            transform: scaleX(1.35) scaleY(0.7);
            opacity: 0;
          }
        }

        @keyframes rain-mist-left {
          0%, 100% {
            transform: translate3d(-5%, 0, 0) scale(1);
            opacity: 0.65;
          }

          50% {
            transform: translate3d(16%, -6%, 0) scale(1.12);
            opacity: 1;
          }
        }

        @keyframes rain-mist-right {
          0%, 100% {
            transform: translate3d(8%, 3%, 0) scale(1.08);
            opacity: 0.6;
          }

          50% {
            transform: translate3d(-15%, -5%, 0) scale(0.95);
            opacity: 0.95;
          }
        }

        @keyframes storm-rain-sheet {
          0% {
            transform: translate3d(-2%, -8%, 0);
          }

          100% {
            transform: translate3d(10%, 12%, 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .smart-rain-drop,
          .smart-rain-splash {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}