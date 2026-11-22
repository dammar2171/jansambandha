"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session";
import { getRole } from "@/lib/roles";

export default function Page() {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session === undefined) return;
    router.replace(session ? getRole(session.role)?.home ?? "/login" : "/login");
  }, [session, router]);

  return null;
}