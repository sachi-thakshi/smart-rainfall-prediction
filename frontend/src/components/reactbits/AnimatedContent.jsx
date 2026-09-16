import {
  useEffect,
  useRef,
  useState,
} from "react";

const EASINGS = {
  "power1.out": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  "power2.out": "cubic-bezier(0.16, 1, 0.3, 1)",
  "power3.out": "cubic-bezier(0.22, 1, 0.36, 1)",
  "power4.out": "cubic-bezier(0.16, 1, 0.3, 1)",
  "power1.inOut": "cubic-bezier(0.45, 0, 0.55, 1)",
  "power2.inOut": "cubic-bezier(0.65, 0, 0.35, 1)",
  "power3.inOut": "cubic-bezier(0.83, 0, 0.17, 1)",
};

function getInitialTransform({
  direction,
  reverse,
  distance,
  scale,
}) {
  const value = reverse ? -distance : distance;

  if (direction === "horizontal") {
    return `translate3d(${value}px, 0, 0) scale(${scale})`;
  }

  return `translate3d(0, ${value}px, 0) scale(${scale})`;
}

export default function AnimatedContent({
  children,
  className = "",
  distance = 60,
  direction = "vertical",
  reverse = false,
  duration = 0.8,
  ease = "power3.out",
  initialOpacity = 0,
  animateOpacity = true,
  scale = 1,
  delay = 0,
  threshold = 0.15,
  once = true,
  disabled = false,
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (disabled || reducedMotion) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);

          if (once) {
            observer.unobserve(entry.target);
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
    disabled,
    once,
    threshold,
  ]);

  const initialTransform = getInitialTransform({
    direction,
    reverse,
    distance,
    scale,
  });

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: animateOpacity
          ? visible
            ? 1
            : initialOpacity
          : 1,

        transform: visible
          ? "translate3d(0, 0, 0) scale(1)"
          : initialTransform,

        transitionProperty:
          "transform, opacity",

        transitionDuration: `${duration}s`,

        transitionDelay: `${delay}s`,

        transitionTimingFunction:
          EASINGS[ease] ||
          ease ||
          EASINGS["power3.out"],

        willChange:
          "transform, opacity",
      }}
    >
      {children}
    </div>
  );
}