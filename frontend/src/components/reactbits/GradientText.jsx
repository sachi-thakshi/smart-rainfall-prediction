export default function GradientText({
  children,
  className = "",
  colors = [
    "#38bdf8",
    "#2563eb",
    "#22c55e",
    "#38bdf8",
  ],
  animationSpeed = 8,
  showBorder = false,
}) {
  const gradient =
    `linear-gradient(
      90deg,
      ${colors.join(",")}
    )`;

  return (
    <span
      className={`
        relative
        inline-flex
        ${className}
      `}
    >
      {showBorder && (
        <span
          className="
            pointer-events-none
            absolute
            -inset-[2px]
            rounded-[inherit]
            opacity-40
            blur-sm
          "
          style={{
            backgroundImage:
              gradient,
            backgroundSize:
              "300% 100%",
            animation: `
              smart-rain-gradient
              ${animationSpeed}s
              linear
              infinite
            `,
          }}
        />
      )}

      <span
        className="
          relative
          bg-clip-text
          text-transparent
        "
        style={{
          backgroundImage:
            gradient,

          backgroundSize:
            "300% 100%",

          animation: `
            smart-rain-gradient
            ${animationSpeed}s
            linear
            infinite
          `,
        }}
      >
        {children}
      </span>
    </span>
  );
}