import Card from "../ui/Card.jsx";

const CROP_ICONS = {
  COCONUT: "🥥",
  RICE: "🌾",
  MAIZE: "🌽",
  CINNAMON: "🌿",
  CHILLI: "🌶️",
  "GREEN GRAM": "🫘",
};

export default function CropCard({ crop, confidence_percentage }) {
  const icon = CROP_ICONS[crop] ?? "🌱";
  const label = crop.charAt(0) + crop.slice(1).toLowerCase();

  return (
    <Card leaf className="flex items-center gap-3 border border-ink/5 px-4 py-3.5">
      <span className="text-2xl" aria-hidden="true">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">{label}</p>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-rice/10">
          <div
            className="h-full rounded-full bg-rice"
            style={{ width: `${confidence_percentage}%` }}
          />
        </div>
      </div>
      <span className="shrink-0 font-display text-sm font-semibold text-rice-dark">
        {confidence_percentage.toFixed(0)}%
      </span>
    </Card>
  );
}
