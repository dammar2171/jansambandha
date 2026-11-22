import DashboardShell from "@/components/layout/DashboardShell";
import { CITIZEN_NAV } from "@/lib/nav";

export default function CitizenLayout({ children }) {
  return (
    <DashboardShell role="citizen" roleLabel="Citizen portal" nav={CITIZEN_NAV}>
      {children}
    </DashboardShell>
  );
}
