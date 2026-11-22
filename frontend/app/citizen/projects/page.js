import TopBar from '@/app/components/layout/TopBar';
import ProjectList from '@/app/components/citizen/ProjectList';

export default function ProjectsPage() {
  return (
    <>
      <TopBar crumbs={[{ label: 'Projects' }]} />
      <main className='flex max-w-[1128px] flex-col gap-6 p-8'>
        <div>
          <h1 className='text-[26px] font-bold leading-[31px] text-ink'>
            Projects
          </h1>
          <p className='mt-1 text-sm leading-[17px] text-ink-3'>
            Every project proposed, approved or under way in your ward.
          </p>
        </div>
        <ProjectList title='All projects in your ward' />
      </main>
    </>
  );
}
