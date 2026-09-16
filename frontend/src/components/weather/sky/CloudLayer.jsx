function CloudBlob({ left, top, width, height, scale, light = 1, dark = false }) {
  const background = dark
    ? `radial-gradient(circle at 40% 28%, rgba(180,195,215,${0.55 * light}) 0%, rgba(125,145,170,${0.48 * light}) 43%, rgba(70,90,120,${0.32 * light}) 72%, rgba(40,55,80,0) 100%)`
    : `radial-gradient(circle at 42% 30%, rgba(255,255,255,${0.98 * light}) 0%, rgba(245,250,255,${0.82 * light}) 42%, rgba(205,220,235,${0.42 * light}) 74%, rgba(190,210,230,0) 100%)`;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: `${width * scale}px`,
        height: `${height * scale}px`,
        borderRadius: "50%",
        background,
        filter: `blur(${dark ? 5 : 3}px)`,
      }}
    />
  );
}

function Cloud({ top, left, scale = 1, opacity = 0.5, duration = 80, delay = "0s", blur = 0, depth = "mid", dark = false, direction = 1 }) {
  const blobs = [
    { left: "0%", top: "36%", width: 68, height: 52, light: 0.88 },
    { left: "15%", top: "15%", width: 92, height: 70, light: 0.96 },
    { left: "35%", top: "2%", width: 112, height: 84, light: 1 },
    { left: "59%", top: "17%", width: 90, height: 68, light: 0.93 },
    { left: "77%", top: "38%", width: 64, height: 48, light: 0.84 },
  ];

  const width = 170 * scale;
  const height = 80 * scale;

  return (
    <div
      className="smart-cloud absolute will-change-transform"
      data-depth={depth}
      style={{
        top,
        left,
        opacity,
        filter: blur ? `blur(${blur}px)` : undefined,
        animationDuration: `${duration}s`,
        animationDelay: delay,
        "--cloud-direction": direction,
      }}
    >
      <div className="relative" style={{ width: `${width}px`, height: `${height}px` }}>
        <div className="absolute inset-0 rounded-full bg-white/[0.02] blur-3xl" />

        {blobs.map((blob, index) => (
          <CloudBlob key={index} left={blob.left} top={blob.top} width={blob.width} height={blob.height} scale={scale} light={blob.light} dark={dark} />
        ))}

        <div
          style={{
            position: "absolute",
            left: "7%",
            bottom: "-5%",
            width: "87%",
            height: "43%",
            borderRadius: "50%",
            background: dark
              ? "radial-gradient(ellipse, rgba(22,35,55,0.52) 0%, rgba(22,35,55,0.24) 42%, rgba(22,35,55,0) 78%)"
              : "radial-gradient(ellipse, rgba(75,100,130,0.28) 0%, rgba(75,100,130,0.12) 45%, rgba(75,100,130,0) 78%)",
            filter: `blur(${5 * scale}px)`,
          }}
        />

        {!dark && (
          <div
            style={{
              position: "absolute",
              left: "22%",
              top: "12%",
              width: "45%",
              height: "30%",
              borderRadius: "50%",
              background: "radial-gradient(ellipse, rgba(255,255,255,0.36) 0%, rgba(255,255,255,0) 75%)",
              filter: `blur(${4 * scale}px)`,
            }}
          />
        )}

        {dark && (
          <div
            style={{
              position: "absolute",
              left: "8%",
              bottom: "0%",
              width: "84%",
              height: "34%",
              borderRadius: "50%",
              background: "radial-gradient(ellipse, rgba(20,30,50,0.42) 0%, rgba(20,30,50,0) 78%)",
              filter: `blur(${8 * scale}px)`,
            }}
          />
        )}
      </div>
    </div>
  );
}

