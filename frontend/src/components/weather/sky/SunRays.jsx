// export default function SunRays({ intense = false }) {
//   const size = intense ? 90 : 70;

//   return (
//     <div
//       className="absolute top-10 right-10 sm:right-20"
//       style={{ width: size * 3.2, height: size * 3.2 }}
//     >
//       {/* Rotating ray spokes, behind the disc */}
//       <div
//         className="absolute inset-0"
//         style={{
//           background: `conic-gradient(from 0deg,
//             rgba(255,255,255,0.35) 0deg, rgba(255,255,255,0) 8deg,
//             rgba(255,255,255,0) 22deg, rgba(255,255,255,0.3) 30deg,
//             rgba(255,255,255,0) 38deg, rgba(255,255,255,0) 52deg,
//             rgba(255,255,255,0.35) 60deg, rgba(255,255,255,0) 68deg,
//             rgba(255,255,255,0) 82deg, rgba(255,255,255,0.3) 90deg,
//             rgba(255,255,255,0) 98deg, rgba(255,255,255,0) 112deg,
//             rgba(255,255,255,0.35) 120deg, rgba(255,255,255,0) 128deg,
//             rgba(255,255,255,0) 142deg, rgba(255,255,255,0.3) 150deg,
//             rgba(255,255,255,0) 158deg, rgba(255,255,255,0) 172deg,
//             rgba(255,255,255,0.35) 180deg, rgba(255,255,255,0) 188deg,
//             rgba(255,255,255,0) 202deg, rgba(255,255,255,0.3) 210deg,
//             rgba(255,255,255,0) 218deg, rgba(255,255,255,0) 232deg,
//             rgba(255,255,255,0.35) 240deg, rgba(255,255,255,0) 248deg,
//             rgba(255,255,255,0) 262deg, rgba(255,255,255,0.3) 270deg,
//             rgba(255,255,255,0) 278deg, rgba(255,255,255,0) 292deg,
//             rgba(255,255,255,0.35) 300deg, rgba(255,255,255,0) 308deg,
//             rgba(255,255,255,0) 322deg, rgba(255,255,255,0.3) 330deg,
//             rgba(255,255,255,0) 338deg, rgba(255,255,255,0) 360deg)`,
//           borderRadius: "50%",
//           filter: "blur(2px)",
//           animation: "sun-rotate 40s linear infinite",
//         }}
//       />

//       {/* Soft outer corona */}
//       <div
//         className="absolute inset-0 rounded-full"
//         style={{
//           background: "radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.15) 42%, rgba(255,255,255,0) 70%)",
//           animation: "sun-pulse 6s ease-in-out infinite",
//         }}
//       />

//       {/* Bright disc */}
//       <div
//         className="absolute rounded-full"
//         style={{
//           top: "50%",
//           left: "50%",
//           width: size,
//           height: size,
//           transform: "translate(-50%, -50%)",
//           background: intense
//             ? "radial-gradient(circle at 38% 32%, #fff8e6 0%, #ffe6a3 55%, #ffce5c 100%)"
//             : "radial-gradient(circle at 38% 32%, #ffffff 0%, #fff3d1 60%, #ffe6a3 100%)",
//           boxShadow: `0 0 ${size * 0.6}px ${intense ? "10px" : "6px"} rgba(255, 230, 160, 0.45)`,
//         }}
//       />
//     </div>
//   );
// }

import { useMemo } from "react";

function FloatingParticle({ particle }) {
  return (
    <span
      className="sun-particle absolute block rounded-full bg-white will-change-transform"
      style={{
        left: `${particle.left}%`,
        top: `${particle.top}%`,
        width: `${particle.size}px`,
        height: `${particle.size}px`,
        opacity: particle.opacity,
        animationDuration: `${particle.duration}s`,
        animationDelay: `${particle.delay}s`,
        "--particle-x": `${particle.driftX}px`,
        "--particle-y": `${particle.driftY}px`,
      }}
    />
  );
}

