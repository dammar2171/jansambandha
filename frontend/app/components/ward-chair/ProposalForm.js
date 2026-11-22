'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import WcTopBar from '@/app/components/layout/WcTopBar';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import { CATEGORIES } from '@/lib/mock/citizen';
import { showToast, upsertProject, useWc } from '@/lib/wc-store';
import { rs } from '@/lib/wc-score';
import { getToken } from '@/lib/session';
import { api } from '@/lib/api';
import { mapProposal } from '@/lib/proposals';
import { proposalSchema } from '@/lib/schemas';

const fieldClass =
  'w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20';
const labelClass = 'flex flex-col gap-1.5 text-xs font-medium text-ink-2';
const errClass = 'text-xs text-danger';

export default function ProposalForm({ initial, projectId }) {
  const router = useRouter();
  const prefill = useWc((state) => state.prefill);
  const [formError, setFormError] = useState('');
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      title: initial?.title || prefill?.title || '',
      category: initial?.category || prefill?.category || CATEGORIES[0],
      place: initial?.place || '',
      budget: initial?.budget ? String(initial.budget) : '',
      households: initial?.households
        ? String(initial.households)
        : prefill?.households || '',
      justification: initial?.justification || prefill?.justification || '',
      benefits: initial?.benefits || '',
    },
  });

  const category = useWatch({ control, name: 'category' });
  const budget = Number(useWatch({ control, name: 'budget' })) || 0;
  const households = Number(useWatch({ control, name: 'households' })) || 0;

  async function onValid(v) {
    setFormError('');
    const token = getToken();
    if (!token) {
      setFormError('Please sign in again to save a proposal.');
      return;
    }

    // Backend requires a description; reuse benefits, or fall back to the
    // justification so the required field is always populated. wardId and
    // proposedBy are derived server-side from the signed-in ward chair.
    const body = {
      title: v.title.trim(),
      description: (v.benefits || '').trim() || v.justification.trim(),
      category: v.category,
      location: v.place.trim(),
      estimatedBudget: v.budget || 0,
      fiscalYear: '2083/84',
      justification: v.justification.trim(),
    };

    try {
      const saved = projectId
        ? await api.updateProposal(token, projectId, body)
        : await api.createProposal(token, body);
      const mapped = mapProposal(saved);
      upsertProject(mapped);
      showToast(projectId ? 'Proposal updated' : 'Proposal draft saved');
      router.push(`/ward-chair/projects/${mapped.id}`);
    } catch (err) {
      setFormError(err.message || 'Could not save the proposal.');
    }
  }

  return (
    <>
      <WcTopBar
        crumbs={[
          { label: 'Ward Projects', href: '/ward-chair/projects' },
          { label: projectId ? 'Edit proposal' : 'New proposal' },
        ]}
      />
      <main className='flex flex-col gap-6 p-8'>
        <div>
          <h1 className='text-[26px] font-bold leading-[31px] text-ink'>
            {projectId ? 'Edit proposal' : 'Create a proposal'}
          </h1>
          <p className='mt-1 text-sm text-ink-3'>
            Describe the project and the need it addresses in Ward 4.
          </p>
        </div>
        <div className='grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]'>
          <Card className='p-5'>
            <form
              onSubmit={handleSubmit(onValid)}
              noValidate
              className='flex flex-col gap-4'
            >
              {formError && (
                <div
                  role='alert'
                  className='rounded-lg border border-danger/30 bg-danger-tint px-3.5 py-2.5 text-sm text-danger'
                >
                  {formError}
                </div>
              )}
              <label className={labelClass}>
                Project title
                <input className={fieldClass} {...register('title')} />
                {errors.title && (
                  <span className={errClass}>{errors.title.message}</span>
                )}
              </label>
              <label className={labelClass}>
                Category
                <select className={fieldClass} {...register('category')}>
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                Location
                <input className={fieldClass} {...register('place')} />
                {errors.place && (
                  <span className={errClass}>{errors.place.message}</span>
                )}
              </label>
              <div className='grid gap-4 sm:grid-cols-2'>
                <label className={labelClass}>
                  Estimated budget (Rs)
                  <input
                    type='number'
                    min='0'
                    className={fieldClass}
                    {...register('budget')}
                  />
                  {errors.budget && (
                    <span className={errClass}>{errors.budget.message}</span>
                  )}
                </label>
                <label className={labelClass}>
                  Households benefiting
                  <input
                    type='number'
                    min='0'
                    className={fieldClass}
                    {...register('households')}
                  />
                  {errors.households && (
                    <span className={errClass}>
                      {errors.households.message}
                    </span>
                  )}
                </label>
              </div>
              <label className={labelClass}>
                Justification
                <textarea
                  className={`${fieldClass} min-h-24 resize-y`}
                  {...register('justification')}
                />
                {errors.justification && (
                  <span className={errClass}>
                    {errors.justification.message}
                  </span>
                )}
              </label>
              <label className={labelClass}>
                Expected benefits
                <textarea
                  className={`${fieldClass} min-h-20 resize-y`}
                  {...register('benefits')}
                />
              </label>
              <div className='flex justify-end'>
                <Button type='submit' size='dash' disabled={isSubmitting}>
                  {isSubmitting
                    ? 'Saving\u2026'
                    : projectId
                      ? 'Save changes'
                      : 'Save as draft'}
                </Button>
              </div>
            </form>
          </Card>
          <Card className='p-5'>
            <h2 className='text-[15px] font-semibold text-ink'>
              Proposal summary
            </h2>
            <dl className='mt-3 flex flex-col gap-2 text-[13px]'>
              <div className='flex justify-between gap-3'>
                <dt className='text-ink-3'>Category</dt>
                <dd className='font-medium text-ink'>{category}</dd>
              </div>
              <div className='flex justify-between gap-3'>
                <dt className='text-ink-3'>Estimated budget</dt>
                <dd className='font-medium text-ink'>
                  {budget ? rs(budget) : 'Not set'}
                </dd>
              </div>
              <div className='flex justify-between gap-3'>
                <dt className='text-ink-3'>Households</dt>
                <dd className='font-medium text-ink'>
                  {households || 'Not set'}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </main>
    </>
  );
}
