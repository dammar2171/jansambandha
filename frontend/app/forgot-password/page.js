'use client';
import { useState } from 'react';
import Link from 'next/link';
import AuthLayout from '@/app/components/auth/AuthLayout';
import Button from '@/app/components/ui/Button';
import Field from '@/app/components/ui/Field';

export default function ForgotPasswordPage() {
  const [identity, setIdentity] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  function onSubmit(e) {
    e.preventDefault();
    if (!identity.trim()) return setError('Enter your email or mobile number.');
    setError('');
    setSent(true);
  }

  return (
    <AuthLayout>
      <div className='flex flex-col gap-5'>
        <h1 className='text-[30px] font-bold leading-tight text-ink'>
          Reset your password
        </h1>
        {sent ? (
          <p
            className='rounded-[10px] border border-line bg-surface-alt p-3.5 text-sm text-ink-2'
            role='status'
          >
            If an account exists for {identity.trim()}, reset instructions will
            be sent to it.
          </p>
        ) : (
          <form onSubmit={onSubmit} noValidate className='flex flex-col gap-5'>
            <p className='text-sm text-ink-3'>
              Enter the email or mobile number you registered with.
            </p>
            <Field
              label='Email or mobile number'
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              error={error}
            />
            <Button type='submit' className='w-full'>
              Send reset instructions
            </Button>
          </form>
        )}
        <Link
          href='/login'
          className='text-[13px] font-medium text-brand hover:underline'
        >
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
