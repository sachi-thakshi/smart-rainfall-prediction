export default function WindLines({ active = false }) {
  if (!active) return null;

  const lines = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    top: 25 + Math.random() * 45,
    width: 60 + Math.random() * 120,
    duration: 4 + Math.random() * 3,
    delay: -Math.random() * 6,
    thickness: Math.random() > 0.5 ? 1 : 1.5,
  }));

  return (
    <>
      {lines.map((l) => (
        <span
          key={l.id}
          className="absolute rounded-full bg-white/35"
          style={{
            top: `${l.top}%`,
            left: 0,
            width: l.width,
            height: l.thickness,
            filter: "blur(0.5px)",
            animation: `wind-drift ${l.duration}s ease-in-out infinite`,
            animationDelay: `${l.delay}s`,
          }}
        />
      ))}
    </>
  );
}