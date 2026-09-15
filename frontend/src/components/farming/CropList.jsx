import CropCard from "./CropCard.jsx";

export default function CropList({ crops, loading, error }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-19 animate-pulse rounded-leaf bg-ink/5" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="clay-panel px-4 py-3.5 text-sm text-alert-high">
        Couldn't load recommendations: {error}
      </p>
    );
  }

  if (crops.length === 0) {
    return (
      <p className="clay-panel px-4 py-3.5 text-sm text-ink-muted">
        No recommendations yet for this city and season.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {crops.map((c) => (
        <CropCard key={c.crop} crop={c.crop} confidence_percentage={c.confidence_percentage} />
      ))}
    </div>
  );
}