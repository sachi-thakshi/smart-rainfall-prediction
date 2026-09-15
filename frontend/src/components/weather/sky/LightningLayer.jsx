import { useEffect, useState } from "react";

function Bolt({ left, delayClass }) {
  return (
    <svg
      viewBox="0 0 60 160"
      className={`absolute top-0 ${delayClass}`}
      style={{ left: `${left}%`, width: 50, height: 140, opacity: 0 }}
    >
      <polygon
        points="30,0 10,70 26,70 14,160 50,60 32,60 44,0"
        fill="white"
        style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.9))" }}
      />
    </svg>
  );
}

export default function LightningLayer() {
  // Re-randomize bolt position every cycle so strikes don't feel mechanical
  const [bolts] = useState(() => [
    { left: 15 + Math.random() * 20, delayClass: "bolt-strike-a" },
    { left: 55 + Math.random() * 25, delayClass: "bolt-strike-b" },
  ]);

  return (
    <>
      <div className="lightning-flash" />
      {bolts.map((b, i) => (
        <Bolt key={i} left={b.left} delayClass={b.delayClass} />
      ))}
    </>
  );
}