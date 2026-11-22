"use client";
import { useRouter } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { signOut, useSession } from "@/lib/session";

export default function ProfilePage() {
  const session = useSession();
  const router = useRouter();
  const rows = [
    ["Name", session?.name],
    ["Email or mobile", session?.identity || "Not provided"],
    ["Ward", `Ward ${session?.ward ?? 4}, Kailali Municipality`],
    ["Role", "Citizen"],
  ];
  return (
    <>
      <TopBar crumbs={[{ label: "Profile" }]} />
      <main className="flex max-w-[560px] flex-col gap-6 p-8">
        <h1 className="text-[26px] font-bold leading-[31px] text-ink">Profile</h1>
        <Card className="p-5">
          <dl className="flex flex-col divide-y divide-line text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <dt className="text-ink-3">{k}</dt>
                <dd className="font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <p className="text-xs text-ink-3">Your contact details are private. Only your comments are visible on projects.</p>
        <div><Button variant="secondary" size="dash" onClick={() => { signOut(); router.replace("/login"); }}>Sign out</Button></div>
      </main>
    </>
  );
}
