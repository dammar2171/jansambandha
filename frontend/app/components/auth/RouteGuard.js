'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getRole } from '@/lib/roles';
import { useSession } from '@/lib/session';

// Gate a role's dashboard: send signed-out users to /login and
// wrong-role users to their own home. Render nothing until authorized.
export default function RouteGuard({ role, children }) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session === null) router.replace('/login');
    else if (session && session.role !== role)
      router.replace(getRole(session.role)?.home ?? '/login');
  }, [session, role, router]);

  if (!session || session.role !== role) return null;
  return children;
}
