'use client';
import Link from 'next/link';
import Icon from '@/app/components/ui/Icon';
import Card from '@/app/components/ui/Card';
import { StatusBadge } from '@/app/components/ui/Badge';
import { ButtonLink } from '@/app/components/ui/Button';
import ReactionButton from './ReactionButton';
import { toggleReaction, useStore } from '@/lib/store';

export default function ProjectCard({ project: p }) {
  const reaction = useStore((s) => s.reactions[p.id]);
  const added = useStore(
    (s) => (s.comments[p.id] || []).filter((c) => c.mine).length,
  );

  return (
    <Card className='flex flex-col gap-3 p-[18px]'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h3 className='text-base font-semibold leading-[21px] text-ink'>
            {p.title}
          </h3>
          <p className='mt-0.5 text-[13px] leading-4 text-ink-3'>
            {p.category} · {p.place}
            {p.priority != null ? ` · Priority ${p.priority}/100` : ''}
          </p>
        </div>
        <StatusBadge status={p.status} className='mt-2' />
      </div>

      <div>
        <div className='mb-1.5 flex items-center justify-between text-xs leading-[15px] text-ink-2'>
          <span>{p.barNote}</span>
          <span className='font-semibold text-ink'>{p.verified}%</span>
        </div>
        <div
          className='h-2 overflow-hidden rounded-full bg-line'
          role='progressbar'
          aria-label={`${p.title} verified progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={p.verified}
        >
          <div
            className='h-full rounded-full bg-brand'
            style={{ width: `${p.verified}%` }}
          />
        </div>
      </div>

      <div className='flex items-center justify-between gap-4'>
        <div className='flex items-center gap-2'>
          <ReactionButton
            kind='up'
            label='Like'
            count={p.up + (reaction === 'up' ? 1 : 0)}
            active={reaction === 'up'}
            onClick={() => toggleReaction(p.id, 'up')}
          />
          <ReactionButton
            kind='down'
            label='Dislike'
            count={p.down + (reaction === 'down' ? 1 : 0)}
            active={reaction === 'down'}
            onClick={() => toggleReaction(p.id, 'down')}
          />
          <Link
            href={`/citizen/projects/${p.id}`}
            aria-label={`${p.commentCount + added} comments`}
            className='inline-flex h-[30px] items-center gap-1.5 rounded-full border border-line-strong px-3 text-[13px] font-medium text-ink-2 hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
          >
            <Icon name='msg' size={15} />
            {p.commentCount + added}
          </Link>
        </div>
        <div className='flex items-center gap-3.5'>
          <span className='text-[13px] font-medium text-ink'>
            {p.cardBudget}
          </span>
          <ButtonLink
            href={`/citizen/projects/${p.id}`}
            variant='outline'
            size='sm'
          >
            View details
          </ButtonLink>
        </div>
      </div>
    </Card>
  );
}
