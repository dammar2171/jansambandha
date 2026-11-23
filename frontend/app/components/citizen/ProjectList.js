'use client';
import { useEffect, useState } from 'react';
import ProjectCard from './ProjectCard';
import { setProjects, setReactions, useStore } from '@/lib/store';
import { getToken } from '@/lib/session';
import { api } from '@/lib/api';
import { mapProject } from '@/lib/projects';

const FILTERS = [
  ['All', null],
  ['Ongoing', 'Ongoing'],
  ['Approved', 'Approved'],
  ['Proposed', 'Under review'],
];

export default function ProjectList({ title = 'Projects in your ward' }) {
  const projects = useStore((s) => s.projects);
  const search = useStore((s) => s.search)
    .trim()
    .toLowerCase();
  const [filter, setFilter] = useState('All');

  // Load the public projects for this citizen's ward and reflect the citizen's
  // own like/dislike on each card.
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    api
      .getProjects(token)
      .then((list) => {
        if (Array.isArray(list) && list.length) {
          const mapped = list.map(mapProject);
          setProjects(mapped);
          // Reflect the citizen's own like/dislike on each card.
          setReactions(
            Object.fromEntries(mapped.map((p) => [p.id, p.mine ?? null])),
          );
        }
      })
      .catch(() => {});
  }, []);

  const status = FILTERS.find(([l]) => l === filter)[1];
  const list = projects.filter(
    (p) =>
      (!status || p.status === status) &&
      (!search ||
        `${p.title} ${p.category} ${p.place}`.toLowerCase().includes(search)),
  );

  return (
    <section aria-labelledby='plist' className='flex flex-col gap-4'>
      <div className='flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4'>
        <h2
          id='plist'
          className='text-[18px] font-semibold leading-[24px] text-ink'
        >
          {title}
        </h2>
        <div className='flex flex-wrap gap-2' role='group' aria-label='Filter by stage'>
          {FILTERS.map(([label]) => {
            const on = label === filter;
            return (
              <button
                key={label}
                type='button'
                aria-pressed={on}
                onClick={() => setFilter(label)}
                className={`shrink-0 whitespace-nowrap rounded-full px-[15px] py-[5px] text-[14px] font-medium leading-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                  on
                    ? 'bg-brand text-white'
                    : 'border border-line-strong bg-surface text-ink-2 hover:bg-surface-alt'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {list.length ? (
        list.map((p) => <ProjectCard key={p.id} project={p} />)
      ) : (
        <div className='rounded-xl border border-dashed border-line-strong bg-surface p-6 text-center text-sm text-ink-3 sm:p-10'>
          No projects match{search ? ` \u201c${search}\u201d` : ' this filter'}.
          Try another filter or clear the search.
        </div>
      )}
      <p className='text-xs leading-[16px] text-ink-3'>
        Likes and dislikes are community feedback only. They do not approve or
        reject a project.
      </p>
    </section>
  );
}
