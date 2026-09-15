export default function SunRays({ intense = false }) {
  const size = intense ? 90 : 70;

  return (
    <div
      className="absolute top-10 right-10 sm:right-20"
      style={{ width: size * 3.2, height: size * 3.2 }}
    >
      {/* Rotating ray spokes, behind the disc */}
      <div
        className="absolute inset-0"
        style={{
          background: `conic-gradient(from 0deg,
            rgba(255,255,255,0.35) 0deg, rgba(255,255,255,0) 8deg,
            rgba(255,255,255,0) 22deg, rgba(255,255,255,0.3) 30deg,
            rgba(255,255,255,0) 38deg, rgba(255,255,255,0) 52deg,
            rgba(255,255,255,0.35) 60deg, rgba(255,255,255,0) 68deg,
            rgba(255,255,255,0) 82deg, rgba(255,255,255,0.3) 90deg,
            rgba(255,255,255,0) 98deg, rgba(255,255,255,0) 112deg,
            rgba(255,255,255,0.35) 120deg, rgba(255,255,255,0) 128deg,
            rgba(255,255,255,0) 142deg, rgba(255,255,255,0.3) 150deg,
            rgba(255,255,255,0) 158deg, rgba(255,255,255,0) 172deg,
            rgba(255,255,255,0.35) 180deg, rgba(255,255,255,0) 188deg,
            rgba(255,255,255,0) 202deg, rgba(255,255,255,0.3) 210deg,
            rgba(255,255,255,0) 218deg, rgba(255,255,255,0) 232deg,
            rgba(255,255,255,0.35) 240deg, rgba(255,255,255,0) 248deg,
            rgba(255,255,255,0) 262deg, rgba(255,255,255,0.3) 270deg,
            rgba(255,255,255,0) 278deg, rgba(255,255,255,0) 292deg,
            rgba(255,255,255,0.35) 300deg, rgba(255,255,255,0) 308deg,
            rgba(255,255,255,0) 322deg, rgba(255,255,255,0.3) 330deg,
            rgba(255,255,255,0) 338deg, rgba(255,255,255,0) 360deg)`,
          borderRadius: "50%",
          filter: "blur(2px)",
          animation: "sun-rotate 40s linear infinite",
        }}
      />

      {/* Soft outer corona */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.15) 42%, rgba(255,255,255,0) 70%)",
          animation: "sun-pulse 6s ease-in-out infinite",
        }}
      />

      {/* Bright disc */}
      <div
        className="absolute rounded-full"
        style={{
          top: "50%",
          left: "50%",
          width: size,
          height: size,
          transform: "translate(-50%, -50%)",
          background: intense
            ? "radial-gradient(circle at 38% 32%, #fff8e6 0%, #ffe6a3 55%, #ffce5c 100%)"
            : "radial-gradient(circle at 38% 32%, #ffffff 0%, #fff3d1 60%, #ffe6a3 100%)",
          boxShadow: `0 0 ${size * 0.6}px ${intense ? "10px" : "6px"} rgba(255, 230, 160, 0.45)`,
        }}
      />
    </div>
  );
}