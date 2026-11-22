'use client';
import { Suspense, useEffect } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import Button from '@/app/components/ui/Button';
import { getRole } from '@/lib/roles';
import { signOut, useSession } from '@/lib/session';

export default function RoleHome() {
  return (
    <Suspense fallback={null}>
      <RoleHomeContent />
    </Suspense>
  );
}

function RoleHomeContent() {
  const { role: roleId } = useParams();
  const role = getRole(roleId);
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session === null) router.replace('/login');
    else if (session && session.role !== roleId)
      router.replace(getRole(session.role)?.home ?? '/login');
  }, [session, roleId, router]);

  if (!role) notFound();
  if (!session || session.role !== roleId) return null;

  return (
    <main className='mx-auto flex max-w-xl flex-col gap-4 p-10'>
      <h1 className='text-2xl font-bold'>{role.label} dashboard</h1>
      <p className='text-ink-2'>
        Signed in as {session.name}. This dashboard is built in the next step.
      </p>
      <div>
        <Button
          variant='secondary'
          size='sm'
          onClick={() => {
            signOut();
            router.replace('/login');
          }}
        >
          Sign out
        </Button>
      </div>
    </main>
  );
}
