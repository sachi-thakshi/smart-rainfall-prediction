/**
 * Generic segmented pill tab switcher.
 * tabs: [{ id, label }]
 */
export default function Tabs({ tabs, activeId, onChange, className = "" }) {
  return (
    <div
      role="tablist"
      className={`clay-panel inline-flex w-full items-center gap-1 rounded-full p-1.5 sm:w-fit ${className}`}
    >
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            style={
              active
                ? {
                    background: "linear-gradient(135deg, var(--color-rice), var(--color-rice-dark))",
                    color: "#ffffff",
                    boxShadow: "0 4px 12px color-mix(in srgb, var(--color-rice-dark) 40%, transparent)",
                  }
                : undefined
            }
            className={`relative flex-1 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-300 sm:flex-none sm:px-5 ${
              active
                ? ""
                : "text-ink-muted hover:bg-rice/8 hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}