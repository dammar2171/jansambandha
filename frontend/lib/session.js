"use client";
import { useMemo, useSyncExternalStore } from "react";

const KEY = "jansambandha.session";
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

function subscribe(cb) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}
const snapshot = () =>
  window.localStorage.getItem(KEY) ?? window.sessionStorage.getItem(KEY) ?? "";
const serverSnapshot = () => null;

// undefined = still loading, null = signed out, object = signed in
export function useSession() {
  const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return useMemo(() => {
    if (raw === null) return undefined;
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, [raw]);
}

export function signIn(session, remember) {
  const value = JSON.stringify(session);
  (remember ? localStorage : sessionStorage).setItem(KEY, value);
  (remember ? sessionStorage : localStorage).removeItem(KEY);
  emit();
}

export function signOut() {
  localStorage.removeItem(KEY);
  sessionStorage.removeItem(KEY);
  emit();
}