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
    <Card
      leaf
      className="clay-panel flex items-center gap-3.5 px-4 py-4 transition-transform duration-200 hover:-translate-y-0.5"
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rice/10 text-2xl"
        aria-hidden="true"
      >
        {icon}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-medium text-ink">{label}</p>
          <span className="shrink-0 font-display text-sm font-semibold text-rice-dark">
            {confidence_percentage.toFixed(0)}%
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-rice/10">
          <div
            className="h-full rounded-full bg-linear-to-r from-rice to-rice-dark transition-all duration-500"
            style={{ width: `${confidence_percentage}%` }}
          />
        </div>
      </div>
    </Card>
  );
}