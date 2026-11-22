'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import WcTopBar from '@/app/components/layout/WcTopBar';
import Card from '@/app/components/ui/Card';
import Badge, { StatusBadge } from '@/app/components/ui/Badge';
import Button from '@/app/components/ui/Button';
import Timeline from '@/app/components/ui/Timeline';
import { detailSteps, mapComplaint } from '@/lib/complaints';
import { DEPARTMENTS } from '@/lib/mock/wardchair';
import {
  needsResponse,
  respond,
  selectComplaint,
  setComplaints,
  useWc,
} from '@/lib/wc-store';
import { getToken } from '@/lib/session';
import { api } from '@/lib/api';

const FILTERS = [
  ['All', () => true],
  ['Needs response', (c) => needsResponse(c.status)],
  ['Assigned', (c) => ['Assigned', 'In progress'].includes(c.status)],
  ['Resolved', (c) => ['Resolved', 'Closed'].includes(c.status)],
];
const COLS = 'grid-cols-[116px_minmax(0,1fr)_90px_48px_110px]';
const STATUSES = [
  'Under review',
  'Assigned',
  'In progress',
  'Resolved',
  'Closed',
];
const STATUS_TO_BACKEND = {
  'Under review': 'UNDER_REVIEW',
  Assigned: 'ASSIGNED',
  'In progress': 'IN_PROGRESS',
  Resolved: 'RESOLVED',
  Closed: 'CLOSED',
};
const field =
  'w-full rounded-lg border border-line-strong bg-surface px-[15px] py-2.5 text-sm text-ink outline-none placeholder:text-ink-3 focus:border-brand focus:ring-2 focus:ring-brand/20';

