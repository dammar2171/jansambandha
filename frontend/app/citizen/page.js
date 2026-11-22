"use client";
import Link from "next/link";


import TopBar from "@/components/layout/TopBar";
import Card from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import Timeline from "@/components/ui/Timeline";
import ProjectList from "@/components/citizen/ProjectList";
import { homeSteps } from "@/lib/complaints";
import { useSession } from "@/lib/session";
import { useStore } from "@/lib/store";
import Icon from "@/components/ui/Icon";

export default function CitizenHome() {
  const session = useSession();
  const complaints = useStore((s) => s.complaints);
  const projects = useStore((s) => s.projects);
  const reactions = useStore((s) => s.reactions);
  const unread = useStore((s) => s.notifications.filter((n) => !n.read).length);

  const first = (session?.name || "Ram Sharma").split(" ")[0];
  const open = complaints.filter((c) => !["Resolved", "Closed"].includes(c.status)).length;
  const supported = Object.values(reactions).filter((r) => r === "up").length;
  const latest = complaints[0];

  const kpis = [
    { label: "Open complaints", value: open, icon: "alert", tone: "bg-warn-tint text-warn" },
    { label: `Projects in Ward ${session?.ward ?? 4}`, value: projects.length, icon: "folder", tone: "bg-info-tint text-info" },
    { label: "Projects you support", value: supported, icon: "up", tone: "bg-ok-tint text-ok" },
    { label: "Unread updates", value: unread, icon: "bell", tone: "bg-brand-tint text-brand" },
  ];

  return (
    <>
      <TopBar crumbs={[{ label: "Home" }]} />
      <main className="flex flex-col gap-6 p-8">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h1 className="text-[26px] font-bold leading-[31px] text-ink">Namaste, {first}</h1>
            <p className="mt-1 text-sm leading-[17px] text-ink-3">
              Ward {session?.ward ?? 4} · Kailali Municipality · Here is what is happening in your ward
            </p>
          </div>
          <ButtonLink href="/citizen/complaints" size="dash">
            <Icon name="plus" size={16} />
            Report a problem
          </ButtonLink>
        </div>

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {kpis.map((k) => (
            <Card key={k.label} className="flex items-center gap-3.5 p-4">
              <span className={`grid size-11 place-items-center rounded-xl ${k.tone}`}>
                <Icon name={k.icon} size={22} />
              </span>
              <div>
                <p className="text-[26px] font-bold leading-[31px] text-ink">{k.value}</p>
                <p className="text-[13px] leading-4 text-ink-3">{k.label}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <ProjectList />

          <div className="flex flex-col gap-4">
            <Card className="flex flex-col gap-3 p-5">
              <h2 className="text-[15px] font-semibold leading-[19px] text-ink">Need something fixed?</h2>
              <p className="text-[13px] leading-[19px] text-ink-2">
                Tell your ward chairperson. Every complaint gets a tracking number you can follow.
              </p>
              <ButtonLink href="/citizen/complaints" size="dash" className="w-full">
                <Icon name="plus" size={16} />
                Report a problem
              </ButtonLink>
              <ButtonLink href="/citizen/suggest" variant="outline" size="dash" className="w-full">
                <Icon name="folder" size={16} />
                Suggest a project
              </ButtonLink>
            </Card>

            <Card className="flex flex-col gap-3 p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[15px] font-semibold leading-[19px] text-ink">My latest complaint</h2>
                {latest && <StatusBadge status={latest.status} />}
              </div>
              {latest ? (
                <>
                  <Link href="/citizen/complaints" className="group block">
                    <p className="text-xs font-semibold leading-[15px] text-brand group-hover:underline">{latest.id}</p>
                    <p className="text-[13px] leading-[17px] text-ink">{latest.title}</p>
                  </Link>
                  <Timeline steps={homeSteps(latest)} />
                </>
              ) : (
                <p className="text-[13px] text-ink-3">You have not reported a problem yet.</p>
              )}
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
