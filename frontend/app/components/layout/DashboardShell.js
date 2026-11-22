'use client';
import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Toast from '@/app/components/ui/Toast';
import { getRole } from '@/lib/roles';
import { getToken, signOut, useSession } from '@/lib/session';
import { setNotifications, useStore } from '@/lib/store';
import { mapNotification } from '@/lib/notifications';
import { api } from '@/lib/api';

export default function DashboardShell({ role, roleLabel, nav, children }) {
  const session = useSession();
  const router = useRouter();
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
      className={authorized ? 'flex min-h-screen bg-canvas' : 'hidden'}
      aria-hidden={!authorized}
    >
      <Suspense
        fallback={
          <aside
            className='h-screen w-[248px] shrink-0 bg-brand-deep'
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
      <div className='flex min-w-0 flex-1 flex-col'>{children}</div>
      <Toast />
    </div>
  );
}
