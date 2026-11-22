'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import WcTopBar from '@/app/components/layout/WcTopBar';
import Card from '@/app/components/ui/Card';
import ProposalForm from '@/app/components/ward-chair/ProposalForm';
import { isEditable, useWc } from '@/lib/wc-store';

export default function EditProposalPage() {
  const { id } = useParams();
  const project = useWc((s) => s.projects.find((p) => p.id === id));

  if (!project || !isEditable(project)) {
    return (
      <>
        <WcTopBar
          crumbs={[
            { label: 'Ward Projects', href: '/ward-chair/projects' },
            { label: 'Edit' },
          ]}
        />
        <main className='p-8'>
          <Card className='max-w-lg p-6'>
            <h1 className='text-lg font-semibold text-ink'>
              {project ? 'This proposal cannot be edited' : 'Project not found'}
            </h1>
            <p className='mt-1 text-sm text-ink-3'>
              {project
                ? 'Only drafts and proposals returned by the CAO can be edited.'
                : 'This project does not exist in Ward 4.'}
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
  return (
    <ProposalForm key={project.id} initial={project} projectId={project.id} />
  );
}
