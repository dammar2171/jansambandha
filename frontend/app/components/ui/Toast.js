"use client";
import { useStore } from "@/lib/store";

export default function Toast() {
  const toast = useStore((s) => s.toast);
  if (!toast) return null;
  return (
    <div role="status" className="fixed bottom-4 left-1/2 z-50 w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 break-words rounded-lg bg-brand-deep px-4 py-3 text-center text-sm font-medium text-white shadow-lg sm:bottom-6">
      {toast.message}
    </div>
  );
}
