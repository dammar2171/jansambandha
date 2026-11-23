import Image from 'next/image';
import Icon from '@/app/components/ui/Icon';

const POINTS = [
  'Demand-driven planning with a transparent priority score',
  'Contractor reports verified by department inspections',
  'Every approval linked to assembly decisions and audit logs',
];

export default function BrandPanel() {
  return (
    <aside className='relative hidden w-[640px] shrink-0 flex-col justify-between overflow-hidden bg-brand-deep p-16 lg:flex'>
      <Image
        src='/side_imagejansambandha.jpeg'
        alt=''
        fill
        priority
        sizes='640px'
        className='z-0 object-cover object-center'
      />
      <div
        aria-hidden
        className='absolute inset-0 z-10 bg-gradient-to-b from-brand-deep/95 via-brand-deep/70 to-brand-deep/95'
      />
      <div
        aria-hidden
        className='absolute inset-0 z-10 bg-gradient-to-r from-brand-deep/70 via-transparent to-brand-deep/20'
      />
      <div
        aria-hidden
        className='absolute -top-[140px] left-[380px] z-10 size-[460px] rounded-full border border-white/10 bg-brand-mid/25 blur-[1px]'
      />
      <div
        aria-hidden
        className='absolute -bottom-[60px] -left-[120px] z-10 size-[380px] rounded-full border border-white/10 bg-[#7c3a5e]/15'
      />

      <div className='relative z-20 flex w-fit items-center gap-3 rounded-2xl border border-white/10 bg-brand-deep/25 px-4 py-3 shadow-2xl shadow-brand-deep/30 backdrop-blur-md'>
        <Image
          src='/logo.jpeg'
          alt='JanSambandha logo'
          width={150}
          height={150}
          className='size-14 rounded-[10px] bg-white object-contain p-1 shadow-lg'
        />
        <div>
          <p className='text-xl font-bold leading-tight text-white'>
            JanSambandha
          </p>
          <p className='text-xs text-side-text'>Local governance, connected</p>
        </div>
      </div>

      <div className='relative z-20 flex flex-col gap-6 rounded-[28px] border border-white/10 bg-brand-deep/45 p-7 shadow-2xl shadow-brand-deep/30 backdrop-blur-md'>
        <h2 className='max-w-[500px] text-[49px] font-bold leading-[58px] text-white drop-shadow-lg'>
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

      <p className='relative z-20 text-[14px] text-side-text'>
        Kailali Municipality, Sudurpashchim Province
      </p>
    </aside>
  );
}
