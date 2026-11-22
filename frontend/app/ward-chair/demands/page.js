'use client';
import { useRouter } from 'next/navigation';
import WcTopBar from '@/app/components/layout/WcTopBar';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import ProposalSuggestion from '@/app/components/ward-chair/ProposalSuggestion';
import { setPrefill, useWc } from '@/lib/wc-store';

export default function CitizenDemandsPage() {
  const router = useRouter();
  const demand = useWc((s) => s.demand);
  const suggestions = useWc((s) => s.suggestions);
  const search = useWc((s) => s.search)
    .trim()
    .toLowerCase();

  const rows = [...demand]
    .sort((a, b) => b.count - a.count)
    .filter((d) => !search || d.label.toLowerCase().includes(search));
  const total = demand.reduce((a, d) => a + d.count, 0);
  const max = Math.max(...demand.map((d) => d.count), 1);

  function start(prefill) {
    setPrefill(prefill);
    router.push('/ward-chair/proposals/new');
  }

  return (
    <>
      <WcTopBar crumbs={[{ label: 'Citizen Demands' }]} />
      <main className='flex flex-col gap-6 p-8'>
        <div>
          <h1 className='text-[28px] font-bold leading-[33px] text-ink'>
            Citizen demands
          </h1>
          <p className='mt-1 text-sm leading-[18px] text-ink-3'>
            What residents of Ward 4 are asking for, grouped by problem
            category. Use it as evidence for proposals.
          </p>
        </div>

        <div className='grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]'>
          <Card className='p-5'>
            <h2 className='mb-3 text-base font-semibold leading-[23px] text-ink'>
              Demand by category
            </h2>
            <div role='table' aria-label='Demand by category'>
              <div
                role='row'
                className='grid grid-cols-[minmax(0,1fr)_96px_96px_120px] gap-3 rounded-lg bg-surface-alt px-3 py-2.5 text-[12px] font-semibold uppercase leading-[14px] tracking-wider text-ink-3'
              >
                <span role='columnheader'>Category</span>
                <span role='columnheader'>Complaints</span>
                <span role='columnheader'>Suggestions</span>
                <span role='columnheader'>
                  <span className='sr-only'>Action</span>
                </span>
              </div>
              <div className='mt-1 flex flex-col gap-1'>
                {rows.length ? (
                  rows.map((d) => (
                    <div
                      key={d.label}
                      role='row'
                      className='grid grid-cols-[minmax(0,1fr)_96px_96px_120px] items-center gap-3 rounded-lg px-3 py-3 hover:bg-surface-alt'
                    >
                      <span role='cell'>
                        <span className='block text-sm font-semibold leading-[18px] text-ink'>
                          {d.label}
                        </span>
                        <span className='mt-1.5 flex items-center gap-2'>
                          <span
                            className='h-2 flex-1 overflow-hidden rounded-full bg-line'
                            role='progressbar'
                            aria-label={`${d.label} share of demand`}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={Math.round((d.count / total) * 100)}
                          >
                            <span
                              className='block h-full rounded-full bg-brand'
                              style={{ width: `${(d.count / max) * 100}%` }}
                            />
                          </span>
                          <span className='w-9 text-right text-xs text-ink-3'>
                            {Math.round((d.count / total) * 100)}%
                          </span>
                        </span>
                      </span>
                      <span
                        role='cell'
                        className='text-sm font-medium text-ink'
                      >
                        {d.count}
                      </span>
                      <span role='cell' className='text-sm text-ink-2'>
                        {d.suggestions}
                      </span>
                      <span role='cell' className='flex justify-end'>
                        <Button
                          variant='outline'
                          size='xs'
                          onClick={() =>
                            start({
                              title: `Ward 4 ${d.label}`,
                              category: d.label,
                              households: '',
                              justification: `${d.count} ${d.label.toLowerCase()} complaints and ${d.suggestions} citizen suggestions from Ward 4 residents point to this need.`,
                            })
                          }
                        >
                          Start proposal
                        </Button>
                      </span>
                    </div>
                  ))
                ) : (
                  <p className='p-6 text-center text-sm text-ink-3'>
                    No category matches “{search}”.
                  </p>
                )}
              </div>
            </div>
            <p className='mt-3 text-xs leading-4 text-ink-3'>
              Share of demand is each category&apos;s part of all {total}{' '}
              complaints. A small group of vulnerable residents can matter more
              than a count suggests, so read the individual complaints too.
            </p>
          </Card>

          <div className='flex flex-col gap-4'>
            <ProposalSuggestion />
            <Card className='p-5'>
              <h2 className='mb-3 text-[16px] font-semibold leading-[21px] text-ink'>
                Recent citizen suggestions
              </h2>
              <ul className='flex flex-col gap-3'>
                {suggestions.map((s) => (
                  <li
                    key={s.id}
                    className='flex items-center justify-between gap-3'
                  >
                    <div className='min-w-0'>
                      <p className='truncate text-[14px] font-semibold leading-4 text-ink'>
                        {s.title}
                      </p>
                      <p className='text-xs leading-[16px] text-ink-3'>
                        {s.category}
                      </p>
                    </div>
                    <Button
                      variant='outline'
                      size='xs'
                      onClick={() =>
                        start({
                          title: s.title,
                          category: s.category,
                          households: '',
                          justification: '',
                        })
                      }
                    >
                      Use
                    </Button>
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
