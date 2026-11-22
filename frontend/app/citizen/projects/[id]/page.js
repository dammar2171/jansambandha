'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Icon from '@/app/components/ui/Icon';
import TopBar from '@/app/components/layout/TopBar';
import Card from '@/app/components/ui/Card';
import Badge, { StatusBadge } from '@/app/components/ui/Badge';
import Button from '@/app/components/ui/Button';
import ProgressBar from '@/app/components/ui/ProgressBar';
import Timeline from '@/app/components/ui/Timeline';
import ReactionButton from '@/app/components/citizen/ReactionButton';
import {
  clearRating,
  reportComment,
  submitRating,
  toggleCommentLike,
  toggleFollow,
  useStore,
} from '@/lib/store';
import { useSession } from '@/lib/session';
import { api } from '@/lib/api';
import {
  mapComment,
  mapProject,
  reactionToApi,
  reactionToUi,
} from '@/lib/projects';

const LABELS = ['Very poor', 'Poor', 'Fair', 'Good', 'Very good'];

function Metric({ label, value, note }) {
  return (
    <div className='rounded-[10px] border border-line bg-surface-alt p-[13px]'>
      <p className='text-xs leading-[15px] text-ink-3'>{label}</p>
      <p className='mt-0.5 text-[26px] font-bold leading-[31px] text-ink'>
        {value}
      </p>
      <p className='mt-0.5 text-[11px] leading-[13px] text-ink-3'>{note}</p>
    </div>
  );
}

