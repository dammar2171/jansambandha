import RouteGuard from '@/app/components/auth/RouteGuard';

export default function DepartmentLayout({ children }) {
  return <RouteGuard role='department'>{children}</RouteGuard>;
}
