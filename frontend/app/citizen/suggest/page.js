'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/app/components/layout/TopBar';
import Card from '@/app/components/ui/Card';
import Button, { ButtonLink } from '@/app/components/ui/Button';
import { CATEGORIES } from '@/lib/mock/citizen';
import { addSuggestion } from '@/lib/store';

const input =
  'w-full rounded-lg border bg-surface px-[15px] py-3 text-sm text-ink outline-none placeholder:text-ink-3 focus:border-brand focus:ring-2 focus:ring-brand/20';

export default function SuggestPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Water');
  const [why, setWhy] = useState('');
  const [errors, setErrors] = useState({});

  function submit(e) {
    e.preventDefault();
    const n = {};
    if (title.trim().length < 5)
      n.title = 'Name the project in at least 5 characters.';
    if (why.trim().length < 20)
      n.why = 'Explain why it is needed in at least 20 characters.';
    setErrors(n);
    if (Object.keys(n).length) return;
    addSuggestion({ title: title.trim(), category, why: why.trim() });
    router.push('/citizen/feedback');
  }

  return (
    <>
      <TopBar
        crumbs={[
          { label: 'My Feedback', href: '/citizen/feedback' },
          { label: 'Suggest a project' },
        ]}
      />
      <main className='flex flex-col gap-6 p-8'>
        <div>
          <h1 className='text-[28px] font-bold leading-[33px] text-ink'>
            Suggest a project
          </h1>
          <p className='mt-1 text-sm leading-[18px] text-ink-3'>
            Tell your ward chairperson what Ward 4 needs next. Suggestions feed
            into the next annual plan.
          </p>
        </div>
        <Card className='max-w-[520px] p-5'>
          <form onSubmit={submit} noValidate className='flex flex-col gap-3.5'>
            <div>
              <label
                htmlFor='s-title'
                className='mb-1.5 block text-xs font-medium text-ink-2'
              >
                Project name
              </label>
              <input
                id='s-title'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='Drainage along the market road'
                aria-invalid={!!errors.title}
                className={`${input} ${errors.title ? 'border-danger' : 'border-line-strong'}`}
              />
              {errors.title && (
                <p className='mt-1.5 text-xs text-danger' role='alert'>
                  {errors.title}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor='s-cat'
                className='mb-1.5 block text-xs font-medium text-ink-2'
              >
                Category
              </label>
              <select
                id='s-cat'
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`${input} border-line-strong`}
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor='s-why'
                className='mb-1.5 block text-xs font-medium text-ink-2'
              >
                Why is it needed?
              </label>
              <textarea
                id='s-why'
                value={why}
                onChange={(e) => setWhy(e.target.value)}
                placeholder='Who is affected, and what happens without it'
                aria-invalid={!!errors.why}
                className={`${input} h-[96px] resize-none ${errors.why ? 'border-danger' : 'border-line-strong'}`}
              />
              {errors.why && (
                <p className='mt-1.5 text-xs text-danger' role='alert'>
                  {errors.why}
                </p>
              )}
            </div>
            <div className='flex gap-2.5'>
              <Button type='submit' size='dash' className='flex-1'>
                Send suggestion
              </Button>
              <ButtonLink
                href='/citizen/feedback'
                variant='secondary'
                size='dash'
              >
                Cancel
              </ButtonLink>
            </div>
          </form>
        </Card>
      </main>
    </>
  );
}
