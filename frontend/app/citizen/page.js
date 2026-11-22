'use client';
import { useEffect } from 'react';
import Link from 'next/link';

import TopBar from '@/app/components/layout/TopBar';
import Card from '@/app/components/ui/Card';
import { StatusBadge } from '@/app/components/ui/Badge';
import { ButtonLink } from '@/app/components/ui/Button';
import Timeline from '@/app/components/ui/Timeline';
import ProjectList from '@/app/components/citizen/ProjectList';
import { homeSteps, mapComplaint } from '@/lib/complaints';
import { getToken, useSession } from '@/lib/session';
import { api } from '@/lib/api';
import { useStore, setComplaints } from '@/lib/store';
import Icon from '@/app/components/ui/Icon';

export default function CitizenHome() {
  const session = useSession();
  const complaints = useStore((s) => s.complaints);
  const projects = useStore((s) => s.projects);

  // Hydrate this citizen's real complaints so the dashboard counts are live.
  // Projects are already hydrated by the ProjectList rendered below.
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

  const first = (session?.name || 'Ram Sharma').split(' ')[0];
  const open = complaints.filter(
    (c) => !['Resolved', 'Closed'].includes(c.status),
  ).length;
  const resolved = complaints.filter((c) =>
    ['Resolved', 'Closed'].includes(c.status),
  ).length;
  const ongoing = projects.filter((p) => p.status === 'Ongoing').length;
  const latest = complaints[0];

  const kpis = [
    {
      label: 'Open complaints',
      value: open,
      icon: 'alert',
      tone: 'bg-warn-tint text-warn',
    },
    {
      label: 'Resolved complaints',
      value: resolved,
      icon: 'check',
      tone: 'bg-ok-tint text-ok',
    },
    {
      label: `Projects in Ward ${session?.ward ?? 4}`,
      value: projects.length,
      icon: 'folder',
      tone: 'bg-info-tint text-info',
    },
    {
      label: 'Ongoing projects',
      value: ongoing,
      icon: 'up',
      tone: 'bg-brand-tint text-brand',
    },
  ];

  return (
    <>
      <TopBar crumbs={[{ label: 'Home' }]} />
      <main className='flex flex-col gap-6 p-8'>
        <div className='flex items-center justify-between gap-6'>
          <div>
            <h1 className='text-[28px] font-bold leading-[33px] text-ink'>
              Namaste, {first}
            </h1>
            <p className='mt-1 text-sm leading-[18px] text-ink-3'>
              Ward {session?.ward ?? 4} · Kailali Municipality · Here is what is
              happening in your ward
            </p>
          </div>
          <ButtonLink href='/citizen/complaints' size='dash'>
            <Icon name='plus' size={16} />
            Report a problem
          </ButtonLink>
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

        <div className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]'>
          <ProjectList />

          <div className='flex flex-col gap-4'>
            <Card className='flex flex-col gap-3 p-5'>
              <h2 className='text-[16px] font-semibold leading-[21px] text-ink'>
                Need something fixed?
              </h2>
              <p className='text-[14px] leading-[21px] text-ink-2'>
                Tell your ward chairperson. Every complaint gets a tracking
                number you can follow.
              </p>
              <ButtonLink
                href='/citizen/complaints'
                size='dash'
                className='w-full'
              >
                <Icon name='plus' size={16} />
                Report a problem
              </ButtonLink>
              <ButtonLink
                href='/citizen/suggest'
                variant='outline'
                size='dash'
                className='w-full'
              >
                <Icon name='folder' size={16} />
                Suggest a project
              </ButtonLink>
            </Card>

            <Card className='flex flex-col gap-3 p-5'>
              <div className='flex items-center justify-between gap-3'>
                <h2 className='text-[16px] font-semibold leading-[21px] text-ink'>
                  My latest complaint
                </h2>
                {latest && <StatusBadge status={latest.status} />}
              </div>
              {latest ? (
                <>
                  <Link href='/citizen/complaints' className='group block'>
                    <p className='text-xs font-semibold leading-[16px] text-brand group-hover:underline'>
                      {latest.id}
                    </p>
                    <p className='text-[14px] leading-[18px] text-ink'>
                      {latest.title}
                    </p>
                  </Link>
                  <Timeline steps={homeSteps(latest)} />
                </>
              ) : (
                <p className='text-[14px] text-ink-3'>
                  You have not reported a problem yet.
                </p>
              )}
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
