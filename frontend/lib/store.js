'use client';
import { create } from 'zustand';
import { getToken } from './session';
import { api } from './api';

// Citizen app state. Everything is hydrated from the backend by the pages;
// the store only holds what several components share (projects, complaints,
// notifications, the current reaction map, the complaint draft, search, toast).
export const useStore = create(() => ({
  projects: [],
  comments: {},
  complaints: [],
  notifications: [],
  reactions: {},
  draft: null,
  search: '',
  toast: null,
}));

const set = useStore.setState;
const get = useStore.getState;

let toastTimer;
export function showToast(message) {
  set({ toast: { message } });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => set({ toast: null }), 2800);
}

export const setSearch = (search) => set({ search });

// Replace the reaction map (used to hydrate the citizen's reactions from the
// backend project list).
export const setReactions = (reactions) => set({ reactions });

// Toggle a reaction optimistically and persist it to the backend.
export async function reactToProject(id, kind) {
  const prev = get().reactions[id] ?? null;
  const next = prev === kind ? null : kind;
  set((s) => ({ reactions: { ...s.reactions, [id]: next } }));
  const token = getToken();
  if (!token) return;
  try {
    if (next === null) await api.removeReaction(token, id);
    else await api.setReaction(token, id, next === 'up' ? 'LIKE' : 'DISLIKE');
  } catch {
    set((s) => ({ reactions: { ...s.reactions, [id]: prev } }));
  }
}

export const saveDraft = (draft) => {
  set({ draft });
  showToast('Draft saved');
};

// Replace the complaint list (used to hydrate from the backend)
export const setComplaints = (complaints) => set({ complaints });

// Replace the project list (used to hydrate from the backend)
export const setProjects = (projects) => set({ projects });

// Prepend a single complaint (already in store shape)
export const prependComplaint = (complaint) =>
  set((s) => ({ complaints: [complaint, ...s.complaints], draft: null }));

// Replace the notification list (hydrated from the backend)
export const setNotifications = (notifications) => set({ notifications });

// Mark one notification read (optimistic, persisted to the backend)
export async function markRead(id) {
  const prev = get().notifications;
  set((s) => ({
    notifications: s.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n,
    ),
  }));
  const token = getToken();
  if (!token) return;
  try {
    await api.markNotificationRead(token, id);
  } catch {
    set({ notifications: prev });
  }
}

// Mark every notification read (optimistic, persisted to the backend)
export async function markAllRead() {
  const prev = get().notifications;
  set((s) => ({
    notifications: s.notifications.map((n) => ({ ...n, read: true })),
  }));
  const token = getToken();
  if (!token) return;
  try {
    await api.markAllNotificationsRead(token);
  } catch {
    set({ notifications: prev });
  }
}
