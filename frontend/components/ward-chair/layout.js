import WcShell from "@/components/layout/WcShell";
import { WARD_CHAIR_NAV } from "@/lib/nav";

export default function WardChairLayout({ children }) {
  return <WcShell nav={WARD_CHAIR_NAV}>{children}</WcShell>;
}
