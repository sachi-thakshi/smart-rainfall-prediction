export default function GradualBlur({
  position = "bottom",
  height = "140px",
  strength = 18,
  layers = 6,
  className = "",
}) {
  const isTop =
    position === "top";

  const items =
    Array.from({
      length: layers,
    });

  return (
    <div
      className={`
        pointer-events-none
        absolute
        left-0
        right-0
        z-30
        overflow-hidden
        ${className}
      `}
      style={{
        height,

        ...(isTop
          ? {
              top: 0,
            }
          : {
              bottom: 0,
            }),
      }}
    >
      {items.map(
        (_, index) => {
          const progress =
            (index + 1) /
            layers;

          const blur =
            strength *
            progress;

          const start =
            (index /
              layers) *
            100;

          const end =
            ((index + 2) /
              layers) *
            100;

          const gradient =
            isTop
              ? `
                linear-gradient(
                  to bottom,
                  black ${start}%,
                  transparent ${Math.min(
                    end,
                    100
                  )}%
                )
              `
              : `
                linear-gradient(
                  to top,
                  black ${start}%,
                  transparent ${Math.min(
                    end,
                    100
                  )}%
                )
              `;

          return (
            <div
              key={index}
              className="
                absolute
                inset-0
              "
              style={{
                backdropFilter:
                  `blur(${blur}px)`,

                WebkitBackdropFilter:
                  `blur(${blur}px)`,

                maskImage:
                  gradient,

                WebkitMaskImage:
                  gradient,
              }}
            />
          );
        }
      )}
    </div>
  );
}