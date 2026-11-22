import RouteGuard from '@/app/components/auth/RouteGuard';

export default function GeneralAdminLayout({ children }) {
  return <RouteGuard role='general-admin'>{children}</RouteGuard>;
}
