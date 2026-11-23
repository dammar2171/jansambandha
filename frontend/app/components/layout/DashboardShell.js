'use client';
import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Icon from '@/app/components/ui/Icon';
import Toast from '@/app/components/ui/Toast';
import { getRole } from '@/lib/roles';
import { getToken, signOut, useSession } from '@/lib/session';
import { setNotifications, useStore } from '@/lib/store';
import { mapNotification } from '@/lib/notifications';
import { api } from '@/lib/api';

export default function DashboardShell({ role, roleLabel, nav, children }) {
  const session = useSession();
  const router = useRouter();
  const path = usePathname();
  const unread = useStore((s) => s.notifications.filter((n) => !n.read).length);

  useEffect(() => {
    if (session === null) router.replace('/login');
    else if (session && session.role !== role)
      router.replace(getRole(session.role)?.home ?? '/login');
  }, [session, role, router]);

  const authorized = session?.role === role;

  // Keep the sidebar badge and notifications page in sync with the backend.
  useEffect(() => {
    if (!authorized) return;
    const token = getToken();
    if (!token) return;
    api
      .getNotifications(token)
      .then((list) => {
        if (Array.isArray(list)) setNotifications(list.map(mapNotification));
      })
      .catch(() => {});
  }, [authorized]);

  return (
    <div
      className={authorized ? 'flex min-h-screen flex-col bg-canvas lg:flex-row' : 'hidden'}
      aria-hidden={!authorized}
    >
      <Suspense
        fallback={
          <aside
            className='hidden h-screen w-[220px] shrink-0 bg-brand-deep lg:block xl:w-[248px]'
            aria-hidden
          />
        }
      >
        <Sidebar
          items={nav}
          roleLabel={roleLabel}
          unread={unread}
          user={{
            name: session?.name ?? 'Citizen',
            sub: session?.ward
              ? `Citizen \u00b7 Ward ${session.ward}`
              : 'Citizen',
          }}
          onSignOut={() => {
            signOut();
            router.replace('/login');
          }}
        />
      </Suspense>
      <div className='flex w-full min-w-0 flex-1 flex-col lg:w-auto'>
        <nav
          aria-label='Mobile navigation'
          className='flex gap-1 overflow-x-auto border-b border-line bg-brand-deep px-3 py-2 lg:hidden'
        >
          {nav.map((it) => {
            const active =
              nav[0].href === it.href ? path === it.href : path.startsWith(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                  active ? 'bg-brand-mid text-white' : 'text-side-text'
                }`}
              >
                <Icon name={it.icon} />
                {it.label}
              </Link>
            );
          })}
        </nav>
        {children}
      </div>
      <Toast />
    </div>
  );
}
