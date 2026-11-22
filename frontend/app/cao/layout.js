import RouteGuard from '@/app/components/auth/RouteGuard';
import CaoShell from '../components/cao/CaoShell';

export default function Layout({ children }) {
  return (
    <RouteGuard role='cao'>
      <CaoShell>{children}</CaoShell>
    </RouteGuard>
  );
}
