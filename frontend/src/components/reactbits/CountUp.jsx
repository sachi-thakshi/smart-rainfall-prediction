import {
  useEffect,
  useRef,
  useState,
} from "react";

function easeOutCubic(value) {
  return (
    1 -
    Math.pow(
      1 - value,
      3
    )
  );
}

export default function CountUp({
  from = 0,
  to = 100,
  duration = 1.5,
  delay = 0,
  decimals = 0,
  separator = ",",
  prefix = "",
  suffix = "",
  className = "",
  startOnView = true,
  threshold = 0.3,
  onEnd,
}) {
  const ref = useRef(null);

  const frameRef =
    useRef(null);

  const timeoutRef =
    useRef(null);

  const [value, setValue] =
    useState(from);

  const [started, setStarted] =
    useState(false);

  useEffect(() => {
    if (!startOnView) {
      setStarted(true);
      return;
    }

    const element =
      ref.current;

    if (!element) return;

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (
            entry.isIntersecting
          ) {
            setStarted(true);

            observer.unobserve(
              entry.target
            );
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
    startOnView,
    threshold,
  ]);

  useEffect(() => {
    if (!started) return;

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    if (reducedMotion) {
      setValue(to);
      onEnd?.();
      return;
    }

    timeoutRef.current =
      setTimeout(() => {
        const startTime =
          performance.now();

        const totalDuration =
          duration * 1000;

        function animate(
          currentTime
        ) {
          const elapsed =
            currentTime -
            startTime;

          const progress =
            Math.min(
              elapsed /
                totalDuration,
              1
            );

          const eased =
            easeOutCubic(
              progress
            );

          const current =
            from +
            (to - from) *
              eased;

          setValue(current);

          if (progress < 1) {
            frameRef.current =
              requestAnimationFrame(
                animate
              );
          } else {
            setValue(to);
            onEnd?.();
          }
        }

        frameRef.current =
          requestAnimationFrame(
            animate
          );
      }, delay * 1000);

    return () => {
      clearTimeout(
        timeoutRef.current
      );

      cancelAnimationFrame(
        frameRef.current
      );
    };
  }, [
    started,
    from,
    to,
    duration,
    delay,
    onEnd,
  ]);

  const formatted =
    Number(value).toLocaleString(
      undefined,
      {
        minimumFractionDigits:
          decimals,

        maximumFractionDigits:
          decimals,

        useGrouping:
          Boolean(separator),
      }
    );

  return (
    <span
      ref={ref}
      className={className}
    >
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}