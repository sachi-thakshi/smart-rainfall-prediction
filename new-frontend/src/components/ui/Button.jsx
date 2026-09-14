const VARIANTS = {
  glass: "glass-panel text-white hover:bg-white/20",
  solid: "bg-rice text-white hover:bg-rice-dark",
  ghost: "bg-transparent text-ink-muted hover:bg-black/5",
};

export default function Button({
  children,
  onClick,
  variant = "solid",
  className = "",
  type = "button",
  ...rest
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium
        transition-colors duration-200 focus-visible:outline focus-visible:outline-2
        focus-visible:outline-offset-2 focus-visible:outline-rice disabled:opacity-40
        disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
