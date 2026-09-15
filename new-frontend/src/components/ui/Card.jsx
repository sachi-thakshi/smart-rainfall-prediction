export default function Card({ children, className = "", leaf = false, as: Tag = "div" }) {
  return (
    <Tag
      className={`bg-surface-raised shadow-[0_1px_2px_rgba(28,36,34,0.06)] ${
        leaf ? "card-leaf" : "rounded-2xl"
      } ${className}`}
    >
      {children}
    </Tag>
  );
}
