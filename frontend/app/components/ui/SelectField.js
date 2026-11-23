'use client';
import { useId } from 'react';

export default function SelectField({
  label,
  error,
  hint,
  id,
  className = '',
  children,
  ...props
}) {
  const auto = useId();
  const fid = id || auto;
  const describedBy = error ? `${fid}-err` : hint ? `${fid}-hint` : undefined;
  return (
    <div className='flex flex-col gap-1.5'>
      <label htmlFor={fid} className='text-xs font-medium text-ink-2'>
        {label}
      </label>
      <select
        id={fid}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`w-full rounded-lg border bg-surface px-3.5 py-3 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 ${error ? 'border-danger' : 'border-line-strong'} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={`${fid}-err`} className='text-xs text-danger'>
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${fid}-hint`} className='text-xs text-ink-3'>
          {hint}
        </p>
      )}
    </div>
  );
}
