import CloudLayer from "./CloudLayer.jsx";
import RainLayer from "./RainLayer.jsx";
import LightningLayer from "./LightningLayer.jsx";
import SunRays from "./SunRays.jsx";
import WindLines from "./WindLines.jsx";

/**
 * Picks which decorative sky layers to render for a weather condition token.
 * token: "clear" | "hot" | "rainy" | "severe" (matches global.css [data-condition])
 */
export default function SkyBackdrop({ token = "clear", windy = false }) {
  const showSun = token === "clear" || token === "hot";
  const showClouds = token !== "hot";
  const showRain = token === "rainy" || token === "severe";
  const showLightning = token === "severe";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {showSun && <SunRays intense={token === "hot"} />}
      {showClouds && <CloudLayer dense={token === "severe"} dim={showRain} />}
      {showRain && <RainLayer heavy={token === "severe"} />}
      {showLightning && <LightningLayer />}
      <WindLines active={windy || token === "clear"} />

      {/* Vignette so foreground text stays legible over any sky */}
      <div className="absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-black/10" />
    </div>
  );
}