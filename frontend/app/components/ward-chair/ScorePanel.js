import Card from '@/app/components/ui/Card';

export function ScoreCard({ parts = [], total = 0, preview = false }) {
  const entries = Array.isArray(parts)
    ? parts.map((part) => [part.label, part.value])
    : Object.entries(parts || {});

  return (
    <Card className='p-5'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h2 className='text-[15px] font-semibold leading-[19px] text-ink'>
            {preview ? 'Priority score preview' : 'Priority score'}
          </h2>
          <p className='mt-1 text-xs text-ink-3'>
            Decision support, not an approval.
          </p>
        </div>
        <span className='text-2xl font-bold text-brand'>{total}/100</span>
      </div>
      {entries.length > 0 && (
        <dl className='mt-4 flex flex-col gap-2'>
          {entries.map(([label, value]) => (
            <div key={label} className='flex justify-between gap-3 text-[13px]'>
              <dt className='text-ink-3'>{label}</dt>
              <dd className='font-medium text-ink'>{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </Card>
  );
}
