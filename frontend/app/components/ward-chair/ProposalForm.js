'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import WcTopBar from '@/app/components/layout/WcTopBar';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import { CATEGORIES } from '@/lib/mock/citizen';
import { showToast, upsertProject, useWc } from '@/lib/wc-store';
import { rs } from '@/lib/wc-score';
import { getSession, getToken } from '@/lib/session';
import { api } from '@/lib/api';
import { mapProposal } from '@/lib/proposals';

const fieldClass =
  'w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20';

export default function ProposalForm({ initial, projectId }) {
  const router = useRouter();
  const prefill = useWc((state) => state.prefill);
  const [form, setForm] = useState(() => ({
    title: initial?.title || prefill?.title || '',
    category: initial?.category || prefill?.category || CATEGORIES[0],
    place: initial?.place || '',
    budget: initial?.budget ? String(initial.budget) : '',
    households: initial?.households
      ? String(initial.households)
      : prefill?.households || '',
    justification: initial?.justification || prefill?.justification || '',
    benefits: initial?.benefits || '',
  }));
  const update = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));
  const budget = Number(form.budget) || 0;
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const session = getSession();
    const wardId = session?.user?.wardId;
    const proposedBy = session?.user?._id;
    if (!projectId && !wardId) {
      showToast('Please sign in again to create a proposal.');
      return;
    }

    // Backend requires a description; reuse benefits, or fall back to the
    // justification so the required field is always populated.
    const body = {
      title: form.title.trim(),
      description: form.benefits.trim() || form.justification.trim(),
      category: form.category,
      location: form.place.trim(),
      estimatedBudget: budget,
      fiscalYear: '2083/84',
      justification: form.justification.trim(),
    };

    setSaving(true);
    try {
      const saved = projectId
        ? await api.updateProposal(getToken(), projectId, body)
        : await api.createProposal({ ...body, wardId, proposedBy });
      const mapped = mapProposal(saved);
      upsertProject(mapped);
      showToast(projectId ? 'Proposal updated' : 'Proposal draft saved');
      router.push(`/ward-chair/projects/${mapped.id}`);
    } catch (err) {
      showToast(err.message || 'Could not save the proposal.');
      setSaving(false);
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
            <form onSubmit={submit} className='flex flex-col gap-4'>
              <label className='flex flex-col gap-1.5 text-xs font-medium text-ink-2'>
                Project title
                <input
                  required
                  minLength={5}
                  value={form.title}
                  onChange={update('title')}
                  className={fieldClass}
                />
              </label>
              <label className='flex flex-col gap-1.5 text-xs font-medium text-ink-2'>
                Category
                <select
                  value={form.category}
                  onChange={update('category')}
                  className={fieldClass}
                >
                  {CATEGORIES.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label className='flex flex-col gap-1.5 text-xs font-medium text-ink-2'>
                Location
                <input
                  required
                  value={form.place}
                  onChange={update('place')}
                  className={fieldClass}
                />
              </label>
              <div className='grid gap-4 sm:grid-cols-2'>
                <label className='flex flex-col gap-1.5 text-xs font-medium text-ink-2'>
                  Estimated budget (Rs)
                  <input
                    type='number'
                    min='0'
                    value={form.budget}
                    onChange={update('budget')}
                    className={fieldClass}
                  />
                </label>
                <label className='flex flex-col gap-1.5 text-xs font-medium text-ink-2'>
                  Households benefiting
                  <input
                    type='number'
                    min='0'
                    value={form.households}
                    onChange={update('households')}
                    className={fieldClass}
                  />
                </label>
              </div>
              <label className='flex flex-col gap-1.5 text-xs font-medium text-ink-2'>
                Justification
                <textarea
                  required
                  minLength={20}
                  value={form.justification}
                  onChange={update('justification')}
                  className={`${fieldClass} min-h-24 resize-y`}
                />
              </label>
              <label className='flex flex-col gap-1.5 text-xs font-medium text-ink-2'>
                Expected benefits
                <textarea
                  value={form.benefits}
                  onChange={update('benefits')}
                  className={`${fieldClass} min-h-20 resize-y`}
                />
              </label>
              <div className='flex justify-end'>
                <Button type='submit' size='dash' disabled={saving}>
                  {saving
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
                <dd className='font-medium text-ink'>{form.category}</dd>
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
                  {Number(form.households) || 'Not set'}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </main>
    </>
  );
}
