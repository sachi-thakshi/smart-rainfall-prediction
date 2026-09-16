// import CropCard from "./CropCard.jsx";

// export default function CropList({ crops, loading, error }) {
//   if (loading) {
//     return (
//       <div className="space-y-3">
//         {[0, 1, 2].map((i) => (
//           <div key={i} className="h-19 animate-pulse rounded-leaf bg-ink/5" />
//         ))}
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <p className="clay-panel px-4 py-3.5 text-sm text-alert-high">
//         Couldn't load recommendations: {error}
//       </p>
//     );
//   }

//   if (crops.length === 0) {
//     return (
//       <p className="clay-panel px-4 py-3.5 text-sm text-ink-muted">
//         No recommendations yet for this city and season.
//       </p>
//     );
//   }

//   return (
//     <div className="space-y-3">
//       {crops.map((c) => (
//         <CropCard key={c.crop} crop={c.crop} confidence_percentage={c.confidence_percentage} />
//       ))}
//     </div>
//   );
// }

import CropCard from "./CropCard.jsx";
import AnimatedContent from "../reactbits/AnimatedContent.jsx";
import { Leaf, Sparkles, TriangleAlert } from "lucide-react";

export default function CropList({ crops = [], loading, error }) {
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="h-3 w-28 animate-pulse rounded-full bg-white/10" />
            <div className="mt-2 h-6 w-48 animate-pulse rounded-lg bg-white/10" />
          </div>

          <div className="h-8 w-24 animate-pulse rounded-full bg-white/10" />
        </div>

        {[0, 1, 2].map((item) => (
          <div key={item} className="relative h-[112px] overflow-hidden rounded-[26px] border border-white/[0.07] bg-white/[0.04]">
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

            <div className="flex h-full items-center gap-4 p-4">
              <div className="h-14 w-14 shrink-0 animate-pulse rounded-2xl bg-white/[0.08]" />

              <div className="flex-1">
                <div className="h-3 w-20 animate-pulse rounded-full bg-white/[0.08]" />
                <div className="mt-2 h-5 w-36 animate-pulse rounded-lg bg-white/[0.08]" />
                <div className="mt-4 h-1.5 w-full animate-pulse rounded-full bg-white/[0.06]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <AnimatedContent distance={25} direction="vertical" duration={0.7} ease="power3.out" initialOpacity={0}>
        <div className="flex min-h-[220px] items-center justify-center rounded-[30px] border border-rose-400/15 bg-rose-400/[0.05] px-6 text-center">
          <div>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-400/10 text-rose-300">
              <TriangleAlert className="h-5 w-5" />
            </div>

            <h4 className="mt-4 text-sm font-bold text-white">Recommendations unavailable</h4>

            <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-white/35">We couldn't load crop recommendations for the selected city and season.</p>

            <p className="mt-2 text-[10px] text-rose-300/60">{error}</p>
          </div>
        </div>
      </AnimatedContent>
    );
  }

  if (!crops.length) {
    return (
      <AnimatedContent distance={25} direction="vertical" duration={0.7} ease="power3.out" initialOpacity={0}>
        <div className="flex min-h-[240px] items-center justify-center rounded-[30px] border border-dashed border-white/10 bg-white/[0.025] px-6 text-center">
          <div>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.04] text-emerald-300">
              <Leaf className="h-6 w-6" />
            </div>

            <h4 className="mt-5 text-sm font-bold text-white">No crop matches yet</h4>

            <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-white/35">No recommendations are currently available for this city and growing season.</p>
          </div>
        </div>
      </AnimatedContent>
    );
  }

  const sortedCrops = [...crops].sort((a, b) => Number(b.confidence_percentage || 0) - Number(a.confidence_percentage || 0));

  const topCrop = sortedCrops[0];

  return (
    <div className="w-full">
      <AnimatedContent distance={20} direction="vertical" duration={0.65} ease="power3.out" initialOpacity={0}>
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-300/70">AI Crop Matching</span>
            </div>

            <h4 className="mt-2 text-xl font-bold tracking-[-0.03em] text-white">Best crops for current conditions</h4>

            <p className="mt-1 text-xs leading-5 text-white/35">Recommendations ranked using the current prediction confidence.</p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.04] px-3 py-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-40" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
            </span>

            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/40">{sortedCrops.length} Matches</span>
          </div>
        </div>
      </AnimatedContent>

      {topCrop && (
        <AnimatedContent distance={30} direction="vertical" duration={0.75} delay={0.05} ease="power3.out" initialOpacity={0}>
          <div className="mb-3 flex items-center justify-between rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.04] px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs">🌱</span>
              <span className="text-[10px] font-semibold text-white/45">Highest match</span>
            </div>

            <span className="text-[10px] font-bold text-emerald-300">{formatCropName(topCrop.crop)}</span>
          </div>
        </AnimatedContent>
      )}

      <div className="space-y-3">
        {sortedCrops.map((crop, index) => (
          <AnimatedContent key={crop.crop} distance={35} direction="vertical" duration={0.7} delay={0.08 + index * 0.07} ease="power3.out" initialOpacity={0}>
            <CropCard crop={crop.crop} confidence_percentage={crop.confidence_percentage} rank={index + 1} featured={index === 0} />
          </AnimatedContent>
        ))}
      </div>
    </div>
  );
}

function formatCropName(crop = "") {
  return crop
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}