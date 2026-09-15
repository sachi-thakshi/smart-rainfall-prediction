import Tabs from "../ui/Tabs.jsx";

const SEASONS = [
  { id: "yala", label: "Yala (May–Aug)" },
  { id: "maha", label: "Maha (Sep–Mar)" },
];

export default function SeasonTabs({ activeSeason, onChange }) {
  return <Tabs tabs={SEASONS} activeId={activeSeason} onChange={onChange} />;
}
