'use client';
import { useState } from 'react';
import Link from 'next/link';
import Icon from '@/app/components/ui/Icon';
import WcTopBar from '@/app/components/layout/WcTopBar';
import Card from '@/app/components/ui/Card';
import { StatusBadge } from '@/app/components/ui/Badge';
import { ButtonLink } from '@/app/components/ui/Button';
import { rs } from '@/lib/wc-score';
import { isEditable, useWc } from '@/lib/wc-store';

const FILTERS = [
  'All',
  'Draft',
  'Submitted',
  'Returned',
  'Approved',
  'Ongoing',
];
const COLS = 'grid-cols-[minmax(0,1fr)_110px_90px_150px_120px_130px]';

export default function WardProjectsPage() {
  const projects = useWc((s) => s.projects);
  const search = useWc((s) => s.search)
    .trim()
    .toLowerCase();
  const [filter, setFilter] = useState('All');

  const list = projects.filter(
    (p) =>
      (filter === 'All' || p.status === filter) &&
      (!search ||
        `${p.title} ${p.category} ${p.place}`.toLowerCase().includes(search)),
  );
  const count = (f) =>
    f === 'All'
      ? projects.length
      : projects.filter((p) => p.status === f).length;

  return (
    <>
      <WcTopBar crumbs={[{ label: 'Ward Projects' }]} />
      <main className='flex flex-col gap-6 p-8'>
        <div className='flex items-center justify-between gap-6'>
          <div>
            <h1 className='text-[26px] font-bold leading-[31px] text-ink'>
              Ward projects
            </h1>
            <p className='mt-1 text-sm leading-[17px] text-ink-3'>
              Every proposal and project in Ward 4, from draft to completion.
            </p>
          </div>
          <ButtonLink href='/ward-chair/proposals/new' size='dash'>
            <Icon name='plus' size={16} />
            Create proposal
          </ButtonLink>
        </div>

        <div
          className='flex flex-wrap gap-2'
          role='group'
          aria-label='Filter by status'
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              type='button'
              aria-pressed={f === filter}
              onClick={() => setFilter(f)}
              className={`rounded-full px-[15px] py-[5px] text-[13px] font-medium leading-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${f === filter ? 'bg-brand text-white' : 'border border-line-strong bg-surface text-ink-2 hover:bg-surface-alt'}`}
            >
              {f}{' '}
              <span className={f === filter ? 'text-white/80' : 'text-ink-3'}>
                {count(f)}
              </span>
            </button>
          ))}
        </div>

        <Card className='p-5'>
          <div role='table' aria-label='Ward projects'>
            <div
              role='row'
              className={`grid ${COLS} gap-3 rounded-lg bg-surface-alt px-3 py-2.5 text-[11px] font-semibold uppercase leading-[13px] tracking-wider text-ink-3`}
            >
              <span role='columnheader'>Project</span>
              <span role='columnheader'>Status</span>
              <span role='columnheader'>Priority</span>
              <span role='columnheader'>Verified progress</span>
              <span role='columnheader'>Budget</span>
              <span role='columnheader'>
                <span className='sr-only'>Actions</span>
              </span>
            </div>
            <div className='mt-1 flex flex-col gap-1'>
              {list.length ? (
                list.map((p) => (
                  <div
                    key={p.id}
                    role='row'
                    className={`grid ${COLS} items-center gap-3 rounded-lg px-3 py-3 text-[13px] leading-4 hover:bg-surface-alt`}
                  >
                    <span role='cell' className='min-w-0'>
                      <Link
                        href={`/ward-chair/projects/${p.id}`}
                        className='block truncate text-sm font-semibold text-ink hover:text-brand'
                      >
                        {p.title}
                      </Link>
                      <span className='block truncate text-xs text-ink-3'>
                        {p.category} · {p.place || 'No location yet'}
                      </span>
                    </span>
                    <span role='cell'>
                      <StatusBadge status={p.status} />
                    </span>
                    <span role='cell' className='font-medium text-ink'>
                      {p.priority}/100
                    </span>
                    <span role='cell'>
                      {p.progress ? (
                        <span className='flex items-center gap-2'>
                          <span className='h-2 w-[90px] overflow-hidden rounded-full bg-line'>
                            <span
                              className='block h-full rounded-full bg-brand'
                              style={{ width: `${p.progress.verified}%` }}
                            />
                          </span>
                          {p.progress.verified}%
                        </span>
                      ) : (
                        <span className='text-ink-3'>Not started</span>
                      )}
                    </span>
                    <span role='cell' className='text-ink-2'>
                      {p.budget ? rs(p.budget) : 'Not set'}
                    </span>
                    <span role='cell' className='flex justify-end gap-2'>
                      {isEditable(p) && (
                        <Link
                          href={`/ward-chair/projects/${p.id}/edit`}
                          className='rounded-lg border border-brand px-[11px] py-1 text-[13px] font-semibold text-brand hover:bg-brand-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
                        >
                          Edit
                        </Link>
                      )}
                      <Link
                        href={`/ward-chair/projects/${p.id}`}
                        className='rounded-lg border border-line-strong px-[11px] py-1 text-[13px] font-semibold text-ink-2 hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
                      >
                        View
                      </Link>
                    </span>
                  </div>
                ))
              ) : (
                <p className='p-6 text-center text-sm text-ink-3'>
                  No projects match this filter
                  {search ? ` and \u201c${search}\u201d` : ''}.
                </p>
              )}
            </div>
          </div>
        </Card>
      </main>
    </>
  );
}
