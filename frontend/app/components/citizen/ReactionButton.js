'use client';
import Icon from '@/app/components/ui/Icon';

export default function ReactionButton({
  kind,
  count,
  active,
  onClick,
  label,
}) {
  const on = active
    ? kind === 'up'
      ? 'border-brand bg-brand-tint text-brand'
      : 'border-ink-2 bg-muted text-ink'
    : 'border-line-strong text-ink-2 hover:bg-surface-alt';
  return (
    <button
      type='button'
      onClick={onClick}
      aria-pressed={!!active}
      aria-label={`${label}, ${count}`}
      className={`inline-flex h-[30px] items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${on}`}
    >
      <Icon name={kind} size={15} fill={active ? 'currentColor' : 'none'} />
      {count}
    </button>
  );
}
