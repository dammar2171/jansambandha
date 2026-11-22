"use client";
import { useSyncExternalStore } from "react";
import { PROJECTS, COMMENTS, COMPLAINTS, NOTIFICATIONS } from "./mock/citizen";

// In-memory store. Resets on full page reload. Swap these actions for API calls later.
let state = {
  projects: PROJECTS,
  comments: COMMENTS,
  complaints: COMPLAINTS,
  notifications: NOTIFICATIONS,
  reactions: { water: "up", road: "up" },
  following: {},
  ratings: {},
  suggestions: [],
  likedComments: {},
  draft: null,
  search: "",
  toast: null,
};

const subs = new Set();
const subscribe = (fn) => (subs.add(fn), () => subs.delete(fn));
const set = (patch) => {
  state = { ...state, ...patch };
  subs.forEach((fn) => fn());
};

export const useStore = (selector) =>
  useSyncExternalStore(subscribe, () => selector(state), () => selector(state));

let toastTimer;
export function showToast(message) {
  set({ toast: { message } });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => set({ toast: null }), 2800);
}

export const setSearch = (search) => set({ search });

export function toggleReaction(id, kind) {
  set({ reactions: { ...state.reactions, [id]: state.reactions[id] === kind ? null : kind } });
}

export function toggleFollow(id) {
  const on = !state.following[id];
  set({ following: { ...state.following, [id]: on } });
  showToast(on ? "You will get updates on this project" : "You stopped following this project");
}

export function addComment(id, text) {
  const c = { id: `c${Date.now()}`, who: "You", initials: "RS", role: null, when: "Just now", text, likes: 0, mine: true };
  set({ comments: { ...state.comments, [id]: [...(state.comments[id] || []), c] } });
  showToast("Comment posted");
}

export function toggleCommentLike(cid) {
  set({ likedComments: { ...state.likedComments, [cid]: !state.likedComments[cid] } });
}

export function reportComment() {
  showToast("Comment reported to the moderators");
}

export function submitRating(id, stars, text) {
  set({ ratings: { ...state.ratings, [id]: { stars, text } } });
  showToast("Thank you for your feedback");
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function addComplaint(data) {
  const next = Math.max(...state.complaints.map((c) => Number(c.id.split("-")[2]))) + 1;
  const id = `WC-2083-${String(next).padStart(4, "0")}`;
  const d = new Date();
  const date = `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const complaint = {
    id,
    ...data,
    status: "Submitted",
    date,
    projectId: data.category === "Water" ? "water" : null,
    events: [{ status: "Submitted", who: "Ram Sharma", date, time }],
  };
  set({ complaints: [complaint, ...state.complaints], draft: null });
  showToast(`Complaint ${id} submitted`);
  return complaint;
}

export const saveDraft = (draft) => {
  set({ draft });
  showToast("Draft saved");
};

export const markRead = (id) =>
  set({ notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) });

export const markAllRead = () => set({ notifications: state.notifications.map((n) => ({ ...n, read: true })) });

export function clearRating(id) {
  const next = { ...state.ratings };
  delete next[id];
  set({ ratings: next });
}

export function addSuggestion(data) {
  const s = { id: `SG-${String(state.suggestions.length + 1).padStart(4, "0")}`, ...data, status: "Submitted" };
  set({ suggestions: [s, ...state.suggestions] });
  showToast("Suggestion sent to your ward chairperson");
  return s;
}
