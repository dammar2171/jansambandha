"use client";
import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { getRole } from "@/lib/roles";
import { signOut, useSession } from "@/lib/session";
import { useWc, needsResponse } from "@/lib/wc-store";

export default function WcShell({ nav, children }) {
  const session = useSession();
  const router = useRouter();
  const unread = useWc((s) => s.complaints.filter((c) => needsResponse(c.status)).length);
  const toast = useWc((s) => s.toast);

  useEffect(() => {
    if (session === null) router.replace("/login");
    else if (session && session.role !== "ward-chair") router.replace(getRole(session.role)?.home ?? "/login");
  }, [session, router]);

  const authorized = session?.role === "ward-chair";

  return (
    <div className={authorized ? "flex min-h-screen bg-canvas" : "hidden"} aria-hidden={!authorized}>
      <Suspense fallback={<aside className="h-screen w-[248px] shrink-0 bg-brand-deep" aria-hidden />}>
        <Sidebar
          items={nav}
          roleLabel="Ward chair workspace"
          unread={unread}
          user={{ name: session?.name ?? "Ward 4 Chairperson", sub: `Ward Chairperson \u00b7 Ward ${session?.ward ?? 4}` }}
          onSignOut={() => {
            signOut();
            router.replace("/login");
          }}
        />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      {toast && (
        <div role="status" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-brand-deep px-4 py-3 text-sm font-medium text-white shadow-lg print:hidden">
          {toast.message}
        </div>
      )}
    </div>
  );
}