function ResponsePanel({ c, projects }) {
  const [status, setStatus] = useState('Under review');
  const [assignee, setAssignee] = useState(DEPARTMENTS[0]);
  const [projectId, setProjectId] = useState(c.projectId || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const assigning = status === 'Assigned' || status === 'In progress';

  const [sending, setSending] = useState(false);

  async function send(e) {
    e.preventDefault();
    if (message.trim().length < 10)
      return setError(
        'Write a response of at least 10 characters. The citizen will read it.',
      );
    setError('');
    setSending(true);
    try {
      const token = getToken();
      await api.updateComplaintStatus(token, c._id, STATUS_TO_BACKEND[status]);
      await api.addComplaintResponse(token, c._id, message.trim());
      // Reflect the change locally (assignee/project links stay on the client)
      respond(c.id, {
        status,
        message: message.trim(),
        assignee: assigning ? assignee : null,
        projectId,
      });
      setMessage('');
    } catch (err) {
      setError(err.message || 'Could not send the response.');
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <Card className='flex flex-col gap-3 p-5'>
        <div className='flex items-start justify-between gap-3'>
          <div>
            <p className='text-xs leading-[15px] text-ink-3'>
              {c.id} · {c.category} · {c.age} d old
            </p>
            <h2 className='text-[15px] font-semibold leading-[19px] text-ink'>
              {c.title}
            </h2>
          </div>
          <StatusBadge status={c.status} />
        </div>
        <p className='text-[13px] leading-[19px] text-ink-2'>{c.description}</p>
        <p className='text-xs text-ink-3'>
          Reported by {c.by} · {c.location}
        </p>
        <Timeline steps={detailSteps(c)} />
      </Card>

      <Card className='p-5'>
        <form onSubmit={send} noValidate className='flex flex-col gap-3'>
          <h2 className='text-[15px] font-semibold leading-[19px] text-ink'>
            Respond to citizen
          </h2>
          <div>
            <label
              htmlFor='r-status'
              className='mb-1.5 block text-xs font-medium text-ink-2'
            >
              New status
            </label>
            <select
              id='r-status'
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={field}
            >
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          {assigning && (
            <div>
              <label
                htmlFor='r-assign'
                className='mb-1.5 block text-xs font-medium text-ink-2'
              >
                Assign to
              </label>
              <select
                id='r-assign'
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className={field}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label
              htmlFor='r-proj'
              className='mb-1.5 block text-xs font-medium text-ink-2'
            >
              Link to a project (optional)
            </label>
            <select
              id='r-proj'
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className={field}
            >
              <option value=''>No linked project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor='r-msg'
              className='mb-1.5 block text-xs font-medium text-ink-2'
            >
              Response
            </label>
            <textarea
              id='r-msg'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder='Say what you will do, or ask for more information'
              aria-invalid={!!error}
              className={`${field} h-[84px] resize-none leading-5 ${error ? 'border-danger' : ''}`}
            />
            {error && (
              <p className='mt-1.5 text-xs text-danger' role='alert'>
                {error}
              </p>
            )}
          </div>
          <Button
            type='submit'
            size='dash'
            className='w-full'
            disabled={sending}
          >
            {sending ? 'Sending\u2026' : 'Send response'}
          </Button>
        </form>
      </Card>
    </>
  );
}

export default function WardComplaintsPage() {
  const complaints = useWc((s) => s.complaints);
  const projects = useWc((s) => s.projects);
  const selectedId = useWc((s) => s.selected);
  const search = useWc((s) => s.search)
    .trim()
    .toLowerCase();
  const [filter, setFilter] = useState('All');

  // Load this ward's real complaints; keep mock data if the backend is
  // unreachable or returns nothing.
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    api
      .getComplaints(token)
      .then((list) => {
        if (Array.isArray(list) && list.length)
          setComplaints(list.map(mapComplaint));
      })
      .catch(() => {});
  }, []);

  const pred = FILTERS.find(([l]) => l === filter)[1];
  const rows = complaints
    .filter(
      (c) =>
        pred(c) &&
        (!search ||
          `${c.id} ${c.title} ${c.category}`.toLowerCase().includes(search)),
    )
    .sort((a, b) => b.age - a.age);
  const selected =
    complaints.find((c) => c.id === selectedId) || rows[0] || complaints[0];
  const need = complaints.filter((c) => needsResponse(c.status)).length;

  return (
    <>
      <WcTopBar crumbs={[{ label: 'Complaints' }]} />
      <main className='flex flex-col gap-6 p-8'>
        <div>
          <h1 className='text-[26px] font-bold leading-[31px] text-ink'>
            Complaints
          </h1>
          <p className='mt-1 text-sm leading-[17px] text-ink-3'>
            Respond to residents, assign the work and follow every complaint
            until it is resolved.
          </p>
        </div>

        <div className='grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_400px]'>
          <Card className='p-5'>
            <div className='mb-3 flex flex-wrap items-center justify-between gap-3'>
              <div className='flex items-center gap-3'>
                <h2 className='text-base font-semibold leading-[21px] text-ink'>
                  Complaint inbox
                </h2>
                <Badge tone='warn'>{need} need response</Badge>
              </div>
              <div
                className='flex flex-wrap gap-2'
                role='group'
                aria-label='Filter complaints'
              >
                {FILTERS.map(([l]) => (
                  <button
                    key={l}
                    type='button'
                    aria-pressed={l === filter}
                    onClick={() => setFilter(l)}
                    className={`rounded-full px-[13px] py-[4px] text-[13px] font-medium leading-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${l === filter ? 'bg-brand text-white' : 'border border-line-strong text-ink-2 hover:bg-surface-alt'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div role='table' aria-label='Complaint inbox'>
              <div
                role='row'
                className={`grid ${COLS} gap-2 rounded-lg bg-surface-alt px-2 py-2.5 text-[11px] font-semibold uppercase leading-[13px] tracking-wider text-ink-3`}
              >
                <span role='columnheader'>Tracking no</span>
                <span role='columnheader'>Complaint</span>
                <span role='columnheader'>Category</span>
                <span role='columnheader'>Age</span>
                <span role='columnheader'>Status</span>
              </div>
              <div className='mt-1 flex flex-col gap-1'>
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
                          setFilter('All');
                          selectComplaint(c.id);
                        }}
                        className={`grid ${COLS} items-center gap-2 rounded-lg px-2 py-3 text-left text-[13px] leading-4 focus-visible:outline-2 focus-visible:outline-brand ${on ? 'bg-brand-tint' : 'hover:bg-surface-alt'}`}
                      >
                        <span role='cell' className='font-medium text-brand'>
                          {c.id}
                        </span>
                        <span role='cell' className='truncate text-ink'>
                          {c.title}
                        </span>
                        <span role='cell'>
                          <Badge>{c.category}</Badge>
                        </span>
                        <span role='cell' className='text-ink-2'>
                          {c.age} d
                        </span>
                        <span role='cell'>
                          <StatusBadge status={c.status} />
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <p className='p-6 text-center text-sm text-ink-3'>
                    No complaints in this view.{' '}
                    <Link
                      href='/ward-chair'
                      className='font-medium text-brand hover:underline'
                    >
                      Back to dashboard
                    </Link>
                  </p>
                )}
              </div>
            </div>
          </Card>

          <div className='flex flex-col gap-4'>
            {selected && (
              <ResponsePanel
                key={selected.id}
                c={selected}
                projects={projects}
              />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
