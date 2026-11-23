'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/app/components/ui/Icon';
import TopBar from '@/app/components/layout/TopBar';
import Card from '@/app/components/ui/Card';
import Badge, { StatusBadge } from '@/app/components/ui/Badge';
import Button from '@/app/components/ui/Button';
import Timeline from '@/app/components/ui/Timeline';
import { detailSteps, mapComplaint } from '@/lib/complaints';
import { CATEGORIES } from '@/lib/categories';
import {
  saveDraft,
  useStore,
  setComplaints,
  prependComplaint,
  showToast,
} from '@/lib/store';
import { api } from '@/lib/api';
import { getSession, getToken, useSession } from '@/lib/session';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { complaintSchema } from '@/lib/schemas';

const inputBase =
  'w-full rounded-lg border bg-surface px-[15px] py-3 text-sm leading-[18px] text-ink outline-none placeholder:text-ink-3 focus:border-brand focus:ring-2 focus:ring-brand/20';

function FieldShell({ label, htmlFor, error, children }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className='mb-1.5 block text-xs font-medium leading-[16px] text-ink-2'
      >
        {label}
      </label>
      {children}
      {error && (
        <p className='mt-1.5 text-xs text-danger' role='alert'>
          {error}
        </p>
      )}
    </div>
  );
}

