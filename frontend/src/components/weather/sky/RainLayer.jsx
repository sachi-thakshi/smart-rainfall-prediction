export default function RainLayer({ heavy = false }) {
  const count = heavy ? 90 : 50;

  const drops = Array.from({ length: count }, (_, i) => {
    const layer = Math.random(); // 0 = far/faint, 1 = near/sharp
    return {
      id: i,
      left: Math.random() * 100,
      length: 14 + layer * (heavy ? 34 : 22),
      duration: (heavy ? 0.45 : 0.75) + (1 - layer) * 0.5,
      delay: Math.random() * 2,
      opacity: 0.25 + layer * (heavy ? 0.55 : 0.4),
      blur: (1 - layer) * 1.4,
      drift: heavy ? 14 : 8, // horizontal drift = wind-driven rain angle
    };
  });

  return (
    <div className="absolute inset-0 overflow-hidden">
      {drops.map((d) => (
        <span
          key={d.id}
          className="absolute top-[-8%] block rounded-full"
          style={{
            left: `${d.left}%`,
            width: heavy ? 2 : 1.4,
            height: d.length,
            opacity: d.opacity,
            filter: d.blur ? `blur(${d.blur}px)` : "none",
            background: "linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.9))",
            animation: `rain-drop ${d.duration}s linear infinite`,
            animationDelay: `${d.delay}s`,
            // Custom property picked up by the keyframe below for the wind-angle drift
            "--drift": `${d.drift}px`,
          }}
        />
      ))}

      {/* Faint rising mist near the bottom, stronger for heavy rain */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/4"
        style={{
          background: `linear-gradient(to top, rgba(255,255,255,${heavy ? 0.1 : 0.06}), transparent)`,
        }}
      />
    </div>
  );
}