export default function CloudLayer({ dense = false, dim = false }) {
  const farClouds = dense
    ? [
        { top: "3%", left: "-20%", scale: 2.5, duration: 130, delay: "-45s", opacity: 0.24, blur: 7, direction: 1 },
        { top: "12%", left: "35%", scale: 2.8, duration: 150, delay: "-90s", opacity: 0.2, blur: 8, direction: 1 },
        { top: "5%", left: "76%", scale: 2.3, duration: 135, delay: "-65s", opacity: 0.18, blur: 8, direction: -1 },
      ]
    : [
        { top: "5%", left: "-18%", scale: 2.2, duration: 140, delay: "-35s", opacity: 0.2, blur: 8, direction: 1 },
        { top: "15%", left: "60%", scale: 2, duration: 155, delay: "-95s", opacity: 0.15, blur: 9, direction: -1 },
      ];

  const midClouds = dense
    ? [
        { top: "8%", left: "-10%", scale: 2.4, duration: 95, delay: "-15s", opacity: 0.58, blur: 2, direction: 1 },
        { top: "17%", left: "22%", scale: 2.9, duration: 110, delay: "-52s", opacity: 0.56, blur: 2, direction: 1 },
        { top: "9%", left: "58%", scale: 2.3, duration: 88, delay: "-70s", opacity: 0.54, blur: 2, direction: -1 },
        { top: "24%", left: "78%", scale: 1.8, duration: 82, delay: "-30s", opacity: 0.46, blur: 1, direction: -1 },
      ]
    : [
        { top: "9%", left: "-8%", scale: 2.1, duration: 105, delay: "-10s", opacity: 0.42, blur: 2, direction: 1 },
        { top: "18%", left: "40%", scale: 1.9, duration: 95, delay: "-48s", opacity: 0.34, blur: 2, direction: 1 },
        { top: "12%", left: "74%", scale: 1.6, duration: 88, delay: "-68s", opacity: 0.3, blur: 2, direction: -1 },
      ];

  const foregroundClouds = dense
    ? [
        { top: "31%", left: "-22%", scale: 3.2, duration: 70, delay: "-28s", opacity: 0.34, blur: 4, direction: 1 },
        { top: "35%", left: "70%", scale: 2.8, duration: 76, delay: "-54s", opacity: 0.3, blur: 5, direction: -1 },
      ]
    : [
        { top: "34%", left: "-28%", scale: 2.7, duration: 84, delay: "-35s", opacity: 0.18, blur: 5, direction: 1 },
      ];

  const opacityMultiplier = dim ? 0.72 : 1;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0">
        {farClouds.map((cloud, index) => (
          <Cloud key={`far-${index}`} {...cloud} depth="far" dark={dense || dim} opacity={cloud.opacity * opacityMultiplier} />
        ))}
      </div>

      <div className="absolute inset-0">
        {midClouds.map((cloud, index) => (
          <Cloud key={`mid-${index}`} {...cloud} depth="mid" dark={dense || dim} opacity={cloud.opacity * opacityMultiplier} />
        ))}
      </div>

      <div className="absolute inset-0">
        {foregroundClouds.map((cloud, index) => (
          <Cloud key={`front-${index}`} {...cloud} depth="front" dark={dense} opacity={cloud.opacity * opacityMultiplier} />
        ))}
      </div>

      {dense && (
        <>
          <div className="absolute inset-x-0 top-0 h-[42%] bg-gradient-to-b from-slate-950/25 via-slate-800/5 to-transparent" />
          <div className="absolute left-[-10%] top-[4%] h-[280px] w-[55%] animate-[storm-cloud-shift_16s_ease-in-out_infinite] rounded-full bg-slate-950/12 blur-[100px]" />
          <div className="absolute right-[-10%] top-[12%] h-[260px] w-[55%] animate-[storm-cloud-shift-alt_20s_ease-in-out_infinite] rounded-full bg-indigo-950/10 blur-[110px]" />
        </>
      )}

      <style>{`
        .smart-cloud {
          animation-name: smart-cloud-drift;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          transform: translate3d(0, 0, 0);
        }

        .smart-cloud[data-depth="far"] {
          z-index: 1;
        }

        .smart-cloud[data-depth="mid"] {
          z-index: 3;
        }

        .smart-cloud[data-depth="front"] {
          z-index: 6;
        }

        @keyframes smart-cloud-drift {
          0% {
            transform: translate3d(calc(-12vw * var(--cloud-direction)), 0, 0);
          }

          25% {
            transform: translate3d(calc(18vw * var(--cloud-direction)), -4px, 0);
          }

          50% {
            transform: translate3d(calc(48vw * var(--cloud-direction)), 5px, 0);
          }

          75% {
            transform: translate3d(calc(78vw * var(--cloud-direction)), -3px, 0);
          }

          100% {
            transform: translate3d(calc(112vw * var(--cloud-direction)), 0, 0);
          }
        }

        @keyframes storm-cloud-shift {
          0%, 100% {
            transform: translate3d(-5%, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(12%, 6%, 0) scale(1.1);
          }
        }

        @keyframes storm-cloud-shift-alt {
          0%, 100% {
            transform: translate3d(6%, 4%, 0) scale(1.08);
          }

          50% {
            transform: translate3d(-12%, -2%, 0) scale(0.96);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .smart-cloud {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}