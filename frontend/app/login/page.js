'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/app/components/auth/AuthLayout';

import Button from '@/app/components/ui/Button';
import Field from '@/app/components/ui/Field';
import PasswordField from '@/app/components/ui/PasswordField';
import { ROLES, getRole, roleIdFromBackend } from '@/lib/roles';
import { signIn, useSession } from '@/lib/session';
import Icon from '@/app/components/ui/Icon';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const session = useSession();
  const [roleId, setRoleId] = useState('citizen');
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) router.replace(getRole(session.role)?.home ?? '/');
  }, [session, router]);

  async function onSubmit(e) {
    e.preventDefault();
    const next = {};
    if (!identity.trim()) next.identity = 'Enter your email.';
    if (!password) next.password = 'Enter your password.';
    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) return;

    setBusy(true);
    const creds = { email: identity.trim().toLowerCase(), password };
    try {
      const { user, token } =
        roleId === 'citizen'
          ? await api.loginCitizen(creds)
          : await api.loginOfficial(creds);
      const frontendRole = roleIdFromBackend(user.role);
      signIn(
        { role: frontendRole, name: user.fullName, token, user },
        remember,
      );
      router.push(getRole(frontendRole)?.home ?? '/');
    } catch (err) {
      setFormError(err.message || 'Sign in failed.');
      setBusy(false);
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={onSubmit} noValidate className='flex flex-col gap-5'>
        <h1 className='text-[30px] font-bold leading-tight text-ink'>
          Sign in to JanSambandha
        </h1>
        <p className='text-sm text-ink-3'>
          Choose your role to continue. Dashboards and permissions are
          role-based.
        </p>

        {formError && (
          <div
            role='alert'
            className='rounded-lg border border-danger/30 bg-danger-tint px-3.5 py-2.5 text-sm text-danger'
          >
            {formError}
          </div>
        )}

        <div className='flex flex-col gap-2'>
          <span id='role-label' className='text-xs font-medium text-ink-2'>
            I am signing in as
          </span>
          <div
            role='radiogroup'
            aria-labelledby='role-label'
            className='grid grid-cols-3 gap-3'
          >
            {ROLES.map((r) => {
              const on = r.id === roleId;
              return (
                <button
                  key={r.id}
                  type='button'
                  role='radio'
                  aria-checked={on}
                  onClick={() => setRoleId(r.id)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                    on
                      ? 'border-brand bg-brand-tint ring-1 ring-inset ring-brand'
                      : 'border-line bg-surface hover:border-line-strong'
                  }`}
                >
                  <span
                    className={`grid size-9 place-items-center rounded-full ${on ? 'bg-brand text-white' : 'bg-muted text-ink-2'}`}
                  >
                    <Icon name={r.icon} />
                  </span>
                  <span
                    className={`text-[13px] font-semibold ${on ? 'text-brand' : 'text-ink'}`}
                  >
                    {r.label}
                  </span>
                  <span className='text-[11px] text-ink-3'>{r.hint}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Field
          label='Email address'
          type='email'
          autoComplete='username'
          placeholder='name@example.com'
          value={identity}
          onChange={(e) => setIdentity(e.target.value)}
          error={errors.identity}
        />
        <PasswordField
          label='Password'
          autoComplete='current-password'
          placeholder='Enter your password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />

        <div className='flex items-center justify-between'>
          <label className='flex cursor-pointer items-center gap-2 text-[13px] text-ink-2'>
            <input
              type='checkbox'
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className='peer sr-only'
            />
            <span className='grid size-[18px] place-items-center rounded border border-line-strong bg-surface peer-checked:border-brand peer-checked:bg-brand peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand peer-checked:[&_svg]:opacity-100'>
              <Icon name='check' size={12} className='text-white opacity-0' />
            </span>
            Keep me signed in
          </label>
          <Link
            href='/forgot-password'
            className='text-[13px] font-medium text-brand hover:underline'
          >
            Forgot password?
          </Link>
        </div>

        <Button type='submit' disabled={busy} className='w-full'>
          {busy ? 'Signing in…' : 'Sign in'}
        </Button>

        <p className='rounded-[10px] border border-line bg-surface-alt p-3.5 text-xs leading-[18px] text-ink-3'>
          New citizen?{' '}
          <Link
            href='/register'
            className='font-medium text-brand hover:underline'
          >
            Create an account
          </Link>{' '}
          with your ward. Officials&apos; accounts are created and activated by
          the CAO.
        </p>
      </form>
    </AuthLayout>
  );
}
