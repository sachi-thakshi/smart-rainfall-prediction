function Cloud({ style, opacity, scale = 1 }) {
  // Multiple overlapping soft blobs, each with its own highlight/shadow,
  // gives the cloud a puffy 3D read instead of one flat gradient disc.
  return (
    <div
      className="cloud-drift absolute"
      style={{ ...style, opacity }}
    >
      <div
        style={{
          position: "relative",
          width: `${160 * scale}px`,
          height: `${70 * scale}px`,
        }}
      >
        {[
          { l: "0%", t: "35%", w: 70, h: 55, light: 0.95 },
          { l: "18%", t: "10%", w: 95, h: 75, light: 1 },
          { l: "42%", t: "0%", w: 110, h: 85, light: 1 },
          { l: "62%", t: "20%", w: 85, h: 65, light: 0.92 },
          { l: "78%", t: "38%", w: 60, h: 48, light: 0.85 },
        ].map((b, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: b.l,
              top: b.t,
              width: `${b.w * scale}px`,
              height: `${b.h * scale}px`,
              borderRadius: "50%",
              background: `radial-gradient(circle at 42% 32%, rgba(255,255,255,${b.light}) 0%, rgba(255,255,255,0.75) 45%, rgba(215,225,235,0.35) 78%, rgba(215,225,235,0) 100%)`,
              filter: "blur(3px)",
            }}
          />
        ))}
        {/* Soft shadow strip under the cloud body for depth */}
        <div
          style={{
            position: "absolute",
            left: "8%",
            bottom: "-6%",
            width: "84%",
            height: "38%",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(90,110,135,0.25) 0%, rgba(90,110,135,0) 75%)",
            filter: "blur(4px)",
          }}
        />
      </div>
    </div>
  );
}

export default function CloudLayer({ dense = false, dim = false }) {
  const clouds = dense
    ? [
        { top: "4%", left: "-8%", scale: 2.4, duration: 75, delay: "0s", opacity: 0.65 },
        { top: "16%", left: "24%", scale: 3.1, duration: 95, delay: "-22s", opacity: 0.6 },
        { top: "9%", left: "58%", scale: 2.2, duration: 65, delay: "-45s", opacity: 0.55 },
        { top: "26%", left: "74%", scale: 1.7, duration: 55, delay: "-12s", opacity: 0.5 },
        { top: "2%", left: "42%", scale: 1.5, duration: 60, delay: "-30s", opacity: 0.45 },
      ]
    : [
        { top: "8%", left: "-8%", scale: 2.2, duration: 85, delay: "0s", opacity: 0.5 },
        { top: "20%", left: "38%", scale: 1.8, duration: 75, delay: "-28s", opacity: 0.4 },
        { top: "12%", left: "70%", scale: 1.5, duration: 65, delay: "-50s", opacity: 0.38 },
      ];

  return (
    <>
      {clouds.map((c, i) => (
        <Cloud
          key={i}
          style={{
            top: c.top,
            left: c.left,
            animationDuration: `${c.duration}s`,
            animationDelay: c.delay,
          }}
          opacity={dim ? c.opacity * 0.7 : c.opacity}
          scale={c.scale}
        />
      ))}
    </>
  );
}