export default function SunRays({ intense = false }) {
  const sunSize = intense ? 104 : 82;
  const systemSize = intense ? 390 : 320;

  const particles = useMemo(() => {
    return Array.from({ length: intense ? 28 : 18 }, (_, index) => ({
      id: index,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 1 + Math.random() * (intense ? 2.3 : 1.6),
      opacity: 0.08 + Math.random() * (intense ? 0.3 : 0.2),
      duration: 7 + Math.random() * 10,
      delay: Math.random() * -10,
      driftX: -18 + Math.random() * 36,
      driftY: -28 - Math.random() * 28,
    }));
  }, [intense]);

  return (
    <div className="absolute right-[-30px] top-[-25px] sm:right-[15px] sm:top-[5px] lg:right-[60px] lg:top-[18px]" style={{ width: systemSize, height: systemSize }}>
      {/* Large ambient illumination */}
      <div className={`absolute left-1/2 top-1/2 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px] transition-colors duration-1000 ${intense ? "bg-amber-200/20" : "bg-sky-100/10"}`} />

      {/* Extremely soft outer halo */}
      <div className="absolute left-1/2 top-1/2 h-[125%] w-[125%] -translate-x-1/2 -translate-y-1/2 animate-[sun-corona-breathe_8s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(255,250,220,0.18)_0%,rgba(255,232,170,0.08)_35%,transparent_72%)] blur-xl" />

      {/* Outer rotating rays */}
      <div className="absolute inset-0 animate-[sun-rays-spin_70s_linear_infinite] rounded-full opacity-50" style={{ background: "conic-gradient(from 0deg, rgba(255,255,255,0.22) 0deg, transparent 7deg, transparent 22deg, rgba(255,244,210,0.18) 29deg, transparent 37deg, transparent 52deg, rgba(255,255,255,0.22) 60deg, transparent 68deg, transparent 82deg, rgba(255,244,210,0.17) 90deg, transparent 99deg, transparent 112deg, rgba(255,255,255,0.2) 120deg, transparent 130deg, transparent 142deg, rgba(255,244,210,0.17) 151deg, transparent 159deg, transparent 172deg, rgba(255,255,255,0.22) 180deg, transparent 189deg, transparent 202deg, rgba(255,244,210,0.17) 210deg, transparent 219deg, transparent 232deg, rgba(255,255,255,0.2) 240deg, transparent 249deg, transparent 262deg, rgba(255,244,210,0.17) 270deg, transparent 279deg, transparent 292deg, rgba(255,255,255,0.22) 300deg, transparent 309deg, transparent 322deg, rgba(255,244,210,0.17) 330deg, transparent 339deg, transparent 360deg)", filter: "blur(3px)" }} />

      {/* Secondary slower ray system */}
      <div className="absolute left-[8%] top-[8%] h-[84%] w-[84%] animate-[sun-rays-spin-reverse_95s_linear_infinite] rounded-full opacity-30" style={{ background: "conic-gradient(from 12deg, transparent 0deg, rgba(255,255,255,0.24) 5deg, transparent 13deg, transparent 40deg, rgba(255,248,220,0.18) 47deg, transparent 56deg, transparent 89deg, rgba(255,255,255,0.2) 96deg, transparent 104deg, transparent 138deg, rgba(255,248,220,0.18) 145deg, transparent 153deg, transparent 188deg, rgba(255,255,255,0.22) 195deg, transparent 203deg, transparent 238deg, rgba(255,248,220,0.18) 245deg, transparent 253deg, transparent 288deg, rgba(255,255,255,0.22) 295deg, transparent 303deg, transparent 338deg, rgba(255,248,220,0.18) 345deg, transparent 353deg)", filter: "blur(4px)" }} />

      {/* Volumetric light beams */}
      <div className="absolute left-[45%] top-[47%] h-[340px] w-[135px] origin-top -rotate-[33deg] bg-gradient-to-b from-white/12 via-yellow-100/[0.035] to-transparent blur-[10px]" />
      <div className="absolute left-[50%] top-[50%] h-[290px] w-[90px] origin-top -rotate-[48deg] bg-gradient-to-b from-white/[0.09] via-amber-100/[0.025] to-transparent blur-[13px]" />
      <div className="absolute left-[42%] top-[47%] h-[230px] w-[70px] origin-top -rotate-[17deg] bg-gradient-to-b from-white/[0.08] to-transparent blur-[12px]" />

      {/* Floating illuminated atmospheric particles */}
      <div className="absolute inset-[-20%] overflow-hidden">
        {particles.map((particle) => (
          <FloatingParticle key={particle.id} particle={particle} />
        ))}
      </div>

      {/* Large corona */}
      <div className="absolute left-1/2 top-1/2 h-[62%] w-[62%] -translate-x-1/2 -translate-y-1/2 animate-[sun-corona-pulse_6s_ease-in-out_infinite] rounded-full" style={{ background: intense ? "radial-gradient(circle, rgba(255,242,194,0.65) 0%, rgba(255,206,92,0.24) 38%, rgba(255,174,65,0.05) 68%, transparent 78%)" : "radial-gradient(circle, rgba(255,255,255,0.58) 0%, rgba(255,241,198,0.18) 40%, rgba(255,230,170,0.04) 68%, transparent 80%)", filter: "blur(8px)" }} />

      {/* Sun disc */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-1000" style={{ width: sunSize, height: sunSize, background: intense ? "radial-gradient(circle at 36% 30%, #fffdf3 0%, #fff4c5 30%, #ffdf7a 63%, #ffbd45 100%)" : "radial-gradient(circle at 36% 30%, #ffffff 0%, #fffce9 34%, #fff0ba 68%, #ffdf8a 100%)", boxShadow: intense ? "0 0 25px rgba(255,246,205,0.95), 0 0 60px rgba(255,204,95,0.7), 0 0 120px rgba(255,170,60,0.32)" : "0 0 22px rgba(255,255,255,0.8), 0 0 55px rgba(255,235,175,0.48), 0 0 100px rgba(255,220,160,0.2)" }}>
        <div className="absolute left-[18%] top-[15%] h-[35%] w-[35%] rounded-full bg-white/60 blur-md" />
        <div className="absolute inset-[10%] rounded-full border border-white/20" />
      </div>

      {/* Lens flare chain */}
      <div className="absolute left-[16%] top-[67%] h-2.5 w-2.5 rounded-full border border-white/25 bg-cyan-100/10 blur-[0.5px]" />
      <div className="absolute left-[3%] top-[80%] h-5 w-5 rounded-full border border-white/10 bg-sky-100/[0.07] blur-[1px]" />
      <div className="absolute left-[-10%] top-[94%] h-9 w-9 rounded-full border border-white/[0.07] bg-amber-100/[0.035] blur-[2px]" />

      {/* Warm intense heat halo */}
      {intense && (
        <>
          <div className="absolute left-1/2 top-1/2 h-[88%] w-[88%] -translate-x-1/2 -translate-y-1/2 animate-[heat-halo_4s_ease-in-out_infinite] rounded-full border border-amber-100/10 blur-[2px]" />

          <div className="absolute -inset-[15%] overflow-hidden opacity-35">
            <div className="heat-wave absolute left-[10%] top-[52%] h-[55%] w-[80%] rounded-[50%] border-t border-white/10 blur-[1px]" />
            <div className="heat-wave absolute left-[5%] top-[60%] h-[48%] w-[90%] rounded-[50%] border-t border-amber-100/10 blur-[1.5px]" style={{ animationDelay: "-1.2s" }} />
            <div className="heat-wave absolute left-[15%] top-[68%] h-[42%] w-[70%] rounded-[50%] border-t border-white/[0.08] blur-[1px]" style={{ animationDelay: "-2.2s" }} />
          </div>
        </>
      )}

      <style>{`
        @keyframes sun-rays-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes sun-rays-spin-reverse {
          from {
            transform: rotate(360deg);
          }

          to {
            transform: rotate(0deg);
          }
        }

        @keyframes sun-corona-breathe {
          0%, 100% {
            transform: translate(-50%, -50%) scale(0.96);
            opacity: 0.6;
          }

          50% {
            transform: translate(-50%, -50%) scale(1.08);
            opacity: 1;
          }
        }

        @keyframes sun-corona-pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(0.95);
            opacity: 0.78;
          }

          50% {
            transform: translate(-50%, -50%) scale(1.08);
            opacity: 1;
          }
        }

        @keyframes sun-particle-float {
          0% {
            transform: translate3d(0, 20px, 0) scale(0.75);
            opacity: 0;
          }

          20% {
            opacity: 1;
          }

          70% {
            opacity: 0.65;
          }

          100% {
            transform: translate3d(var(--particle-x), var(--particle-y), 0) scale(1.15);
            opacity: 0;
          }
        }

        .sun-particle {
          animation-name: sun-particle-float;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          box-shadow: 0 0 6px rgba(255,255,255,0.6);
        }

        @keyframes heat-halo {
          0%, 100% {
            transform: translate(-50%, -50%) scale(0.94);
            opacity: 0.25;
          }

          50% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 0.7;
          }
        }

        @keyframes heat-wave-rise {
          0% {
            transform: translate3d(0, 18px, 0) scaleX(0.92);
            opacity: 0;
          }

          30% {
            opacity: 0.6;
          }

          100% {
            transform: translate3d(0, -34px, 0) scaleX(1.08);
            opacity: 0;
          }
        }

        .heat-wave {
          animation: heat-wave-rise 4.5s ease-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .sun-particle,
          .heat-wave {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}