'use client';
import Link from 'next/link';
import TopBar from '@/app/components/layout/TopBar';
import Card from '@/app/components/ui/Card';
import Icon from '@/app/components/ui/Icon';
import { StatusBadge } from '@/app/components/ui/Badge';
import { ButtonLink } from '@/app/components/ui/Button';
import { useStore } from '@/lib/store';

const Empty = ({ text, href, cta }) => (
  <div className='rounded-xl border border-dashed border-line-strong bg-surface p-8 text-center'>
    <p className='text-sm text-ink-3'>{text}</p>
    <ButtonLink href={href} variant='outline' size='sm' className='mt-3'>
      {cta}
    </ButtonLink>
  </div>
);

export default function FeedbackPage() {
  const ratings = useStore((s) => s.ratings);
  const projects = useStore((s) => s.projects);
  const suggestions = useStore((s) => s.suggestions);
  const rated = projects.filter((p) => ratings[p.id]);

  return (
    <>
      <TopBar crumbs={[{ label: 'My Feedback' }]} />
      <main className='flex max-w-[860px] flex-col gap-6 p-8'>
        <div className='flex items-center justify-between gap-6'>
          <div>
            <h1 className='text-[28px] font-bold leading-[33px] text-ink'>
              My Feedback
            </h1>
            <p className='mt-1 text-sm leading-[18px] text-ink-3'>
              Ratings you gave and projects you suggested.
            </p>
          </div>
          <ButtonLink href='/citizen/suggest' size='dash'>
            <Icon name='plus' size={16} />
            Suggest a project
          </ButtonLink>
        </div>

        <section className='flex flex-col gap-3' aria-labelledby='r'>
          <h2 id='r' className='text-[18px] font-semibold text-ink'>
            Project ratings
          </h2>
          {rated.length ? (
            rated.map((p) => (
              <Card
                key={p.id}
                className='flex items-center justify-between gap-4 p-4'
              >
                <div>
                  <Link
                    href={`/citizen/projects/${p.id}`}
                    className='text-sm font-semibold text-ink hover:text-brand'
                  >
                    {p.title}
                  </Link>
                  {ratings[p.id].text && (
                    <p className='mt-0.5 text-[14px] text-ink-2'>
                      {ratings[p.id].text}
                    </p>
                  )}
                </div>
                <span
                  className='flex items-center gap-1 text-[#f59e0b]'
                  aria-label={`${ratings[p.id].stars} of 5 stars`}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Icon
                      key={n}
                      name='star'
                      size={16}
                      fill={n <= ratings[p.id].stars ? 'currentColor' : 'none'}
                    />
                  ))}
                </span>
              </Card>
            ))
          ) : (
            <Empty
              text='You have not rated a project yet.'
              href='/citizen/projects'
              cta='Browse projects'
            />
          )}
        </section>

        <section className='flex flex-col gap-3' aria-labelledby='s'>
          <h2 id='s' className='text-[18px] font-semibold text-ink'>
            My suggestions
          </h2>
          {suggestions.length ? (
            suggestions.map((s) => (
              <Card
                key={s.id}
                className='flex items-start justify-between gap-4 p-4'
              >
                <div>
                  <p className='text-xs text-ink-3'>
                    {s.id} · {s.category}
                  </p>
                  <p className='text-sm font-semibold text-ink'>{s.title}</p>
                  <p className='mt-0.5 text-[14px] text-ink-2'>{s.why}</p>
                </div>
                <StatusBadge status={s.status} />
              </Card>
            ))
          ) : (
            <Empty
              text='You have not suggested a project yet.'
              href='/citizen/suggest'
              cta='Suggest a project'
            />
          )}
        </section>
      </main>
    </>
  );
}
