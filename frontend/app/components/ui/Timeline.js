import Icon from '@/app/components/ui/Icon';

function Dot({ state }) {
  if (state === 'done')
    return (
      <span className='grid size-5 place-items-center rounded-full bg-brand text-white'>
        <Icon name='check' size={12} strokeWidth={3} />
      </span>
    );
  if (state === 'current')
    return (
      <span className='grid size-5 place-items-center rounded-full border-2 border-brand bg-brand-tint'>
        <span className='size-2 rounded-full bg-brand' />
      </span>
    );
  return (
    <span className='size-5 rounded-full border-2 border-line-strong bg-surface' />
  );
}

export default function Timeline({ steps }) {
  return (
    <ol>
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        return (
          <li
            key={s.title + i}
            className='flex gap-3'
            aria-current={s.state === 'current' ? 'step' : undefined}
          >
            <div className='flex flex-col items-center'>
              <Dot state={s.state} />
              {!last && (
                <span
                  className={`w-0.5 flex-1 ${s.state === 'done' ? 'bg-brand' : 'bg-line'}`}
                />
              )}
            </div>
            <div className={last ? '' : 'pb-2'}>
              <p
                className={`text-[13px] font-semibold leading-[17px] ${s.state === 'todo' ? 'text-ink-3' : 'text-ink'}`}
              >
                {s.title}
              </p>
              {s.sub && (
                <p className='text-xs leading-[15px] text-ink-3'>{s.sub}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
