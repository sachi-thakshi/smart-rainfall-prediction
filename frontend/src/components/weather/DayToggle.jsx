// export default function DayToggle({ value, onChange }) {
//   const isToday = value === "today";

//   return (
//     <div
//       role="tablist"
//       aria-label="Select forecast day"
//       className="glass-panel relative inline-flex rounded-full p-1"
//     >
//       <span
//         aria-hidden="true"
//         className="absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-white transition-transform duration-300 ease-out"
//         style={{ transform: isToday ? "translateX(0)" : "translateX(calc(100% + 8px))" }}
//       />
//       {["today", "tomorrow"].map((day) => (
//         <button
//           key={day}
//           role="tab"
//           aria-selected={value === day}
//           onClick={() => onChange(day)}
//           className={`relative z-10 w-24 rounded-full py-1.5 text-sm font-medium capitalize transition-colors duration-300 ${
//             value === day ? "text-ink" : "text-white/85"
//           }`}
//         >
//           {day}
//         </button>
//       ))}
//     </div>
//   );
// }

export default function DayToggle({ value, onChange }) {
  const isToday = value === "today";

  const days = [
    {
      key: "today",
      label: "Today",
      subLabel: "Current",
    },
    {
      key: "tomorrow",
      label: "Tomorrow",
      subLabel: "Next",
    },
  ];

  return (
    <div role="tablist" aria-label="Select forecast day" className="relative inline-flex min-w-[250px] items-center rounded-full border border-white/15 bg-black/10 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.15)] backdrop-blur-2xl">
      <div aria-hidden="true" className={`pointer-events-none absolute inset-y-1.5 left-1.5 w-[calc(50%-6px)] rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.16)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isToday ? "translate-x-0" : "translate-x-[calc(100%+6px)]"}`}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white via-white to-sky-50" />
        <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-sky-200/80 to-transparent" />
      </div>

      {days.map((day) => {
        const active = value === day.key;

        return (
          <button key={day.key} type="button" role="tab" aria-selected={active} onClick={() => onChange(day.key)} className="relative z-10 flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-2.5 outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-white/60">
            <span className={`relative flex h-2 w-2 items-center justify-center rounded-full transition-all duration-300 ${active ? "bg-sky-500" : "bg-white/35"}`}>
              {active && <span className="absolute h-full w-full animate-ping rounded-full bg-sky-400 opacity-40" />}
            </span>

            <div className="flex flex-col items-start leading-none">
              <span className={`text-sm font-semibold tracking-[-0.02em] transition-colors duration-300 ${active ? "text-slate-950" : "text-white/80"}`}>{day.label}</span>
              <span className={`mt-1 text-[9px] font-bold uppercase tracking-[0.16em] transition-colors duration-300 ${active ? "text-slate-400" : "text-white/30"}`}>{day.subLabel}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
