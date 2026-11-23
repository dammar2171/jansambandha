import TopBar from '@/app/components/layout/TopBar';
import ProjectList from '@/app/components/citizen/ProjectList';

export default function ProjectsPage() {
  return (
    <>
      <TopBar crumbs={[{ label: 'Projects' }]} />
      <main className='flex w-full max-w-[1128px] flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-8'>
        <div>
          <h1 className='text-[24px] font-bold leading-[30px] text-ink sm:text-[28px] sm:leading-[33px]'>
            Projects
          </h1>
          <p className='mt-1 text-sm leading-[18px] text-ink-3'>
            Every project proposed, approved or under way in your ward.
          </p>
        </div>
        <ProjectList title='All projects in your ward' />
      </main>
    </>
  );
}
