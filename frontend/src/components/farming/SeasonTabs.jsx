// import Tabs from "../ui/Tabs.jsx";

// const SEASONS = [
//   { id: "yala", label: "Yala (May–Aug)" },
//   { id: "maha", label: "Maha (Sep–Mar)" },
// ];

// export default function SeasonTabs({ activeSeason, onChange }) {
//   return <Tabs tabs={SEASONS} activeId={activeSeason} onChange={onChange} />;
// }

const SEASONS = [
  {
    id: "yala",
    label: "Yala",
    period: "May – Aug",
    icon: "☀️",
  },
  {
    id: "maha",
    label: "Maha",
    period: "Sep – Mar",
    icon: "🌧️",
  },
];

export default function SeasonTabs({ activeSeason, onChange }) {
  const activeIndex = SEASONS.findIndex((season) => season.id === activeSeason);

  return (
    <div role="tablist" aria-label="Select cultivation season" className="relative inline-flex min-w-[260px] items-center rounded-[22px] border border-white/[0.08] bg-black/20 p-1.5 shadow-[0_14px_40px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
      <div aria-hidden="true" className="pointer-events-none absolute bottom-1.5 top-1.5 w-[calc(50%-6px)] rounded-[17px] border border-emerald-300/10 bg-gradient-to-br from-emerald-300/15 via-white/[0.08] to-emerald-500/10 shadow-[0_10px_30px_rgba(16,185,129,0.12)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ transform: activeIndex === 0 ? "translateX(0)" : "translateX(calc(100% + 6px))" }} />

      {SEASONS.map((season) => {
        const active = activeSeason === season.id;

        return (
          <button key={season.id} type="button" role="tab" aria-selected={active} onClick={() => onChange(season.id)} className="relative z-10 flex flex-1 items-center justify-center gap-2.5 rounded-[17px] px-4 py-2.5 outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-emerald-300/50">
            <span className={`text-base transition-all duration-300 ${active ? "scale-110 opacity-100" : "scale-95 opacity-45"}`}>{season.icon}</span>

            <div className="flex flex-col items-start leading-none">
              <span className={`text-sm font-bold tracking-[-0.02em] transition-colors duration-300 ${active ? "text-white" : "text-white/45"}`}>{season.label}</span>
              <span className={`mt-1 text-[8px] font-bold uppercase tracking-[0.14em] transition-colors duration-300 ${active ? "text-emerald-300/70" : "text-white/20"}`}>{season.period}</span>
            </div>

            {active && (
              <span className="absolute right-3 top-3 flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-40" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}