export default function ProgressBar({ label, value, color = "bg-brand", hideValue = false }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs leading-[16px] text-ink-2">
        <span>{label}</span>
        {!hideValue && <span className="font-semibold text-ink">{value}%</span>}
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      >
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
