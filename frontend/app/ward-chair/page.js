'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/app/components/ui/Icon';
import WcTopBar from '@/app/components/layout/WcTopBar';
import Card from '@/app/components/ui/Card';
import Badge, { StatusBadge } from '@/app/components/ui/Badge';
import Button, { ButtonLink } from '@/app/components/ui/Button';
import DemandCard from '@/app/components/ward-chair/DemandCard';
import ProposalSuggestion from '@/app/components/ward-chair/ProposalSuggestion';
import { downloadCsv } from '@/lib/csv';
import {
  needsResponse,
  selectComplaint,
  showToast,
  useWc,
} from '@/lib/wc-store';

const COLS = 'grid-cols-[116px_minmax(0,1fr)_96px_52px_110px_84px]';

export default function WardChairDashboard() {
  const router = useRouter();
  const complaints = useWc((s) => s.complaints);
  const projects = useWc((s) => s.projects);
  const demand = useWc((s) => s.demand);

  const need = complaints.filter((c) => needsResponse(c.status));
  const inbox = [...need].sort((a, b) => b.age - a.age).slice(0, 3);
  const resolved = complaints.filter((c) =>
    ['Resolved', 'Closed'].includes(c.status),
  ).length;
  const voted = projects.filter((p) => p.up + p.down > 0);
  const support = voted.length
    ? Math.round(
        (voted.reduce((a, p) => a + p.up / (p.up + p.down), 0) / voted.length) *
          100,
      )
    : 0;

  const kpis = [
    {
      label: 'New complaints',
      value: need.length,
      icon: 'msg',
      tone: 'bg-warn-tint text-warn',
    },
    {
      label: 'Resolved this month',
      value: resolved,
      icon: 'check',
      tone: 'bg-ok-tint text-ok',
    },
    {
      label: 'Projects in ward',
      value: projects.length,
      icon: 'folder',
      tone: 'bg-info-tint text-info',
    },
    {
      label: 'Average citizen support',
      value: `${support}%`,
      icon: 'up',
      tone: 'bg-brand-tint text-brand',
    },
  ];

  function download() {
    downloadCsv(
      'ward-4-summary.csv',
      ['Measure', 'Value'],
      [
        ['New complaints', need.length],
        ['Resolved complaints', resolved],
        ['Projects in ward', projects.length],
        ['Average citizen support', `${support}%`],
        ...demand.map((d) => [`Demand: ${d.label}`, `${d.count} complaints`]),
      ],
    );
    showToast('Ward summary downloaded');
  }

  return (
    <>
      <WcTopBar crumbs={[{ label: 'Dashboard' }]} />
      <main className='flex flex-col gap-6 p-8'>
        <div className='flex flex-wrap items-center justify-between gap-6'>
          <div>
            <h1 className='text-[28px] font-bold leading-[33px] text-ink'>
              Ward 4 overview
            </h1>
            <p className='mt-1 text-sm leading-[18px] text-ink-3'>
              Understand what residents need, then turn it into proposals.
            </p>
          </div>
          <div className='flex items-center gap-2.5'>
            <Button variant='secondary' size='dash' onClick={download}>
              <Icon name='dl' size={16} />
              Download report
            </Button>
            <ButtonLink href='/ward-chair/proposals/new' size='dash'>
              <Icon name='plus' size={16} />
              Create proposal
            </ButtonLink>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4 xl:grid-cols-4'>
          {kpis.map((k) => (
            <Card key={k.label} className='flex items-center gap-3.5 p-4'>
              <span
                className={`grid size-11 place-items-center rounded-xl ${k.tone}`}
              >
                <Icon name={k.icon} size={22} />
              </span>
              <div>
                <p className='text-[28px] font-bold leading-[33px] text-ink'>
                  {k.value}
                </p>
                <p className='text-[14px] leading-4 text-ink-3'>{k.label}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className='grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]'>
          <div className='flex flex-col gap-4'>
            <DemandCard demand={demand} />

            <Card className='p-5'>
              <div className='mb-3 flex items-center justify-between'>
                <h2 className='text-base font-semibold leading-[23px] text-ink'>
                  Complaint inbox
                </h2>
                <div className='flex items-center gap-3'>
                  <Badge tone='warn'>{need.length} need response</Badge>
                  <Link
                    href='/ward-chair/complaints'
                    className='text-[14px] font-medium text-brand hover:underline'
                  >
                    View all
                  </Link>
                </div>
              </div>
              <div role='table' aria-label='Complaint inbox'>
                <div
                  role='row'
                  className={`grid ${COLS} gap-2 rounded-lg bg-surface-alt px-2 py-2.5 text-[12px] font-semibold uppercase leading-[14px] tracking-wider text-ink-3`}
                >
                  <span role='columnheader'>Tracking no</span>
                  <span role='columnheader'>Complaint</span>
                  <span role='columnheader'>Category</span>
                  <span role='columnheader'>Age</span>
                  <span role='columnheader'>Status</span>
                  <span role='columnheader'>
                    <span className='sr-only'>Action</span>
                  </span>
                </div>
                <div className='mt-1 flex flex-col gap-1'>
                  {inbox.length ? (
                    inbox.map((c) => (
                      <div
                        key={c.id}
                        role='row'
                        className={`grid ${COLS} items-center gap-2 px-2 py-[13px] text-[14px] leading-4`}
                      >
                        <span role='cell' className='font-medium text-ink'>
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
                        <span role='cell'>
                          <Button
                            variant='outline'
                            size='xs'
                            aria-label={`Respond to ${c.id}`}
                            onClick={() => {
                              selectComplaint(c.id);
                              router.push('/ward-chair/complaints');
                            }}
                          >
                            Respond
                          </Button>
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className='p-3 text-sm text-ink-3'>
                      Every complaint has a response. Nothing is waiting.
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <div className='flex flex-col gap-4'>
            <ProposalSuggestion />
            <Card className='p-5'>
              <div className='mb-3 flex items-center justify-between'>
                <h2 className='text-[16px] font-semibold leading-[21px] text-ink'>
                  My proposals
                </h2>
                <Link
                  href='/ward-chair/projects'
                  className='text-[14px] font-medium text-brand hover:underline'
                >
                  View all
                </Link>
              </div>
              <ul className='flex flex-col gap-3'>
                {projects
                  .filter((p) =>
                    ['Submitted', 'Returned', 'Draft'].includes(p.status),
                  )
                  .slice(0, 4)
                  .map((p) => (
                    <li
                      key={p.id}
                      className='flex items-center justify-between gap-3'
                    >
                      <Link
                        href={`/ward-chair/projects/${p.id}`}
                        className='min-w-0 hover:text-brand'
                      >
                        <p className='truncate text-[14px] font-semibold leading-4 text-ink'>
                          {p.title}
                        </p>
                        <p className='truncate text-xs leading-[16px] text-ink-3'>
                          {p.statusNote}
                        </p>
                      </Link>
                      <StatusBadge status={p.status} />
                    </li>
                  ))}
              </ul>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
