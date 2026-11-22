"use client";
import TopBarView from "./TopBarView";
import { setSearch, useWc, needsResponse } from "@/lib/wc-store";
import { useSession } from "@/lib/session";

export default function WcTopBar({ crumbs }) {
  const session = useSession();
  const search = useWc((s) => s.search);
  const unread = useWc((s) => s.complaints.filter((c) => needsResponse(c.status)).length);
  const initials = (session?.name || "HT").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <TopBarView crumbs={crumbs} search={search} onSearch={setSearch} unread={unread} notifHref="/ward-chair/complaints" notifLabel="Complaints needing a response" profileHref="/ward-chair/complaints" initials={initials} />
  );
}
