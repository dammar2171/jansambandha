'use client';
import Link from 'next/link';
import TopBar from '@/app/components/layout/TopBar';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import { markAllRead, markRead, useStore } from '@/lib/store';

export default function NotificationsPage() {
  const list = useStore((s) => s.notifications);
  const unread = list.filter((n) => !n.read).length;

  return (
    <>
      <TopBar crumbs={[{ label: 'Notifications' }]} />
      <main className='flex max-w-[760px] flex-col gap-6 p-8'>
        <div className='flex items-center justify-between gap-6'>
          <div>
            <h1 className='text-[28px] font-bold leading-[33px] text-ink'>
              Notifications
            </h1>
            <p className='mt-1 text-sm leading-[18px] text-ink-3'>
              {unread ? `${unread} unread` : 'You are all caught up'}
            </p>
          </div>
          {unread > 0 && (
            <Button variant='secondary' size='dash' onClick={markAllRead}>
              Mark all as read
            </Button>
          )}
        </div>
        <Card className='divide-y divide-line overflow-hidden'>
          {list.map((n) => (
            <Link
              key={n.id}
              href={n.href}
              onClick={() => markRead(n.id)}
              className='flex items-start gap-3 p-4 hover:bg-surface-alt focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand'
            >
              <span
                className={`mt-1.5 size-2 shrink-0 rounded-full ${n.read ? 'bg-transparent' : 'bg-brand'}`}
                aria-label={n.read ? 'Read' : 'Unread'}
              />
              <span className='flex-1'>
                <span
                  className={`block text-sm leading-5 ${n.read ? 'text-ink-2' : 'font-medium text-ink'}`}
                >
                  {n.text}
                </span>
                <span className='text-xs text-ink-3'>{n.when}</span>
              </span>
            </Link>
          ))}
        </Card>
      </main>
    </>
  );
}
