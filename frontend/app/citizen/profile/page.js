'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/app/components/layout/TopBar';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import { signOut, useSession } from '@/lib/session';
import { getRole, roleIdFromBackend } from '@/lib/roles';
import { api } from '@/lib/api';

export default function ProfilePage() {
  const session = useSession();
  const router = useRouter();
  const token = session?.token;

  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    let active = true;
    api
      .getMe(token)
      .then((data) => {
        if (!active) return;
        setMe(data);
        setError('');
      })
      .catch((err) => {
        if (active) setError(err.message || 'Could not load your profile.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  const pending = loading && !me ? 'Loading\u2026' : '\u2014';
  const municipality = me?.municipalityId?.name ?? 'Kailali Municipality';
  const ward =
    me?.wardId?.wardNumber != null
      ? `Ward ${me.wardId.wardNumber}, ${municipality}`
      : pending;

  const rows = [
    ['Name', me?.fullName ?? session?.name ?? pending],
    ['Email', me?.email ?? pending],
    ['Ward', ward],
    [
      'Role',
      getRole(roleIdFromBackend(me?.role ?? 'citizen'))?.label ?? 'Citizen',
    ],
  ];

  return (
    <>
      <TopBar crumbs={[{ label: 'Profile' }]} />
      <main className='flex max-w-[560px] flex-col gap-6 p-8'>
        <h1 className='text-[26px] font-bold leading-[31px] text-ink'>
          Profile
        </h1>

        {error && (
          <div
            role='alert'
            className='rounded-lg border border-danger/30 bg-danger-tint px-3.5 py-2.5 text-sm text-danger'
          >
            {error}
          </div>
        )}

        <Card className='p-5'>
          <dl className='flex flex-col divide-y divide-line text-sm'>
            {rows.map(([k, v]) => (
              <div
                key={k}
                className='flex justify-between gap-4 py-3 first:pt-0 last:pb-0'
              >
                <dt className='text-ink-3'>{k}</dt>
                <dd className='font-medium text-ink'>{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <p className='text-xs text-ink-3'>
          Your contact details are private. Only your comments are visible on
          projects.
        </p>
        <div>
          <Button
            variant='secondary'
            size='dash'
            onClick={() => {
              signOut();
              router.replace('/login');
            }}
          >
            Sign out
          </Button>
        </div>
      </main>
    </>
  );
}
