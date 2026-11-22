'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/app/components/ui/Icon';

const initials = (name) =>
  name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export default function Sidebar({ items, roleLabel, user, unread, onSignOut }) {
  const path = usePathname();
  const isActive = (href) =>
    items[0].href === href ? path === href : path.startsWith(href);

  return (
    <aside className='sticky top-0 flex h-screen w-[248px] shrink-0 flex-col bg-brand-deep px-4 pb-5 pt-6'>
      <Link
        href={items[0].href}
        className='flex items-center gap-3 px-2'
        aria-label='JanSambandha home'
      >
        <span className='grid size-9 place-items-center rounded-[10px] bg-white text-[16px] font-bold text-brand'>
          JS
        </span>
        <span className='text-[18px] font-bold text-white'>JanSambandha</span>
      </Link>

      <p className='mt-6 px-3 text-[11px] font-semibold uppercase leading-[14px] tracking-[0.08em] text-side-text'>
        {roleLabel}
      </p>

      <nav aria-label='Main' className='mt-3.5 flex flex-col gap-1'>
        {items.map((it) => {
          const active = isActive(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              aria-current={active ? 'page' : undefined}
              className={`flex h-[38px] items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                active
                  ? 'bg-brand-mid text-white'
                  : 'text-side-text hover:bg-brand-mid/60 hover:text-white'
              }`}
            >
              <Icon name={it.icon} />
              <span className='flex-1'>{it.label}</span>
              {it.badge === 'unread' && unread > 0 && (
                <span className='grid h-[15px] min-w-[22px] place-items-center rounded-full bg-[#dc2626] px-1.5 text-[12px] font-bold leading-none text-white'>
                  {unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className='mt-auto flex flex-col gap-1'>
        <button
          type='button'
          onClick={onSignOut}
          className='flex h-[38px] items-center gap-3 rounded-lg px-3 text-sm font-medium text-side-text transition-colors hover:bg-brand-mid/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
        >
          <Icon name='out' />
          Sign out
        </button>
        <div className='flex items-center gap-2.5 rounded-[10px] bg-brand-mid p-3'>
          <span className='grid size-[34px] shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-semibold text-white'>
            {initials(user.name)}
          </span>
          <div className='min-w-0'>
            <p className='truncate text-[14px] font-semibold leading-4 text-white'>
              {user.name}
            </p>
            <p className='text-[12px] leading-[14px] text-side-text'>
              {user.sub}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
