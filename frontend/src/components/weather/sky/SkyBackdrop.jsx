import CloudLayer from "./CloudLayer.jsx";
import RainLayer from "./RainLayer.jsx";
import LightningLayer from "./LightningLayer.jsx";
import SunRays from "./SunRays.jsx";
import WindLines from "./WindLines.jsx";

const CONDITION_CONFIG = {
  clear: {
    topGlow: "bg-sky-300/20",
    sideGlow: "bg-cyan-200/15",
    horizon: "from-sky-200/10 via-cyan-100/5 to-transparent",
    atmosphere: "opacity-40",
    vignette: "from-slate-950/25 via-transparent to-slate-950/10",
  },
  hot: {
    topGlow: "bg-amber-300/25",
    sideGlow: "bg-orange-300/15",
    horizon: "from-amber-200/15 via-orange-100/5 to-transparent",
    atmosphere: "opacity-50",
    vignette: "from-orange-950/20 via-transparent to-slate-950/10",
  },
  rainy: {
    topGlow: "bg-sky-900/25",
    sideGlow: "bg-blue-400/10",
    horizon: "from-sky-500/10 via-blue-300/5 to-transparent",
    atmosphere: "opacity-60",
    vignette: "from-slate-950/50 via-slate-950/5 to-slate-950/25",
  },
  severe: {
    topGlow: "bg-indigo-950/45",
    sideGlow: "bg-violet-500/10",
    horizon: "from-indigo-600/10 via-blue-500/5 to-transparent",
    atmosphere: "opacity-80",
    vignette: "from-black/65 via-slate-950/15 to-black/45",
  },
};

export default function SkyBackdrop({ token = "clear", windy = false }) {
  const normalizedToken = CONDITION_CONFIG[token] ? token : "clear";
  const config = CONDITION_CONFIG[normalizedToken];

  const showSun = normalizedToken === "clear" || normalizedToken === "hot";
  const showClouds = normalizedToken !== "hot";
  const showRain = normalizedToken === "rainy" || normalizedToken === "severe";
  const showLightning = normalizedToken === "severe";
  const showWind = windy || normalizedToken === "clear" || normalizedToken === "severe";

  return (
    <div className="pointer-events-none absolute inset-0 isolate overflow-hidden transition-all duration-1000" aria-hidden="true">
      {/* Base atmospheric depth */}
      <div className="absolute inset-0">
        <div className={`absolute -left-[15%] -top-[25%] h-[650px] w-[650px] rounded-full blur-[150px] transition-colors duration-[1600ms] ${config.topGlow}`} />
        <div className={`absolute -right-[18%] top-[18%] h-[550px] w-[550px] rounded-full blur-[160px] transition-colors duration-[1600ms] ${config.sideGlow}`} />
      </div>

      {/* Slowly moving atmospheric glow */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${config.atmosphere}`}>
        <div className="absolute left-[5%] top-[15%] h-[320px] w-[520px] animate-[sky-drift-a_18s_ease-in-out_infinite] rounded-full bg-white/[0.035] blur-[90px]" />
        <div className="absolute right-[4%] top-[35%] h-[280px] w-[450px] animate-[sky-drift-b_22s_ease-in-out_infinite] rounded-full bg-cyan-100/[0.025] blur-[100px]" />
      </div>

      {/* Sun system */}
      {showSun && (
        <div className="absolute inset-0 transition-opacity duration-1000">
          <SunRays intense={normalizedToken === "hot"} />
        </div>
      )}

      {/* Clouds */}
      {showClouds && (
        <div className="absolute inset-0 transition-opacity duration-1000">
          <CloudLayer dense={normalizedToken === "severe"} dim={showRain} />
        </div>
      )}

      {/* Wind */}
      {showWind && (
        <div className="absolute inset-0">
          <WindLines active={showWind} />
        </div>
      )}

      {/* Rain */}
      {showRain && (
        <div className="absolute inset-0">
          <RainLayer heavy={normalizedToken === "severe"} />
        </div>
      )}

      {/* Storm flash */}
      {showLightning && (
        <div className="absolute inset-0">
          <LightningLayer />
        </div>
      )}

      {/* Horizon illumination */}
      <div className={`absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t transition-all duration-[1600ms] ${config.horizon}`} />

      {/* Soft center illumination keeps hero readable */}
      <div className="absolute left-1/2 top-[48%] h-[420px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.025] blur-[120px]" />

      {/* Atmospheric grain */}
      <div className="absolute inset-0 opacity-[0.035] mix-blend-soft-light [background-image:url('data:image/svg+xml,%3Csvg_viewBox=%220_0_180_180%22_xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter_id=%22noise%22%3E%3CfeTurbulence_type=%22fractalNoise%22_baseFrequency=%220.8%22_numOctaves=%224%22_stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect_width=%22100%25%22_height=%22100%25%22_filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />

      {/* Top depth */}
      <div className="absolute inset-x-0 top-0 h-[28%] bg-gradient-to-b from-black/10 to-transparent" />

      {/* Final readability vignette */}
      <div className={`absolute inset-0 bg-gradient-to-t transition-colors duration-[1400ms] ${config.vignette}`} />

      {/* Edge vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_180px_rgba(0,0,0,0.12)]" />

      <style>{`
        @keyframes sky-drift-a {
          0%, 100% {
            transform: translate3d(-4%, -3%, 0) scale(1);
          }

          50% {
            transform: translate3d(10%, 7%, 0) scale(1.08);
          }
        }

        @keyframes sky-drift-b {
          0%, 100% {
            transform: translate3d(5%, 4%, 0) scale(1.05);
          }

          50% {
            transform: translate3d(-10%, -5%, 0) scale(0.94);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          [class*="sky-drift"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}