export default function DayToggle({ value, onChange }) {
  const isToday = value === "today";

  return (
    <div
      role="tablist"
      aria-label="Select forecast day"
      className="glass-panel relative inline-flex rounded-full p-1"
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-white transition-transform duration-300 ease-out"
        style={{ transform: isToday ? "translateX(0)" : "translateX(calc(100% + 8px))" }}
      />
      {["today", "tomorrow"].map((day) => (
        <button
          key={day}
          role="tab"
          aria-selected={value === day}
          onClick={() => onChange(day)}
          className={`relative z-10 w-24 rounded-full py-1.5 text-sm font-medium capitalize transition-colors duration-300 ${
            value === day ? "text-ink" : "text-white/85"
          }`}
        >
          {day}
        </button>
      ))}
    </div>
  );
}
