'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Icon from '@/app/components/ui/Icon';
import WcTopBar from '@/app/components/layout/WcTopBar';
import Card from '@/app/components/ui/Card';
import Badge, { StatusBadge } from '@/app/components/ui/Badge';
import Button, { ButtonLink } from '@/app/components/ui/Button';
import ProgressBar from '@/app/components/ui/ProgressBar';
import Timeline from '@/app/components/ui/Timeline';
import { ScoreCard } from '@/app/components/ward-chair/ScorePanel';
import { downloadCsv } from '@/lib/csv';
import { rs } from '@/lib/wc-score';
import { isEditable, showToast, submitProposal, useWc } from '@/lib/wc-store';

export default function WardProjectDetail() {
  const { id } = useParams();
  const p = useWc((s) => s.projects.find((x) => x.id === id));

  if (!p) {
    return (
      <>
        <WcTopBar
          crumbs={[
            { label: 'Ward Projects', href: '/ward-chair/projects' },
            { label: 'Not found' },
          ]}
        />
        <main className='p-8'>
          <Card className='max-w-lg p-6'>
            <h1 className='text-lg font-semibold text-ink'>
              Project not found
            </h1>
            <p className='mt-1 text-sm text-ink-3'>
              This project does not exist in Ward 4.
            </p>
            <Link
              href='/ward-chair/projects'
              className='mt-4 inline-block text-sm font-medium text-brand hover:underline'
            >
              Back to ward projects
            </Link>
          </Card>
        </main>
      </>
    );
  }

  const votes = p.up + p.down;
  const support = votes ? Math.round((p.up / votes) * 100) : null;
  const steps = p.history.map((h, i) => ({
    title: h.title,
    sub: `${h.who} · ${h.date}${h.note ? `: \u201c${h.note}\u201d` : ''}`,
    state: i === p.history.length - 1 ? 'current' : 'done',
  }));

  function download() {
    downloadCsv(
      `${p.id}-details.csv`,
      ['Field', 'Value'],
      [
        ['Title', p.title],
        ['Category', p.category],
        ['Location', p.place],
        ['Fiscal year', p.fy],
        ['Estimated budget', rs(p.budget)],
        ['Households benefiting', p.households],
        ['Status', p.statusNote],
        ['Priority score', `${p.priority}/100`],
        ['Justification', p.justification],
        ['Expected benefits', p.benefits],
      ],
    );
    showToast('Project details downloaded');
  }

  return (
    <>
      <WcTopBar
        crumbs={[
          { label: 'Ward Projects', href: '/ward-chair/projects' },
          { label: p.title },
        ]}
      />
      <main className='flex flex-col gap-6 p-8'>
        <div className='flex flex-wrap items-center justify-between gap-6'>
          <div>
            <div className='flex flex-wrap items-center gap-3'>
              <h1 className='text-[26px] font-bold leading-[31px] text-ink'>
                {p.title}
              </h1>
              <StatusBadge status={p.status} />
              <Badge>{p.category}</Badge>
            </div>
            <p className='mt-2 text-[13px] leading-[17px] text-ink-3'>
              {p.place || 'No location yet'} · FY {p.fy}
            </p>
          </div>
          <div className='flex items-center gap-2.5'>
            <Button variant='secondary' size='dash' onClick={download}>
              <Icon name='dl' size={16} />
              Download details
            </Button>
            {isEditable(p) && (
              <ButtonLink
                href={`/ward-chair/projects/${p.id}/edit`}
                variant={p.status === 'Returned' ? 'primary' : 'outline'}
                size='dash'
              >
                {p.status === 'Returned'
                  ? 'Edit and resubmit'
                  : 'Edit proposal'}
              </ButtonLink>
            )}
            {p.status === 'Draft' && (
              <Button
                size='dash'
                onClick={() => {
                  submitProposal(p.id);
                }}
              >
                Submit to CAO
              </Button>
            )}
          </div>
        </div>

        {p.status === 'Returned' && (
          <div
            role='alert'
            className='rounded-xl border border-warn/30 bg-warn-tint p-4 text-sm text-ink'
          >
            <p className='font-semibold text-warn'>Returned by the CAO</p>
            <p className='mt-0.5'>{p.returnReason}</p>
          </div>
        )}

        <div className='grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]'>
          <div className='flex flex-col gap-4'>
            <Card className='flex flex-col gap-3 p-5'>
              <h2 className='text-base font-semibold leading-[21px] text-ink'>
                Proposal
              </h2>
              <dl className='grid gap-4 text-sm sm:grid-cols-2'>
                <div>
                  <dt className='text-xs text-ink-3'>Estimated budget</dt>
                  <dd className='font-medium text-ink'>
                    {p.budget ? rs(p.budget) : 'Not set'}
                  </dd>
                </div>
                <div>
                  <dt className='text-xs text-ink-3'>Households benefiting</dt>
                  <dd className='font-medium text-ink'>
                    {p.households
                      ? p.households.toLocaleString('en-US')
                      : 'Not set'}
                  </dd>
                </div>
              </dl>
              <div>
                <p className='text-xs text-ink-3'>Justification</p>
                <p className='text-sm leading-5 text-ink'>
                  {p.justification || 'Not written yet.'}
                </p>
              </div>
              <div>
                <p className='text-xs text-ink-3'>Expected benefits</p>
                <p className='text-sm leading-5 text-ink'>
                  {p.benefits || 'Not written yet.'}
                </p>
              </div>
              <div>
                <p className='mb-1.5 text-xs text-ink-3'>
                  Supporting documents
                </p>
                <div className='flex flex-wrap gap-2'>
                  {p.docs.length ? (
                    p.docs.map((d) => (
                      <span
                        key={d}
                        className='inline-flex h-[34px] items-center gap-2 rounded-lg border border-line-strong px-3 text-[13px] text-ink'
                      >
                        <Icon name='file' size={16} className='text-ink-3' />
                        {d}
                      </span>
                    ))
                  ) : (
                    <span className='text-sm text-ink-3'>None attached.</span>
                  )}
                </div>
              </div>
            </Card>

            {p.progress && (
              <Card className='flex flex-col gap-3.5 p-5'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-base font-semibold leading-[21px] text-ink'>
                    Implementation progress
                  </h2>
                  <Badge tone='ok'>Official-verified by department</Badge>
                </div>
                <ProgressBar
                  label='Planned progress'
                  value={p.progress.planned}
                  color='bg-[#94a3b8]'
                />
                <ProgressBar
                  label='Department-verified progress'
                  value={p.progress.verified}
                />
                <ProgressBar
                  label='Financial progress'
                  value={p.progress.financial}
                  color='bg-[#d97706]'
                />
              </Card>
            )}

            <Card className='p-5'>
              <h2 className='mb-3 text-base font-semibold leading-[21px] text-ink'>
                Review and decision history
              </h2>
              <Timeline steps={steps} />
            </Card>
          </div>

          <div className='flex flex-col gap-4'>
            <ScoreCard parts={p.breakdown} total={p.priority} preview={false} />
            <Card className='p-5'>
              <h2 className='mb-3 text-[15px] font-semibold leading-[19px] text-ink'>
                Citizen feedback
              </h2>
              <dl className='flex flex-col gap-2.5 text-[13px] leading-4'>
                {[
                  [
                    'Community support',
                    support === null ? 'No votes yet' : `${support}%`,
                  ],
                  ['Likes', p.up],
                  ['Dislikes', p.down],
                  ['Comments', p.comments],
                  [
                    'Satisfaction after delivery',
                    p.satisfaction ? `${p.satisfaction}%` : 'Not rated yet',
                  ],
                ].map(([k, val]) => (
                  <div key={k} className='flex justify-between'>
                    <dt className='text-ink-3'>{k}</dt>
                    <dd className='font-medium text-ink'>{val}</dd>
                  </div>
                ))}
              </dl>
              <p className='mt-3 text-xs leading-4 text-ink-3'>
                Likes and dislikes show community opinion. They do not approve
                or reject a project.
              </p>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
