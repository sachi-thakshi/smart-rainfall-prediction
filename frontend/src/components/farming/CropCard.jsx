import { useEffect, useState } from "react";
import { Check, Sparkles, TrendingUp } from "lucide-react";
import Card from "../ui/Card.jsx";
import CountUp from "../reactbits/CountUp.jsx";

const CROP_ICONS = {
  COCONUT: "🥥",
  RICE: "🌾",
  MAIZE: "🌽",
  CINNAMON: "🌿",
  CHILLI: "🌶️",
  "GREEN GRAM": "🫘",
};

function getConfidenceMeta(value) {
  const confidence = Number(value) || 0;

  if (confidence >= 85) {
    return {
      label: "Excellent Match",
      badge: "border-emerald-300/15 bg-emerald-300/10 text-emerald-300",
      bar: "from-emerald-300 via-emerald-400 to-teal-400",
      glow: "bg-emerald-400/15",
      dot: "bg-emerald-300",
    };
  }

  if (confidence >= 70) {
    return {
      label: "Strong Match",
      badge: "border-lime-300/15 bg-lime-300/10 text-lime-300",
      bar: "from-lime-300 via-emerald-300 to-emerald-400",
      glow: "bg-lime-400/10",
      dot: "bg-lime-300",
    };
  }

  if (confidence >= 50) {
    return {
      label: "Moderate Match",
      badge: "border-amber-300/15 bg-amber-300/10 text-amber-300",
      bar: "from-amber-300 via-yellow-300 to-orange-300",
      glow: "bg-amber-400/10",
      dot: "bg-amber-300",
    };
  }

  return {
    label: "Low Match",
    badge: "border-white/10 bg-white/[0.05] text-white/45",
    bar: "from-slate-400 to-slate-300",
    glow: "bg-white/[0.04]",
    dot: "bg-slate-300",
  };
}

export default function CropCard({ crop, confidence_percentage, rank, featured = false }) {
  const [progress, setProgress] = useState(0);

  const confidence = Math.max(0, Math.min(Number(confidence_percentage) || 0, 100));
  const icon = CROP_ICONS[String(crop).toUpperCase()] ?? "🌱";
  const label = formatCropName(crop);
  const meta = getConfidenceMeta(confidence);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setProgress(confidence);
    }, 180);

    return () => {
      window.clearTimeout(timer);
    };
  }, [confidence]);

  return (
    <Card leaf className={`group relative overflow-hidden border p-0 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(0,0,0,0.18)] ${featured ? "border-emerald-300/20 bg-emerald-300/[0.055]" : "border-white/[0.07] bg-white/[0.035] hover:border-white/[0.12] hover:bg-white/[0.055]"}`}>
      <div className={`pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full blur-[55px] transition-transform duration-700 group-hover:scale-125 ${meta.glow}`} />

      {featured && <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent" />}

      <div className="relative z-10 flex items-center gap-4 p-4 sm:p-5">
        <div className="relative shrink-0">
          <div className={`flex h-14 w-14 items-center justify-center rounded-[18px] border text-2xl shadow-lg transition-all duration-500 group-hover:-translate-y-1 group-hover:scale-105 sm:h-16 sm:w-16 sm:text-3xl ${featured ? "border-emerald-300/15 bg-emerald-300/10" : "border-white/[0.07] bg-white/[0.045]"}`}>
            {icon}
          </div>

          <div className="absolute -left-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-[#102018] text-[8px] font-black text-white/55 shadow-lg">{String(rank || 1).padStart(2, "0")}</div>

          {featured && (
            <div className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#0b1711] bg-emerald-400 text-[#07150f] shadow-[0_0_18px_rgba(52,211,153,0.5)]">
              <Check className="h-3 w-3 stroke-[3]" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h5 className="truncate text-base font-bold tracking-[-0.025em] text-white sm:text-lg">{label}</h5>

                {featured && <Sparkles className="h-3.5 w-3.5 shrink-0 text-emerald-300" />}
              </div>

              <div className="mt-1.5 flex items-center gap-2">
                <span className={`relative flex h-1.5 w-1.5 rounded-full ${meta.dot}`}>
                  {featured && <span className={`absolute h-full w-full animate-ping rounded-full opacity-40 ${meta.dot}`} />}
                </span>

                <span className="text-[10px] font-medium text-white/35">Recommendation confidence</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div className={`rounded-full border px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.12em] ${meta.badge}`}>{meta.label}</div>

              <div className="min-w-[48px] text-right">
                <CountUp from={0} to={confidence} duration={1.3} decimals={0} suffix="%" className="text-lg font-black tracking-[-0.04em] text-white sm:text-xl" />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="relative h-1.5 overflow-hidden rounded-full bg-white/[0.055]">
              <div className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-[width] duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${meta.bar}`} style={{ width: `${progress}%` }} />

              <div className="absolute inset-y-0 left-1/2 w-px bg-white/10" />
              <div className="absolute inset-y-0 left-3/4 w-px bg-white/10" />
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-white/20">0</span>

              <div className="flex items-center gap-1.5 text-[9px] font-semibold text-white/30">
                <TrendingUp className="h-3 w-3" />
                Model confidence
              </div>

              <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-white/20">100</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function formatCropName(crop = "") {
  return String(crop)
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}