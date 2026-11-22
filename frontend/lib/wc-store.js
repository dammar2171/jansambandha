'use client';
import { useSyncExternalStore } from 'react';
import { COMPLAINTS, PROJECTS } from './mock/citizen';

const initialComplaints = COMPLAINTS.map((complaint, index) => ({
  ...complaint,
  age: [3, 9, 25][index] ?? 1,
  by: 'Ram Sharma',
}));

const initialProjects = PROJECTS.map((project) => ({
  ...project,
  status: project.status === 'Under review' ? 'Submitted' : project.status,
  budget: Number(project.budget.estimated.replace(/[^\d]/g, '')) || 0,
  households: 0,
  benefits: '',
  justification: '',
  returnReason: '',
  docs: [],
  comments: project.commentCount,
  satisfaction: Number.parseInt(project.metrics.satisfaction.value, 10) || 0,
  progress:
    project.status === 'Ongoing'
      ? {
          planned: project.planned,
          verified: project.verified,
          financial: project.financial,
        }
      : null,
  history: project.journey.map((step) => ({
    title: step.title,
    who: step.sub?.split(' · ')[0] || 'Ward Chair',
    date: '',
    note: '',
  })),
  breakdown: [],
}));

const categories = [
  ...new Set(initialComplaints.map((complaint) => complaint.category)),
];
const initialDemand = categories.map((label) => ({
  label,
  count: initialComplaints.filter((complaint) => complaint.category === label)
    .length,
  suggestions: 0,
}));

let state = {
  complaints: initialComplaints,
  projects: initialProjects,
  demand: initialDemand,
  suggestions: [],
  selected: null,
  search: '',
  toast: null,
  prefill: null,
};

const subscribers = new Set();
const subscribe = (callback) => {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
};
const getSnapshot = () => state;
const set = (patch) => {
  state = { ...state, ...patch };
  subscribers.forEach((callback) => callback());
};

export function useWc(selector) {
  return useSyncExternalStore(
    subscribe,
    () => selector(getSnapshot()),
    () => selector(getSnapshot()),
  );
}

let toastTimer;
export function showToast(message) {
  set({ toast: { message } });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => set({ toast: null }), 2800);
}

export const setSearch = (search) => set({ search });
export const setPrefill = (prefill) => set({ prefill });

// Replace the proposal list (used to hydrate from the backend)
export const setProjects = (projects) => set({ projects });

// Replace the complaint list (used to hydrate from the backend)
export const setComplaints = (complaints) => set({ complaints });

// Add a proposal, or replace it in place if it already exists (by id)
export const upsertProject = (project) => {
  const exists = state.projects.some((p) => p.id === project.id);
  set({
    projects: exists
      ? state.projects.map((p) => (p.id === project.id ? project : p))
      : [project, ...state.projects],
  });
};
export const selectComplaint = (id) => set({ selected: id });
export const needsResponse = (status) =>
  !['Resolved', 'Closed'].includes(status);
export const isEditable = (project) =>
  ['Draft', 'Returned'].includes(project.status);

export function respond(id, { status, message, assignee, projectId }) {
  const complaints = state.complaints.map((complaint) => {
    if (complaint.id !== id) return complaint;
    return {
      ...complaint,
      status,
      projectId: projectId || null,
      assignee,
      events: [
        ...complaint.events,
        {
          status,
          who: 'Ward Chair',
          role: 'Ward Chair',
          date: 'Today',
          note: message,
        },
      ],
    };
  });
  set({ complaints });
  showToast(`Response sent for ${id}`);
}

export function submitProposal(id) {
  const projects = state.projects.map((project) =>
    project.id === id
      ? {
          ...project,
          status: 'Submitted',
          statusNote: 'Submitted for CAO review',
        }
      : project,
  );
  set({ projects });
  showToast('Proposal submitted for CAO review');
}

export function saveProposal(id, data) {
  if (id) {
    const projects = state.projects.map((project) =>
      project.id === id
        ? { ...project, ...data, statusNote: 'Draft saved' }
        : project,
    );
    set({ projects, prefill: null });
    showToast('Proposal draft saved');
    return id;
  }

  const nextId = `proposal-${Date.now()}`;
  const project = {
    id: nextId,
    ...data,
    priority: 0,
    status: 'Draft',
    statusNote: 'Draft',
    fy: '2083/84',
    up: 0,
    down: 0,
    comments: 0,
    satisfaction: 0,
    docs: [],
    history: [],
    breakdown: [],
    progress: null,
  };
  set({ projects: [project, ...state.projects], prefill: null });
  showToast('Proposal draft saved');
  return nextId;
}
