'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from '@/lib/session';
const nav = [
  ['Overview', '/cao', '▦'],
  ['Project approvals', '/cao/project-approvals', '▤'],
  ['All projects', '/cao/projects', '▣'],
  ['User management', '/cao/users', '♙'],
  ['Departments', '/cao/departments', '▥'],
  ['Delegated authority', '/cao/delegations', '⌁'],
  ['Reports', '/cao/reports', '▧'],
  ['Audit logs', '/cao/audit-logs', '≡'],
];
export default function CaoShell({ children }) {
  const path = usePathname();
  const router = useRouter();
  const session = useSession();
  const name = session?.name || 'Chief Administrative Officer';
  const initials =
    name
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'JS';
  const signOutNow = () => {
    signOut();
    router.replace('/login');
  };
  return (
    <div className='min-h-screen bg-[#f3f6fa] text-slate-800 md:flex'>
      <aside className='w-full bg-[#102b49] text-white md:fixed md:inset-y-0 md:flex md:w-[248px] md:flex-col'>
        <div className='flex h-[76px] items-center gap-3 border-b border-white/10 px-6'>
          <Image
            src='/jansambandha_logo.jpeg'
            alt='JanSambandha logo'
            width={40}
            height={40}
            className='h-10 w-10 rounded-lg bg-white object-contain p-1'
          />
          <div>
            <div className='font-semibold tracking-wide'>JanSambandha</div>
            <div className='text-[12px] text-slate-300'>
              Municipal governance
            </div>
          </div>
        </div>
        <div className='px-5 pt-6 pb-2 text-[11px] font-semibold uppercase tracking-[.16em] text-slate-400'>
          Administration
        </div>
        <nav className='flex gap-1 overflow-x-auto px-3 pb-3 md:block'>
          {nav.map(([label, href, icon]) => (
            <Link
              key={href}
              href={href}
              className={`flex min-w-max items-center gap-3 rounded-md px-3 py-2.5 text-[14px] transition ${path === href ? 'bg-[#24496f] text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
            >
              <span className='w-5 text-center text-base'>{icon}</span>
              {label}
              {href === '/cao/project-approvals' && (
                <span className='ml-auto rounded bg-amber-400 px-1.5 py-0.5 text-[11px] font-bold text-slate-900'>
                  3
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className='mt-auto hidden border-t border-white/10 p-4 md:block'>
          <div className='flex items-center gap-3'>
            <div className='grid h-9 w-9 place-items-center rounded-full bg-[#d9e5f1] text-sm font-semibold text-[#17395d]'>
              {initials}
            </div>
            <div>
              <div className='text-sm font-medium'>{name}</div>
              <div className='text-xs text-slate-400'>
                Chief Administrative Officer
              </div>
            </div>
          </div>
        </div>
      </aside>
      <div className='min-w-0 flex-1 md:ml-[248px]'>
        <header className='sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur md:px-8'>
          <div>
            <div className='text-xs text-slate-500'>
              Kailali Municipality{' '}
              <span className='mx-1 text-slate-300'>/</span> Administration
            </div>
            <div className='text-sm font-semibold'>
              Chief Administrative Officer workspace
            </div>
          </div>
          <div className='flex items-center gap-3'>
            <span className='hidden rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-600 sm:inline'>
              Fiscal year 2083/84
            </span>
            <button
              className='relative rounded-md border border-slate-200 px-3 py-2 text-sm'
              aria-label='Notifications'
            >
              ♧
              <i className='absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500' />
            </button>
            <div className='grid h-9 w-9 place-items-center rounded-full bg-[#e8eef5] text-xs font-bold text-[#17395d]'>
              {initials}
            </div>
            <button
              onClick={signOutNow}
              className='rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50'
            >
              Sign out
            </button>
          </div>
        </header>
        <main className='mx-auto max-w-[1500px] p-5 md:p-8'>{children}</main>
      </div>
    </div>
  );
}
