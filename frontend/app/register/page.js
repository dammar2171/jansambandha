'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import Button from '@/app/components/ui/Button';
import Field from '@/app/components/ui/Field';
import SelectField from '@/app/components/ui/SelectField';
import PasswordField from '@/app/components/ui/PasswordField';
import { signIn } from '@/lib/session';
import AuthLayout from '@/app/components/auth/AuthLayout';
import { api, ApiError } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [v, setV] = useState({
    name: '',
    email: '',
    wardId: '',
    password: '',
    confirm: '',
  });
  const [wards, setWards] = useState([]);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));

  useEffect(() => {
    api
      .getWards()
      .then((list) => setWards(Array.isArray(list) ? list : []))
      .catch(() => setWards([]));
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setFormError('');
    const n = {};
    if (v.name.trim().length < 2) n.name = 'Enter your full name.';
    if (!/^\S+@\S+\.\S+$/.test(v.email.trim()))
      n.email = 'Enter a valid email address.';
    if (!v.wardId) n.wardId = 'Select your ward.';
    if (v.password.length < 8) n.password = 'Use at least 8 characters.';
    if (v.confirm !== v.password) n.confirm = 'Passwords do not match.';
    setErrors(n);
    if (Object.keys(n).length) return;

    const ward = wards.find((w) => w._id === v.wardId);
    if (!ward) {
      setErrors({ wardId: 'Select your ward.' });
      return;
    }

    setBusy(true);
    try {
      const { user, token } = await api.registerCitizen({
        fullName: v.name.trim(),
        email: v.email.trim().toLowerCase(),
        password: v.password,
        municipalityId: ward.municipalityId,
        wardId: ward._id,
      });
      signIn(
        {
          role: 'citizen',
          name: user.fullName,
          ward: ward.wardNumber,
          token,
          user,
        },
        true,
      );
      router.push('/citizen');
    } catch (err) {
      const fe = err instanceof ApiError ? err.details?.fieldErrors : undefined;
      if (fe) {
        setErrors({
          name: fe.fullName?.[0],
          email: fe.email?.[0],
          password: fe.password?.[0],
        });
      }
      setFormError(err.message || 'Registration failed.');
      setBusy(false);
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={onSubmit} noValidate className='flex flex-col gap-5'>
        <h1 className='text-[30px] font-bold leading-tight text-ink'>
          Create a citizen account
        </h1>
        <p className='text-sm text-ink-3'>
          Your contact details stay private. Only your comments appear on
          projects.
        </p>

        {formError && (
          <div
            role='alert'
            className='rounded-lg border border-danger/30 bg-danger-tint px-3.5 py-2.5 text-sm text-danger'
          >
            {formError}
          </div>
        )}

        <Field
          label='Full name'
          autoComplete='name'
          value={v.name}
          onChange={set('name')}
          error={errors.name}
        />
        <Field
          label='Email address'
          type='email'
          autoComplete='email'
          placeholder='name@example.com'
          value={v.email}
          onChange={set('email')}
          error={errors.email}
        />
        <SelectField
          label='Ward'
          value={v.wardId}
          onChange={set('wardId')}
          error={errors.wardId}
          hint='Select the ward you live in.'
        >
          <option value=''>Select your ward</option>
          {wards.map((w) => (
            <option key={w._id} value={w._id}>
              Ward {w.wardNumber} — {w.name}
            </option>
          ))}
        </SelectField>
        <PasswordField
          label='Password'
          autoComplete='new-password'
          value={v.password}
          onChange={set('password')}
          error={errors.password}
        />
        <PasswordField
          label='Confirm password'
          autoComplete='new-password'
          value={v.confirm}
          onChange={set('confirm')}
          error={errors.confirm}
        />
        <Button type='submit' disabled={busy} className='w-full'>
          {busy ? 'Creating account…' : 'Create account'}
        </Button>
        <p className='text-center text-[13px] text-ink-2'>
          Already registered?{' '}
          <Link
            href='/login'
            className='font-medium text-brand hover:underline'
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
