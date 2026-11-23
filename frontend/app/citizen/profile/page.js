'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/app/components/layout/TopBar';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import PasswordField from '@/app/components/ui/PasswordField';
import { signOut, useSession } from '@/lib/session';
import { getRole, roleIdFromBackend } from '@/lib/roles';
import { api } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema } from '@/lib/schemas';

function ChangePassword({ token }) {
  const [done, setDone] = useState('');
  const [formError, setFormError] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current: '', next: '', confirm: '' },
  });

  async function onValid(v) {
    setDone('');
    setFormError('');
    try {
      await api.changePassword(token, {
        currentPassword: v.current,
        newPassword: v.next,
      });
      setDone('Password changed successfully.');
      reset();
    } catch (err) {
      setFormError(err.message || 'Could not change password.');
    }
  }

  return (
    <Card className='p-5'>
      <form
        onSubmit={handleSubmit(onValid)}
        noValidate
        className='flex flex-col gap-4'
      >
        <h2 className='text-[18px] font-semibold leading-[24px] text-ink'>
          Change password
        </h2>

        {done && (
          <div
            role='status'
            className='rounded-lg border border-ok/30 bg-ok-tint px-3.5 py-2.5 text-sm text-ok'
          >
            {done}
          </div>
        )}
        {formError && (
          <div
            role='alert'
            className='rounded-lg border border-danger/30 bg-danger-tint px-3.5 py-2.5 text-sm text-danger'
          >
            {formError}
          </div>
        )}

        <PasswordField
          label='Current password'
          autoComplete='current-password'
          {...register('current')}
          error={errors.current?.message}
        />
        <PasswordField
          label='New password'
          autoComplete='new-password'
          {...register('next')}
          error={errors.next?.message}
        />
        <PasswordField
          label='Confirm new password'
          autoComplete='new-password'
          {...register('confirm')}
          error={errors.confirm?.message}
        />
        <div>
          <Button type='submit' size='dash' disabled={isSubmitting}>
            {isSubmitting ? 'Saving\u2026' : 'Update password'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

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
      <main className='flex w-full flex-col gap-6 p-8'>
        <h1 className='text-[28px] font-bold leading-[33px] text-ink'>
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

        {token && <ChangePassword token={token} />}

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
