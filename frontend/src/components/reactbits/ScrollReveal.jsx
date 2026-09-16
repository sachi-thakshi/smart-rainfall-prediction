import {
  useEffect,
  useRef,
  useState,
} from "react";

export default function ScrollReveal({
  children,
  className = "",
  wordClassName = "",
  delay = 0,
  stagger = 0.045,
  duration = 0.7,
  distance = 28,
  blur = 6,
  threshold = 0.2,
  once = true,
}) {
  const containerRef = useRef(null);

  const [visible, setVisible] =
    useState(false);

  useEffect(() => {
    const element =
      containerRef.current;

    if (!element) return;

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    if (reducedMotion) {
      setVisible(true);
      return;
    }

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true);

            if (once) {
              observer.unobserve(
                entry.target
              );
            }
          } else if (!once) {
            setVisible(false);
          }
        },
        {
          threshold,
        }
      );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [
    once,
    threshold,
  ]);

  const isString =
    typeof children === "string";

  if (!isString) {
    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          opacity: visible ? 1 : 0,

          transform: visible
            ? "translateY(0)"
            : `translateY(${distance}px)`,

          filter: visible
            ? "blur(0)"
            : `blur(${blur}px)`,

          transition: `
            opacity ${duration}s ease,
            transform ${duration}s cubic-bezier(0.22, 1, 0.36, 1),
            filter ${duration}s ease
          `,
        }}
      >
        {children}
      </div>
    );
  }

  const words =
    children.split(" ");

  return (
    <div
      ref={containerRef}
      className={className}
    >
      {words.map(
        (word, index) => (
          <span
            key={`${word}-${index}`}
            className={`
              inline-block
              ${wordClassName}
            `}
            style={{
              marginRight:
                index ===
                words.length - 1
                  ? 0
                  : "0.25em",

              opacity: visible
                ? 1
                : 0,

              transform: visible
                ? "translateY(0)"
                : `translateY(${distance}px)`,

              filter: visible
                ? "blur(0px)"
                : `blur(${blur}px)`,

              transitionProperty:
                "opacity, transform, filter",

              transitionDuration:
                `${duration}s`,

              transitionTimingFunction:
                "cubic-bezier(0.22, 1, 0.36, 1)",

              transitionDelay:
                `${
                  delay +
                  index * stagger
                }s`,
            }}
          >
            {word}
          </span>
        )
      )}
    </div>
  );
}