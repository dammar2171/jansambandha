"use client";
import { useId } from "react";

export default function Field({ label, error, hint, trailing, id, className = "", ...props }) {
  const auto = useId();
  const fid = id || auto;
  const describedBy = error ? `${fid}-err` : hint ? `${fid}-hint` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fid} className="text-xs font-medium text-ink-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={fid}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`w-full rounded-lg border bg-surface px-3.5 py-3 text-sm text-ink outline-none transition placeholder:text-ink-3 focus:border-brand focus:ring-2 focus:ring-brand/20 ${error ? "border-danger" : "border-line-strong"} ${trailing ? "pr-16" : ""} ${className}`}
          {...props}
        />
        {trailing && <div className="absolute inset-y-0 right-3 flex items-center">{trailing}</div>}
      </div>
      {error && <p id={`${fid}-err`} className="text-xs text-danger">{error}</p>}
      {hint && !error && <p id={`${fid}-hint`} className="text-xs text-ink-3">{hint}</p>}
    </div>
  );
}