import Icon from '@/app/components/ui/Icon';

const POINTS = [
  'Demand-driven planning with a transparent priority score',
  'Contractor reports verified by department inspections',
  'Every approval linked to assembly decisions and audit logs',
];

export default function BrandPanel() {
  return (
    <aside className='relative hidden w-[640px] shrink-0 flex-col justify-between overflow-hidden bg-brand-deep p-16 lg:flex'>
      <div
        aria-hidden
        className='absolute -top-[140px] left-[380px] size-[460px] rounded-full bg-brand-mid/70'
      />
      <div
        aria-hidden
        className='absolute -bottom-[60px] -left-[120px] size-[380px] rounded-full bg-[#7c3a5e]/25'
      />

      <div className='relative flex items-center gap-3'>
        <div className='grid size-11 place-items-center rounded-[10px] bg-white text-lg font-bold text-brand'>
          JS
        </div>
        <div>
          <p className='text-xl font-bold leading-tight text-white'>
            JanSambandha
          </p>
          <p className='text-xs text-side-text'>Local governance, connected</p>
        </div>
      </div>

      <div className='relative flex flex-col gap-6'>
        <h2 className='max-w-[500px] text-[49px] font-bold leading-[58px] text-white'>
          Citizen needs. Government plans. Transparent progress.
        </h2>
        <p className='max-w-[470px] text-base leading-6 text-panel-text'>
          Plan, approve, monitor and evaluate local development projects
          together with the people they serve.
        </p>
        <ul className='flex flex-col gap-3.5'>
          {POINTS.map((p) => (
            <li
              key={p}
              className='flex items-center gap-3 text-sm text-panel-text-2'
            >
              <span className='grid size-6 shrink-0 place-items-center rounded-full bg-brand-soft'>
                <Icon name='check' size={14} />
              </span>
              {p}
            </li>
          ))}
        </ul>
      </div>

      <p className='relative text-[14px] text-side-text'>
        Kailali Municipality, Sudurpashchim Province
      </p>
    </aside>
  );
}
