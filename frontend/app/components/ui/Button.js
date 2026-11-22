import Link from "next/link";

const VARIANTS = {
  primary: "bg-brand text-white hover:bg-brand-hover",
  secondary: "border border-line-strong bg-surface text-ink hover:bg-surface-alt",
  outline: "border border-line-strong bg-surface text-ink hover:bg-surface-alt",
  ghost: "text-brand hover:bg-brand-tint",
};
const SIZES = {
  md: "px-4 py-3.5 text-[16px]",
  sm: "px-3 py-2 text-[14px]",
  dash: "px-3 py-2.5 text-[14px]",
  xs: "px-2.5 py-1.5 text-xs",
};

const buttonClassName = (variant, size, className) =>
  `inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

export default function Button({ variant = "primary", size = "md", className = "", ...props }) {
  return (
    <button
      className={buttonClassName(variant, size, className)}
      {...props}
    />
  );
}

export function ButtonLink({ variant = "primary", size = "md", className = "", ...props }) {
  return <Link className={buttonClassName(variant, size, className)} {...props} />;
}