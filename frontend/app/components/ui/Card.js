export default function Card({ as: Tag = "section", className = "", ...props }) {
  return <Tag className={`rounded-xl border border-line bg-surface ${className}`} {...props} />;
}
