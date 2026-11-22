'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@/app/components/ui/Button';
import Field from '@/app/components/ui/Field';
import SelectField from '@/app/components/ui/SelectField';
import PasswordField from '@/app/components/ui/PasswordField';
import { signIn } from '@/lib/session';
import AuthLayout from '@/app/components/auth/AuthLayout';
import { api, ApiError } from '@/lib/api';
import { registerSchema } from '@/lib/schemas';

export default function RegisterPage() {
  const router = useRouter();
  const [wards, setWards] = useState([]);
  const [formError, setFormError] = useState('');
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      wardId: '',
      password: '',
      confirm: '',
    },
  });

  useEffect(() => {
    api
      .getWards()
      .then((list) => setWards(Array.isArray(list) ? list : []))
      .catch(() => setWards([]));
  }, []);

  async function onValid(v) {
    setFormError('');
    const ward = wards.find((w) => w._id === v.wardId);
    if (!ward) {
      setError('wardId', { message: 'Select your ward.' });
      return;
    }
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
      if (fe?.fullName?.[0]) setError('name', { message: fe.fullName[0] });
      if (fe?.email?.[0]) setError('email', { message: fe.email[0] });
      if (fe?.password?.[0]) setError('password', { message: fe.password[0] });
      setFormError(err.message || 'Registration failed.');
    }
  }

  return (
    <AuthLayout>
      <form
        onSubmit={handleSubmit(onValid)}
        noValidate
        className='flex flex-col gap-5'
      >
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
          {...register('name')}
          error={errors.name?.message}
        />
        <Field
          label='Email address'
          type='email'
          autoComplete='email'
          placeholder='name@example.com'
          {...register('email')}
          error={errors.email?.message}
        />
        <SelectField
          label='Ward'
          {...register('wardId')}
          error={errors.wardId?.message}
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
          {...register('password')}
          error={errors.password?.message}
        />
        <PasswordField
          label='Confirm password'
          autoComplete='new-password'
          {...register('confirm')}
          error={errors.confirm?.message}
        />
        <Button type='submit' disabled={isSubmitting} className='w-full'>
          {isSubmitting ? 'Creating account…' : 'Create account'}
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
