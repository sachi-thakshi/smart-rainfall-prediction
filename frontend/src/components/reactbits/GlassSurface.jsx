import {
  useRef,
  useState,
} from "react";

function resolveSize(value) {
  if (
    typeof value === "number"
  ) {
    return `${value}px`;
  }

  return value;
}

export default function GlassSurface({
  children,
  className = "",
  width = "auto",
  height = "auto",
  borderRadius = 24,
  blur = 20,
  opacity = 0.08,
  borderOpacity = 0.15,
  interactive = true,
}) {
  const ref = useRef(null);

  const [mouse, setMouse] =
    useState({
      x: 0,
      y: 0,
    });

  const [hovering, setHovering] =
    useState(false);

  function handleMouseMove(
    event
  ) {
    if (!interactive) return;

    const rect =
      ref.current?.getBoundingClientRect();

    if (!rect) return;

    setMouse({
      x:
        event.clientX -
        rect.left,

      y:
        event.clientY -
        rect.top,
    });
  }

  return (
    <div
      ref={ref}
      onMouseMove={
        handleMouseMove
      }
      onMouseEnter={() =>
        setHovering(true)
      }
      onMouseLeave={() =>
        setHovering(false)
      }
      className={`
        relative
        overflow-hidden
        ${className}
      `}
      style={{
        width:
          resolveSize(width),

        height:
          resolveSize(height),

        borderRadius:
          typeof borderRadius ===
          "number"
            ? `${borderRadius}px`
            : borderRadius,

        background: `
          linear-gradient(
            135deg,
            rgba(
              255,
              255,
              255,
              ${opacity + 0.04}
            ),
            rgba(
              255,
              255,
              255,
              ${opacity}
            )
          )
        `,

        border: `
          1px solid
          rgba(
            255,
            255,
            255,
            ${borderOpacity}
          )
        `,

        backdropFilter:
          `blur(${blur}px)`,

        WebkitBackdropFilter:
          `blur(${blur}px)`,

        boxShadow: `
          inset 0 1px 0
          rgba(
            255,
            255,
            255,
            0.12
          ),

          0 20px 60px
          rgba(
            0,
            0,
            0,
            0.1
          )
        `,
      }}
    >
      {interactive && (
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            transition-opacity
            duration-500
          "
          style={{
            opacity:
              hovering
                ? 1
                : 0,

            background: `
              radial-gradient(
                450px circle
                at ${mouse.x}px
                ${mouse.y}px,
                rgba(
                  255,
                  255,
                  255,
                  0.16
                ),
                transparent 45%
              )
            `,
          }}
        />
      )}

      <div
        className="
          relative
          z-10
          h-full
        "
      >
        {children}
      </div>
    </div>
  );
}