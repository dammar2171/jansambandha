'use client';
import { create } from 'zustand';
import { PROJECTS, COMMENTS, COMPLAINTS, NOTIFICATIONS } from './mock/citizen';

// Citizen app state. Actions are plain exported functions that use the store's
// setState/getState, so existing imports keep working after the Zustand switch.
export const useStore = create(() => ({
  projects: PROJECTS,
  comments: COMMENTS,
  complaints: COMPLAINTS,
  notifications: NOTIFICATIONS,
  reactions: { water: 'up', road: 'up' },
  following: {},
  ratings: {},
  suggestions: [],
  likedComments: {},
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

export function toggleReaction(id, kind) {
  set((s) => ({
    reactions: {
      ...s.reactions,
      [id]: s.reactions[id] === kind ? null : kind,
    },
  }));
}

export function toggleFollow(id) {
  const on = !get().following[id];
  set((s) => ({ following: { ...s.following, [id]: on } }));
  showToast(
    on
      ? 'You will get updates on this project'
      : 'You stopped following this project',
  );
}

export function addComment(id, text) {
  const c = {
    id: `c${Date.now()}`,
    who: 'You',
    initials: 'RS',
    role: null,
    when: 'Just now',
    text,
    likes: 0,
    mine: true,
  };
  set((s) => ({
    comments: { ...s.comments, [id]: [...(s.comments[id] || []), c] },
  }));
  showToast('Comment posted');
}

export function toggleCommentLike(cid) {
  set((s) => ({
    likedComments: { ...s.likedComments, [cid]: !s.likedComments[cid] },
  }));
}

export function reportComment() {
  showToast('Comment reported to the moderators');
}

export function submitRating(id, stars, text) {
  set((s) => ({ ratings: { ...s.ratings, [id]: { stars, text } } }));
  showToast('Thank you for your feedback');
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function addComplaint(data) {
  const next =
    Math.max(...get().complaints.map((c) => Number(c.id.split('-')[2]))) + 1;
  const id = `WC-2083-${String(next).padStart(4, '0')}`;
  const d = new Date();
  const date = `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  const time = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  const complaint = {
    id,
    ...data,
    status: 'Submitted',
    date,
    projectId: data.category === 'Water' ? 'water' : null,
    events: [{ status: 'Submitted', who: 'Ram Sharma', date, time }],
  };
  set((s) => ({ complaints: [complaint, ...s.complaints], draft: null }));
  showToast(`Complaint ${id} submitted`);
  return complaint;
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

export const markRead = (id) =>
  set((s) => ({
    notifications: s.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n,
    ),
  }));

export const markAllRead = () =>
  set((s) => ({
    notifications: s.notifications.map((n) => ({ ...n, read: true })),
  }));

export function clearRating(id) {
  set((s) => {
    const next = { ...s.ratings };
    delete next[id];
    return { ratings: next };
  });
}

export function addSuggestion(data) {
  const suggestion = {
    id: `SG-${String(get().suggestions.length + 1).padStart(4, '0')}`,
    ...data,
    status: 'Submitted',
  };
  set((s) => ({ suggestions: [suggestion, ...s.suggestions] }));
  showToast('Suggestion sent to your ward chairperson');
  return suggestion;
}