function ReportForm({ onCreated }) {
  const session = useSession();
  const draft = useStore((s) => s.draft);
  const [category, setCategory] = useState(draft?.category || 'Water');
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      title: draft?.title || '',
      description: draft?.description || '',
      location: draft?.location || '',
    },
  });
  const wardLabel = session?.ward
    ? `Ward ${session.ward}${session?.municipality ? ` \u00b7 ${session.municipality}` : ''}`
    : 'Your ward';

  async function onValid(v) {
    const token = getToken();
    const wardId = getSession()?.user?.wardId;
    if (!token || !wardId) {
      showToast('Please sign in again to submit a complaint.');
      return;
    }
    try {
      const created = await api.createComplaint(token, {
        category,
        title: v.title.trim(),
        description: v.description.trim(),
        location: (v.location || '').trim() || 'My ward',
        wardId,
      });
      const mapped = mapComplaint(created);
      prependComplaint(mapped);
      showToast(`Complaint ${mapped.id} submitted`);
      reset({ title: '', description: '', location: '' });
      setCategory('Water');
      onCreated(mapped.id);
    } catch (err) {
      showToast(err.message || 'Could not submit complaint.');
    }
  }

  function onSaveDraft() {
    saveDraft({ category, ...getValues() });
  }

  return (
    <Card className='self-start p-4 sm:p-5'>
      <form
        onSubmit={handleSubmit(onValid)}
        noValidate
        className='flex flex-col gap-3.5'
      >
        <h2 className='text-[18px] font-semibold leading-[24px] text-ink'>
          Report a problem
        </h2>

        <fieldset>
          <legend className='mb-1.5 text-xs font-medium leading-[16px] text-ink-2'>
            Category
          </legend>
          <div
            className='flex flex-wrap items-start gap-2'
            role='radiogroup'
            aria-label='Category'
          >
            {CATEGORIES.map((c) => {
              const on = c === category;
              return (
                <button
                  key={c}
                  type='button'
                  role='radio'
                  aria-checked={on}
                  onClick={() => setCategory(c)}
                  className={`shrink-0 whitespace-nowrap rounded-full text-[14px] leading-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                    on
                      ? 'border-2 border-brand bg-brand-tint px-4 py-[7px] font-semibold text-brand'
                      : 'border border-line-strong px-[15px] py-2 font-medium text-ink-2 hover:bg-surface-alt'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </fieldset>

        <FieldShell label='Ward' htmlFor='ward'>
          <div className='relative'>
            <Icon
              name='lock'
              size={16}
              className='absolute left-[15px] top-3 text-ink-3'
            />
            <input
              id='ward'
              disabled
              value={wardLabel}
              className={`${inputBase} border-line-strong bg-surface-alt pl-[39px] text-ink-2`}
            />
          </div>
        </FieldShell>

        <FieldShell label='Title' htmlFor='title' error={errors.title?.message}>
          <input
            id='title'
            {...register('title')}
            placeholder='No water for 5 days in Ward 4'
            aria-invalid={!!errors.title}
            className={`${inputBase} ${errors.title ? 'border-danger' : 'border-line-strong'}`}
          />
        </FieldShell>

        <FieldShell
          label='Describe the problem'
          htmlFor='desc'
          error={errors.description?.message}
        >
          <textarea
            id='desc'
            {...register('description')}
            placeholder='Tap water has not reached the Ward 4 main road for 5 days. Say who is affected and since when.'
            aria-invalid={!!errors.description}
            className={`${inputBase} h-[84px] resize-none leading-5 ${errors.description ? 'border-danger' : 'border-line-strong'}`}
          />
        </FieldShell>

        <FieldShell label='Location' htmlFor='loc'>
          <div className='relative'>
            <Icon
              name='pin'
              size={16}
              className='absolute left-[15px] top-3 text-ink-3'
            />
            <input
              id='loc'
              {...register('location')}
              placeholder='Ward 4 main road, near Shiv Mandir'
              className={`${inputBase} border-line-strong pl-[39px]`}
            />
          </div>
        </FieldShell>

        <div className='flex flex-wrap items-center gap-2.5'>
          <Button
            type='submit'
            size='dash'
            className='min-w-[160px] flex-1'
            disabled={isSubmitting}
          >
            <Icon name='send' size={16} />
            {isSubmitting ? 'Submitting…' : 'Submit complaint'}
          </Button>
          <Button
            type='button'
            variant='secondary'
            size='dash'
            onClick={onSaveDraft}
          >
            Save draft
          </Button>
        </div>
      </form>
    </Card>
  );
}

// Edit an own complaint while it is still "Submitted" (before the ward reviews it).
function EditForm({ complaint, onDone }) {
  const [category, setCategory] = useState(complaint.category || 'Water');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      title: complaint.title || '',
      description: complaint.description || '',
      location: complaint.location || '',
    },
  });

  async function onValid(v) {
    const token = getToken();
    if (!token) {
      showToast('Please sign in again to edit this complaint.');
      return;
    }
    try {
      await api.updateComplaint(token, complaint._id, {
        title: v.title.trim(),
        description: v.description.trim(),
        category,
        location: (v.location || '').trim() || 'My ward',
      });
      const list = await api.getMyComplaints(token);
      if (Array.isArray(list)) setComplaints(list.map(mapComplaint));
      showToast('Complaint updated');
      onDone();
    } catch (err) {
      showToast(err.message || 'Could not update complaint.');
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onValid)}
      noValidate
      className='flex flex-col gap-3.5'
    >
      <fieldset>
        <legend className='mb-1.5 text-xs font-medium leading-[16px] text-ink-2'>
          Category
        </legend>
        <div
          className='flex flex-wrap items-start gap-2'
          role='radiogroup'
          aria-label='Category'
        >
          {CATEGORIES.map((c) => {
            const on = c === category;
            return (
              <button
                key={c}
                type='button'
                role='radio'
                aria-checked={on}
                onClick={() => setCategory(c)}
                className={`shrink-0 whitespace-nowrap rounded-full text-[14px] leading-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                  on
                    ? 'border-2 border-brand bg-brand-tint px-4 py-[7px] font-semibold text-brand'
                    : 'border border-line-strong px-[15px] py-2 font-medium text-ink-2 hover:bg-surface-alt'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </fieldset>

      <FieldShell
        label='Title'
        htmlFor='edit-title'
        error={errors.title?.message}
      >
        <input
          id='edit-title'
          {...register('title')}
          aria-invalid={!!errors.title}
          className={`${inputBase} ${errors.title ? 'border-danger' : 'border-line-strong'}`}
        />
      </FieldShell>

      <FieldShell
        label='Describe the problem'
        htmlFor='edit-desc'
        error={errors.description?.message}
      >
        <textarea
          id='edit-desc'
          {...register('description')}
          aria-invalid={!!errors.description}
          className={`${inputBase} h-[84px] resize-none leading-5 ${errors.description ? 'border-danger' : 'border-line-strong'}`}
        />
      </FieldShell>

      <FieldShell label='Location' htmlFor='edit-loc'>
        <input
          id='edit-loc'
          {...register('location')}
          className={`${inputBase} border-line-strong`}
        />
      </FieldShell>

      <div className='flex flex-wrap items-center gap-2.5'>
        <Button
          type='submit'
          size='dash'
          className='min-w-[160px] flex-1'
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving…' : 'Save changes'}
        </Button>
        <Button type='button' variant='secondary' size='dash' onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function ComplaintsPage() {
  const complaints = useStore((s) => s.complaints);
  const projects = useStore((s) => s.projects);
  const search = useStore((s) => s.search)
    .trim()
    .toLowerCase();
  const [selectedId, setSelectedId] = useState(null);
  const [editing, setEditing] = useState(false);

  // Load this citizen's real complaints; keep mock data if the backend is unreachable
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    api
      .getMyComplaints(token)
      .then((list) => {
        if (Array.isArray(list)) setComplaints(list.map(mapComplaint));
      })
      .catch(() => {});
  }, []);

  const rows = complaints.filter(
    (c) =>
      !search ||
      `${c.id} ${c.title} ${c.category}`.toLowerCase().includes(search),
  );
  const selected = complaints.find((c) => c.id === selectedId) || complaints[0];
  const linked = selected && projects.find((p) => p.id === selected.projectId);
  // A citizen may edit their own complaint only while it is still submitted.
  const editable = selected?.status === 'Submitted' && !!selected?._id;
  const open = complaints.filter(
    (c) => !['Resolved', 'Closed'].includes(c.status),
  ).length;

  return (
    <>
      <TopBar crumbs={[{ label: 'Complaints' }]} />
      <main className='flex w-full flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-8'>
        <div className='py-2 sm:py-6'>
          <h1 className='text-[24px] font-bold leading-[30px] text-ink sm:text-[28px] sm:leading-[33px]'>
            Complaints
          </h1>
          <p className='mt-1 text-sm leading-[18px] text-ink-3'>
            Raise a problem with your ward and follow it until it is resolved.
          </p>
        </div>

        <div className='grid items-start gap-4 sm:gap-6 xl:grid-cols-[minmax(0,440px)_minmax(0,1fr)]'>
          <ReportForm onCreated={setSelectedId} />

          <div className='flex flex-col gap-4'>
            <Card className='p-4 sm:p-5'>
              <div className='mb-1.5 flex flex-wrap items-center justify-between gap-2'>
                <h2 className='text-[18px] font-semibold leading-[24px] text-ink'>
                  My complaints
                </h2>
                <Badge tone='warn'>{open} open</Badge>
              </div>
              <div role='table' aria-label='My complaints' className='mt-3 overflow-x-auto'>
                <div
                  role='row'
                  className='grid min-w-[360px] grid-cols-[118px_minmax(0,1fr)_118px_70px] gap-2 rounded-lg bg-surface-alt px-2 py-2.5 text-[12px] font-semibold uppercase leading-[14px] tracking-wider text-ink-3'
                >
                  <span role='columnheader'>Tracking no</span>
                  <span role='columnheader'>Complaint</span>
                  <span role='columnheader'>Status</span>
                  <span role='columnheader'>Date</span>
                </div>
                <div className='mt-1.5 flex flex-col gap-1.5'>
                  {rows.length ? (
                    rows.map((c) => {
                      const on = c.id === selected?.id;
                      return (
                        <button
                          key={c.id}
                          type='button'
                          role='row'
                          aria-selected={on}
                          onClick={() => {
                            setSelectedId(c.id);
                            setEditing(false);
                          }}
                          className={`grid min-w-[360px] grid-cols-[118px_minmax(0,1fr)_118px_70px] items-center gap-2 rounded-lg px-2 py-[10px] text-left text-[14px] leading-4 transition-colors focus-visible:outline-2 focus-visible:outline-brand ${on ? 'bg-brand-tint' : 'hover:bg-surface-alt'}`}
                        >
                          <span role='cell' className='font-medium text-brand'>
                            {c.id}
                          </span>
                          <span role='cell' className='truncate text-ink'>
                            {c.title}
                          </span>
                          <span role='cell'>
                            <StatusBadge status={c.status} />
                          </span>
                          <span role='cell' className='text-ink-2'>
                            {c.date}
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <p className='p-3 text-sm text-ink-3'>
                      No complaints match your search.
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {selected && (
              <Card className='flex flex-col gap-3 p-5'>
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <p className='text-xs leading-[16px] text-ink-3'>
                      {selected.id} · {selected.category}
                    </p>
                    <h2 className='text-[16px] font-semibold leading-[21px] text-ink'>
                      {selected.title}
                    </h2>
                  </div>
                  <div className='flex items-center gap-2'>
                    {editable && !editing && (
                      <button
                        type='button'
                        onClick={() => setEditing(true)}
                        className='rounded-lg border border-line-strong px-2.5 py-1 text-[13px] font-semibold leading-[18px] text-ink-2 hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
                      >
                        Edit
                      </button>
                    )}
                    <StatusBadge status={selected.status} />
                  </div>
                </div>
                {editing ? (
                  <EditForm
                    complaint={selected}
                    onDone={() => setEditing(false)}
                  />
                ) : (
                  <>
                    <Timeline steps={detailSteps(selected)} />
                    {editable && (
                      <p className='text-xs leading-[16px] text-ink-3'>
                        You can edit this complaint until the ward starts
                        reviewing it.
                      </p>
                    )}
                    {linked && (
                      <div className='flex items-center gap-3 rounded-[10px] border border-line bg-surface-alt p-[13px]'>
                        <Icon name='folder' size={18} className='text-brand' />
                        <div className='min-w-0 flex-1'>
                          <p className='text-[12px] leading-[14px] text-ink-3'>
                            Linked project
                          </p>
                          <p className='truncate text-[14px] font-semibold leading-4 text-ink'>
                            {linked.title}
                          </p>
                        </div>
                        <Link
                          href={`/citizen/projects/${linked.id}`}
                          className='rounded-lg border border-brand px-[11px] py-1 text-[14px] font-semibold leading-[18px] text-brand hover:bg-brand-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
                        >
                          Open
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </Card>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
