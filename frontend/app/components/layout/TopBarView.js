'use client';
import Link from 'next/link';
import Icon from '@/app/components/ui/Icon';

export default function TopBarView({
  crumbs,
  search,
  onSearch,
  unread,
  notifHref,
  notifLabel = 'Notifications',
  profileHref,
  initials,
}) {
  return (
    <header className='flex h-16 shrink-0 items-center gap-4 border-b border-line bg-surface px-8 print:hidden'>
      <nav
        aria-label='Breadcrumb'
        className='flex min-w-0 flex-1 items-center gap-2 text-[14px] leading-4'
      >
        {crumbs.map((c, i) => (
          <span key={c.label} className='flex min-w-0 items-center gap-2'>
            {i > 0 && (
              <span className='text-ink-3' aria-hidden>
                /
              </span>
            )}
            {c.href ? (
              <Link href={c.href} className='text-ink-3 hover:text-brand'>
                {c.label}
              </Link>
            ) : (
              <span
                className='truncate font-medium text-ink'
                aria-current='page'
              >
                {c.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      <label className='relative block w-[260px]'>
        <span className='sr-only'>Search projects and complaints</span>
        <Icon
          name='search'
          size={16}
          className='absolute left-3 top-2 text-ink-3'
        />
        <input
          type='search'
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder='Search projects, complaints…'
          className='h-8 w-full rounded-lg border border-line bg-surface-alt pl-9 pr-3 text-[14px] text-ink outline-none placeholder:text-ink-3 focus:border-brand focus:ring-2 focus:ring-brand/20'
        />
      </label>

      <span className='rounded-full bg-brand-tint px-2.5 py-[3px] text-xs font-semibold leading-[16px] text-brand'>
        FY 2083/84
      </span>

      <Link
        href={notifHref}
        aria-label={unread ? `${notifLabel}, ${unread} unread` : notifLabel}
        className='relative grid size-9 place-items-center rounded-lg text-ink-2 hover:bg-muted focus-visible:outline-2 focus-visible:outline-brand'
      >
        <Icon name='bell' size={20} />
        {unread > 0 && (
          <span className='absolute right-1.5 top-1.5 size-[9px] rounded-full border-2 border-surface bg-[#dc2626]' />
        )}
      </Link>

      <Link
        href={profileHref}
        aria-label='Profile'
        className='grid size-[34px] place-items-center rounded-full bg-brand text-xs font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
      >
        {initials}
      </Link>
    </header>
  );
}