function Comment({ c }) {
  const liked = useStore((s) => !!s.likedComments[c.id]);
  return (
    <div className={`flex gap-2.5 ${c.reply ? 'pl-11' : ''}`}>
      <span
        className={`grid size-[34px] shrink-0 place-items-center rounded-full text-xs font-semibold ${c.role ? 'bg-brand text-white' : 'bg-brand-tint text-brand'}`}
      >
        {c.initials}
      </span>
      <div className='min-w-0 flex-1'>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='text-[13px] font-semibold leading-4 text-ink'>
            {c.who}
          </span>
          {c.role && <Badge tone='brand'>{c.role}</Badge>}
          <span className='text-xs leading-[15px] text-ink-3'>{c.when}</span>
        </div>
        <p className='mt-1 text-sm leading-5 text-ink'>{c.text}</p>
        <div className='mt-1 flex items-center gap-3 text-xs leading-[15px] text-ink-3'>
          <button
            type='button'
            onClick={() => document.getElementById('comment-input')?.focus()}
            className='hover:text-brand focus-visible:outline-2 focus-visible:outline-brand'
          >
            Reply
          </button>
          <button
            type='button'
            aria-pressed={liked}
            onClick={() => toggleCommentLike(c.id)}
            className={`hover:text-brand focus-visible:outline-2 focus-visible:outline-brand ${liked ? 'font-semibold text-brand' : ''}`}
          >
            {c.likes + (liked ? 1 : 0)} likes
          </button>
          <button
            type='button'
            onClick={reportComment}
            className='hover:text-danger focus-visible:outline-2 focus-visible:outline-brand'
          >
            Report
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  return (
    <Suspense
      fallback={
        <main className='p-8' aria-busy='true'>
          Loading project…
        </main>
      }
    >
      <ProjectDetailContent />
    </Suspense>
  );
}

function ProjectDetailContent() {
  const { id } = useParams();
  const session = useSession();
  const token = session?.token;
  const myUserId = session?.user?._id;

  const [p, setP] = useState(null);
  const [fb, setFb] = useState({ up: 0, down: 0, mine: null, comments: [] });
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  const following = useStore((s) => !!s.following[id]);
  const rating = useStore((s) => s.ratings[id]);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [stars, setStars] = useState(0);
  const [ratingText, setRatingText] = useState('');
  const [ratingError, setRatingError] = useState('');

  useEffect(() => {
    if (!token || !id) return;
    let active = true;
    (async () => {
      try {
        const proj = await api.getProject(token, id);
        if (!active) return;
        setP(mapProject(proj));
        try {
          const feedback = await api.getProjectFeedback(token, id);
          if (!active) return;
          setFb({
            up: feedback.reactions?.likes ?? 0,
            down: feedback.reactions?.dislikes ?? 0,
            mine: reactionToUi(feedback.myReaction),
            comments: (feedback.comments || []).map((c) =>
              mapComment(c, myUserId),
            ),
          });
        } catch {
          /* leave default feedback if it cannot be loaded */
        }
      } catch {
        if (active) setMissing(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, token, myUserId]);

  if (loading) {
    return (
      <>
        <TopBar
          crumbs={[
            { label: 'Projects', href: '/citizen/projects' },
            { label: 'Loading' },
          ]}
        />
        <main className='p-8 text-sm text-ink-3' aria-busy='true'>
          Loading project…
        </main>
      </>
    );
  }

  if (missing || !p) {
    return (
      <>
        <TopBar
          crumbs={[
            { label: 'Projects', href: '/citizen/projects' },
            { label: 'Not found' },
          ]}
        />
        <main className='p-8'>
          <Card className='max-w-lg p-6'>
            <h1 className='text-lg font-semibold'>Project not found</h1>
            <p className='mt-1 text-sm text-ink-3'>
              This project does not exist or is not published for your ward.
            </p>
            <Link
              href='/citizen/projects'
              className='mt-4 inline-block text-sm font-medium text-brand hover:underline'
            >
              Back to projects
            </Link>
          </Card>
        </main>
      </>
    );
  }

  const list = fb.comments;
  const total = list.length;
  const started = p.status === 'Ongoing';

  async function react(kind) {
    if (!token) return;
    const prev = fb;
    let nextFb;
    if (fb.mine === kind) {
      nextFb = { ...fb, [kind]: Math.max(0, fb[kind] - 1), mine: null };
    } else {
      nextFb = {
        ...fb,
        up:
          kind === 'up'
            ? fb.up + 1
            : fb.mine === 'up'
              ? Math.max(0, fb.up - 1)
              : fb.up,
        down:
          kind === 'down'
            ? fb.down + 1
            : fb.mine === 'down'
              ? Math.max(0, fb.down - 1)
              : fb.down,
        mine: kind,
      };
    }
    setFb(nextFb);
    try {
      if (prev.mine === kind) await api.removeReaction(token, id);
      else await api.setReaction(token, id, reactionToApi(kind));
    } catch {
      setFb(prev); // revert on failure
    }
  }

  async function post() {
    const body = text.trim();
    if (!body || !token) return;
    setPosting(true);
    try {
      await api.addProjectComment(token, id, body);
      const feedback = await api.getProjectFeedback(token, id);
      setFb((f) => ({
        ...f,
        comments: (feedback.comments || []).map((c) => mapComment(c, myUserId)),
      }));
      setText('');
    } catch {
      /* comment not saved; leave the text so the user can retry */
    } finally {
      setPosting(false);
    }
  }

  function sendFeedback() {
    if (!stars) return setRatingError('Choose a star rating first.');
    setRatingError('');
    submitRating(id, stars, ratingText.trim());
  }

  return (
    <>
      <TopBar
        crumbs={[
          { label: 'Projects', href: '/citizen/projects' },
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
              {p.priority != null && <Badge>Priority {p.priority}/100</Badge>}
            </div>
            <p className='mt-2 text-[13px] leading-[17px] text-ink-3'>
              {p.place} · {p.fy} · {p.dept}
            </p>
          </div>
          <div className='flex items-center gap-2.5'>
            <ReactionButton
              kind='up'
              label='Like'
              count={fb.up}
              active={fb.mine === 'up'}
              onClick={() => react('up')}
            />
            <ReactionButton
              kind='down'
              label='Dislike'
              count={fb.down}
              active={fb.mine === 'down'}
              onClick={() => react('down')}
            />
            <Button
              variant={following ? 'primary' : 'outline'}
              size='dash'
              aria-pressed={following}
              onClick={() => toggleFollow(id)}
            >
              <Icon name='bell' size={16} />
              {following ? 'Following' : 'Follow progress'}
            </Button>
          </div>
        </div>

        <div className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]'>
          <div className='flex flex-col gap-4'>
            <Card className='flex flex-col gap-3.5 p-5'>
              <div className='flex items-center justify-between gap-3'>
                <h2 className='text-base font-semibold leading-[21px] text-ink'>
                  Project progress
                </h2>
                <Badge tone='ok'>Official-verified by department</Badge>
              </div>
              <div className='grid grid-cols-2 items-start gap-3 lg:grid-cols-4'>
                <Metric label='Planned' {...p.metrics.planned} />
                <Metric label='Verified' {...p.metrics.verified} />
                <Metric label='Financial' {...p.metrics.financial} />
                <Metric label='Satisfaction' {...p.metrics.satisfaction} />
              </div>
              <ProgressBar
                label='Planned progress'
                value={p.planned}
                color='bg-[#94a3b8]'
              />
              <ProgressBar
                label='Department-verified progress'
                value={p.verified}
              />
              <ProgressBar
                label='Financial progress'
                value={p.financial}
                color='bg-[#d97706]'
              />
              {p.quality && (
                <div className='flex flex-wrap items-center gap-2.5 rounded-[10px] border border-warn/25 bg-warn-tint/50 p-[13px]'>
                  <Badge tone='warn'>{p.quality.label}</Badge>
                  <p className='text-xs leading-4 text-ink-2'>
                    {p.quality.note}
                  </p>
                </div>
              )}
              {!started && (
                <p className='text-xs leading-4 text-ink-3'>
                  Progress is shown only after the department verifies it on
                  site.
                </p>
              )}
            </Card>

            <Card className='flex flex-col gap-3.5 p-5'>
              <div className='flex items-center gap-2.5'>
                <h2 className='text-base font-semibold leading-[21px] text-ink'>
                  Community discussion
                </h2>
                <Badge>{total} comments</Badge>
              </div>
              <div className='flex items-center gap-2 rounded-[10px] border border-line-strong py-[10px] pl-[15px] pr-[10px] focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20'>
                <label htmlFor='comment-input' className='sr-only'>
                  Write a comment
                </label>
                <input
                  id='comment-input'
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && post()}
                  placeholder='Share how this project affects you'
                  className='min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-3'
                />
                <Button
                  size='xs'
                  onClick={post}
                  disabled={!text.trim() || posting}
                >
                  <Icon name='send' size={16} />
                  Post
                </Button>
              </div>
              {list.length ? (
                list.map((c) => <Comment key={c.id} c={c} />)
              ) : (
                <p className='text-sm text-ink-3'>
                  No comments yet. Be the first to share how this project
                  affects you.
                </p>
              )}
              <p className='text-xs leading-[15px] text-ink-3'>
                Comments are moderated. Personal details are never shown.
              </p>
            </Card>
          </div>

          <div className='flex flex-col gap-4'>
            <Card className='p-5'>
              <h2 className='mb-3 text-[15px] font-semibold leading-[19px] text-ink'>
                Project journey
              </h2>
              <Timeline steps={p.journey} />
            </Card>

            <Card className='p-5'>
              <h2 className='mb-2.5 text-[15px] font-semibold leading-[19px] text-ink'>
                Budget
              </h2>
              <dl className='flex flex-col gap-2.5 text-[13px] leading-4'>
                {[
                  ['Estimated', p.budget.estimated],
                  ['Approved', p.budget.approved],
                  ['Contracted', p.budget.contracted],
                  ['Reported spent', p.budget.spent],
                ].map(([k, v]) => (
                  <div key={k} className='flex justify-between'>
                    <dt className='text-ink-3'>{k}</dt>
                    <dd className='font-medium text-ink'>{v}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            <Card className='flex flex-col gap-3 p-5'>
              <h2 className='text-[15px] font-semibold leading-[19px] text-ink'>
                Your feedback
              </h2>
              {rating ? (
                <div
                  role='status'
                  className='rounded-[10px] border border-ok/25 bg-ok-tint p-3 text-[13px] leading-[18px] text-ok'
                >
                  You rated this project {rating.stars} of 5 (
                  {LABELS[rating.stars - 1]}).
                  <button
                    type='button'
                    onClick={() => {
                      setStars(rating.stars);
                      setRatingText(rating.text);
                      clearRating(id);
                    }}
                    className='ml-2 font-semibold underline'
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className='flex gap-1'
                    role='radiogroup'
                    aria-label='Rating'
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type='button'
                        role='radio'
                        aria-checked={stars === n}
                        aria-label={`${n} star${n > 1 ? 's' : ''}, ${LABELS[n - 1]}`}
                        onClick={() => setStars(n)}
                        className={`rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${n <= stars ? 'text-[#f59e0b]' : 'text-line-strong hover:text-[#fbbf24]'}`}
                      >
                        <Icon
                          name='star'
                          size={24}
                          fill={n <= stars ? 'currentColor' : 'none'}
                        />
                      </button>
                    ))}
                  </div>
                  <label htmlFor='fb' className='sr-only'>
                    Feedback
                  </label>
                  <textarea
                    id='fb'
                    value={ratingText}
                    onChange={(e) => setRatingText(e.target.value)}
                    placeholder='Tell us about quality and service'
                    className='h-16 w-full resize-none rounded-lg border border-line-strong p-3 text-[13px] text-ink outline-none placeholder:text-ink-3 focus:border-brand focus:ring-2 focus:ring-brand/20'
                  />
                  {ratingError && (
                    <p className='text-xs text-danger' role='alert'>
                      {ratingError}
                    </p>
                  )}
                  <Button size='dash' className='w-full' onClick={sendFeedback}>
                    Submit feedback
                  </Button>
                </>
              )}
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
