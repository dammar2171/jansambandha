import RouteGuard from '@/app/components/auth/RouteGuard';

export default function ContractorLayout({ children }) {
  return <RouteGuard role='contractor'>{children}</RouteGuard>;
}
