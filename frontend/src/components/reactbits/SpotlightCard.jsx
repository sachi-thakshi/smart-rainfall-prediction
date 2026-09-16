import {
  useRef,
  useState,
} from "react";

export default function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(14, 165, 233, 0.14)",
  spotlightSize = 500,
  disabled = false,
}) {
  const cardRef = useRef(null);

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  const [active, setActive] = useState(false);

  function handleMouseMove(event) {
    if (disabled) return;

    const rect =
      cardRef.current?.getBoundingClientRect();

    if (!rect) return;

    setPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() =>
        !disabled && setActive(true)
      }
      onMouseLeave={() =>
        setActive(false)
      }
      className={`
        relative
        overflow-hidden
        rounded-3xl
        border
        border-white/10
        bg-white/5
        ${className}
      `}
    >
      {!disabled && (
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-0
            transition-opacity
            duration-500
          "
          style={{
            opacity: active ? 1 : 0,

            background: `
              radial-gradient(
                ${spotlightSize}px circle
                at ${position.x}px ${position.y}px,
                ${spotlightColor},
                transparent 42%
              )
            `,
          }}
        />
      )}

      <div className="relative z-[1]">
        {children}
      </div>
    </div>
  );
}