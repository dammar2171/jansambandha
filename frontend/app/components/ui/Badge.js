const TONES = {
  neutral: "bg-muted text-ink-2",
  info: "bg-info-tint text-info",
  ok: "bg-ok-tint text-ok",
  warn: "bg-warn-tint text-warn",
  danger: "bg-danger-tint text-danger",
  brand: "bg-brand-tint text-brand",
};

export default function Badge({ tone = "neutral", className = "", children }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-[3px] text-xs font-medium leading-[16px] ${TONES[tone]} ${className}`}>
      {children}
    </span>
  );
}

const STATUS_TONE = {
  Ongoing: "info",
  Approved: "ok",
  "Under review": "warn",
  Submitted: "neutral",
  Assigned: "info",
  "In progress": "info",
  Resolved: "ok",
  Closed: "neutral",
  Reopened: "danger",
  Draft: "neutral",
  Returned: "warn",
  Rejected: "danger",
  Completed: "ok",
};

export function StatusBadge({ status, className }) {
  return <Badge tone={STATUS_TONE[status] || "neutral"} className={className}>{status}</Badge>;
}
