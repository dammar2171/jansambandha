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
import { CATEGORIES, SIMILAR_COUNTS } from '@/lib/mock/citizen';
import {
  saveDraft,
  useStore,
  setComplaints,
  prependComplaint,
  showToast,
} from '@/lib/store';
import { api } from '@/lib/api';
import { getSession, getToken } from '@/lib/session';

const inputBase =
  'w-full rounded-lg border bg-surface px-[15px] py-3 text-sm leading-[17px] text-ink outline-none placeholder:text-ink-3 focus:border-brand focus:ring-2 focus:ring-brand/20';

function FieldShell({ label, htmlFor, error, children }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className='mb-1.5 block text-xs font-medium leading-[15px] text-ink-2'
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
  const draft = useStore((s) => s.draft);
  const [category, setCategory] = useState(draft?.category || 'Water');
  const [title, setTitle] = useState(draft?.title || '');
  const [description, setDescription] = useState(draft?.description || '');
  const [location, setLocation] = useState(draft?.location || '');
  const [photos, setPhotos] = useState(draft?.photos || []);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const similar = SIMILAR_COUNTS[category];

  function onFiles(e) {
    const names = Array.from(e.target.files).map((f) => f.name);
    setPhotos((p) => [...p, ...names].slice(0, 4));
    e.target.value = '';
  }

  async function submit(e) {
    e.preventDefault();
    const next = {};
    if (title.trim().length < 5)
      next.title = 'Give the problem a short title, at least 5 characters.';
    if (description.trim().length < 20)
      next.description =
        'Describe the problem in at least 20 characters so the ward can act on it.';
    setErrors(next);
    if (Object.keys(next).length) return;

    const token = getToken();
    const wardId = getSession()?.user?.wardId;
    if (!token || !wardId) {
      showToast('Please sign in again to submit a complaint.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.createComplaint(token, {
        category,
        title: title.trim(),
        description: description.trim(),
        location: location.trim() || 'My ward',
        wardId,
      });
      const mapped = mapComplaint(created);
      prependComplaint(mapped);
      showToast(`Complaint ${mapped.id} submitted`);
      setTitle('');
      setDescription('');
      setLocation('');
      setPhotos([]);
      setCategory('Water');
      onCreated(mapped.id);
    } catch (err) {
      showToast(err.message || 'Could not submit complaint.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className='self-start p-5'>
      <form onSubmit={submit} noValidate className='flex flex-col gap-3.5'>
        <h2 className='text-[17px] font-semibold leading-[22px] text-ink'>
          Report a problem
        </h2>

        <fieldset>
          <legend className='mb-1.5 text-xs font-medium leading-[15px] text-ink-2'>
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
                  className={`rounded-full text-[13px] leading-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
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
              value='Ward 4 · Kailali Municipality'
              className={`${inputBase} border-line-strong bg-surface-alt pl-[39px] text-ink-2`}
            />
          </div>
        </FieldShell>

        <FieldShell label='Title' htmlFor='title' error={errors.title}>
          <input
            id='title'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='No water for 5 days in Ward 4'
            aria-invalid={!!errors.title}
            className={`${inputBase} ${errors.title ? 'border-danger' : 'border-line-strong'}`}
          />
        </FieldShell>

        <FieldShell
          label='Describe the problem'
          htmlFor='desc'
          error={errors.description}
        >
          <textarea
            id='desc'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder='Ward 4 main road, near Shiv Mandir'
              className={`${inputBase} border-line-strong pl-[39px]`}
            />
          </div>
        </FieldShell>

        <div>
          <label
            className={`flex h-[78px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-line-strong bg-surface-alt text-ink-2 transition-colors hover:border-brand hover:text-brand focus-within:outline-2 focus-within:outline-brand ${photos.length >= 4 ? 'pointer-events-none opacity-60' : ''}`}
          >
            <Icon name='cam' size={22} />
            <span className='text-[13px] font-medium leading-4'>
              Add photos (up to 4)
            </span>
            <input
              type='file'
              accept='image/*'
              multiple
              onChange={onFiles}
              className='sr-only'
              disabled={photos.length >= 4}
            />
          </label>
          {photos.length > 0 && (
            <ul className='mt-2 flex flex-wrap gap-2'>
              {photos.map((n, i) => (
                <li
                  key={n + i}
                  className='inline-flex items-center gap-1.5 rounded-full bg-muted py-1 pl-3 pr-1.5 text-xs text-ink-2'
                >
                  {n}
                  <button
                    type='button'
                    aria-label={`Remove ${n}`}
                    onClick={() =>
                      setPhotos((p) => p.filter((_, j) => j !== i))
                    }
                    className='grid size-5 place-items-center rounded-full hover:bg-line'
                  >
                    <Icon name='close' size={12} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {similar && (
          <div className='flex gap-3 rounded-[10px] border border-brand/20 bg-brand-tint p-3'>
            <Icon name='info' size={18} className='mt-0.5 text-brand' />
            <p className='text-[13px] leading-[17px] text-ink-2'>
              {similar} similar {category.toLowerCase()} complaints were
              reported in Ward 4. Yours will be grouped with them so the ward
              sees the demand.
            </p>
          </div>
        )}

        <div className='flex items-start gap-2.5'>
          <Button
            type='submit'
            size='dash'
            className='flex-1'
            disabled={submitting}
          >
            <Icon name='send' size={16} />
            {submitting ? 'Submitting…' : 'Submit complaint'}
          </Button>
          <Button
            type='button'
            variant='secondary'
            size='dash'
            onClick={() =>
              saveDraft({ category, title, description, location, photos })
            }
          >
            Save draft
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default function ComplaintsPage() {
  const complaints = useStore((s) => s.complaints);
  const projects = useStore((s) => s.projects);
  const search = useStore((s) => s.search)
    .trim()
    .toLowerCase();
  const [selectedId, setSelectedId] = useState(null);

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
  const open = complaints.filter(
    (c) => !['Resolved', 'Closed'].includes(c.status),
  ).length;

  return (
    <>
      <TopBar crumbs={[{ label: 'Complaints' }]} />
      <main className='flex flex-col gap-6 p-8'>
        <div className='py-6'>
          <h1 className='text-[26px] font-bold leading-[31px] text-ink'>
            Complaints
          </h1>
          <p className='mt-1 text-sm leading-[17px] text-ink-3'>
            Raise a problem with your ward and follow it until it is resolved.
          </p>
        </div>

        <div className='grid items-start gap-6 xl:grid-cols-[520px_minmax(0,1fr)]'>
          <ReportForm onCreated={setSelectedId} />

          <div className='flex flex-col gap-4'>
            <Card className='p-5'>
              <div className='mb-1.5 flex items-center justify-between'>
                <h2 className='text-[17px] font-semibold leading-[22px] text-ink'>
                  My complaints
                </h2>
                <Badge tone='warn'>{open} open</Badge>
              </div>
              <div role='table' aria-label='My complaints' className='mt-3'>
                <div
                  role='row'
                  className='grid grid-cols-[118px_minmax(0,1fr)_118px_70px] gap-2 rounded-lg bg-surface-alt px-2 py-2.5 text-[11px] font-semibold uppercase leading-[13px] tracking-wider text-ink-3'
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
                          onClick={() => setSelectedId(c.id)}
                          className={`grid grid-cols-[118px_minmax(0,1fr)_118px_70px] items-center gap-2 rounded-lg px-2 py-[10px] text-left text-[13px] leading-4 transition-colors focus-visible:outline-2 focus-visible:outline-brand ${on ? 'bg-brand-tint' : 'hover:bg-surface-alt'}`}
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
                    <p className='text-xs leading-[15px] text-ink-3'>
                      {selected.id} · {selected.category}
                    </p>
                    <h2 className='text-[15px] font-semibold leading-[19px] text-ink'>
                      {selected.title}
                    </h2>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>
                <Timeline steps={detailSteps(selected)} />
                {linked && (
                  <div className='flex items-center gap-3 rounded-[10px] border border-line bg-surface-alt p-[13px]'>
                    <Icon name='folder' size={18} className='text-brand' />
                    <div className='min-w-0 flex-1'>
                      <p className='text-[11px] leading-[13px] text-ink-3'>
                        Linked project
                      </p>
                      <p className='truncate text-[13px] font-semibold leading-4 text-ink'>
                        {linked.title}
                      </p>
                    </div>
                    <Link
                      href={`/citizen/projects/${linked.id}`}
                      className='rounded-lg border border-brand px-[11px] py-1 text-[13px] font-semibold leading-[17px] text-brand hover:bg-brand-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
                    >
                      Open
                    </Link>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
