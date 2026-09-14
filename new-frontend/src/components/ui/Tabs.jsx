/**
 * Generic underline tab switcher.
 * tabs: [{ id, label }]
 */
export default function Tabs({ tabs, activeId, onChange, className = "" }) {
  return (
    <div className={`flex gap-6 border-b border-ink/10 ${className}`} role="tablist">
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`relative pb-3 text-sm font-medium transition-colors duration-200 ${
              active ? "text-rice-dark" : "text-ink-muted hover:text-ink"
            }`}
          >
            {tab.label}
            {active && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-rice" />
            )}
          </button>
        );
      })}
    </div>
  );
}
