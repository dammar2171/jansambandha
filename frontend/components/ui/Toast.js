"use client";
import { useStore } from "@/lib/store";

export default function Toast() {
  const toast = useStore((s) => s.toast);
  if (!toast) return null;
  return (
    <div role="status" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-brand-deep px-4 py-3 text-sm font-medium text-white shadow-lg">
      {toast.message}
    </div>
  );
}
