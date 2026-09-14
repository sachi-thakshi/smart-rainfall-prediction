export default function Input({ value, onChange, onClear, placeholder, className = "" }) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="pointer-events-none absolute left-3.5 h-4 w-4 text-white/70"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="9" cy="9" r="6" />
        <path d="M17 17l-3.5-3.5" strokeLinecap="round" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="glass-panel w-full rounded-full py-2.5 pl-9 pr-9 text-sm text-white
          placeholder-white/60 outline-none focus-visible:ring-2 focus-visible:ring-white/50"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={onClear}
          className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full
            text-white/70 hover:text-white"
        >
          ✕
        </button>
      )}
    </div>
  );
}
