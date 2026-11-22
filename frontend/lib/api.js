'use client';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Is the backend running?', 0);
  }

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      payload?.message || 'Something went wrong. Please try again.',
      res.status,
      payload?.data,
    );
  }
  // Backend wraps responses as { statusCode, message, data, success }
  return payload?.data;
}

export const api = {
  registerCitizen: (body) =>
    request('/auth/register', { method: 'POST', body }),
  loginCitizen: (body) => request('/auth/login', { method: 'POST', body }),
  loginOfficial: (body) => request('/users/login', { method: 'POST', body }),
  getMe: (token) => request('/auth/me', { token }),
  changePassword: (token, body) =>
    request('/auth/change-password', { method: 'PATCH', body, token }),
  getWards: () => request('/wards'),

  // Projects (citizen)
  getProjects: (token) => request('/projects', { token }),
  getProject: (token, id) => request(`/projects/${id}`, { token }),
  getProjectFeedback: (token, id) =>
    request(`/projects/${id}/feedback`, { token }),
  setReaction: (token, id, reaction) =>
    request(`/projects/${id}/reactions`, {
      method: 'POST',
      body: { reaction },
      token,
    }),
  removeReaction: (token, id) =>
    request(`/projects/${id}/reactions`, { method: 'DELETE', token }),
  addProjectComment: (token, id, comment) =>
    request(`/projects/${id}/comments`, {
      method: 'POST',
      body: { comment },
      token,
    }),
  reportProjectComment: (token, id, commentId) =>
    request(`/projects/${id}/comments/${commentId}/report`, {
      method: 'POST',
      token,
    }),
  setRating: (token, id, rating, ratingNote) =>
    request(`/projects/${id}/rating`, {
      method: 'POST',
      body: { rating, ratingNote },
      token,
    }),
  toggleFollowProject: (token, id) =>
    request(`/projects/${id}/follow`, { method: 'POST', token }),
  getMyProjectFeedback: (token) =>
    request('/projects/mine/feedback', { token }),

  // Progress updates (contractor submits, department verifies)
  submitProgressUpdate: (token, projectId, body) =>
    request(`/projects/${projectId}/progress-updates`, {
      method: 'POST',
      body,
      token,
    }),
  getProgressUpdates: (token, projectId) =>
    request(`/projects/${projectId}/progress-updates`, { token }),
  getProgressComparison: (token, projectId) =>
    request(`/projects/${projectId}/progress-comparison`, { token }),
  verifyProgress: (token, updateId, body) =>
    request(`/progress-updates/${updateId}/verify`, {
      method: 'POST',
      body,
      token,
    }),

  // Complaints
  getMyComplaints: (token) => request('/complaints', { token }),
  getComplaints: (token) => request('/complaints', { token }),
  createComplaint: (token, body) =>
    request('/complaints', { method: 'POST', body, token }),
  updateComplaint: (token, id, body) =>
    request(`/complaints/${id}`, { method: 'PATCH', body, token }),
  updateComplaintStatus: (token, id, status) =>
    request(`/complaints/${id}/status`, {
      method: 'PATCH',
      body: { status },
      token,
    }),
  addComplaintResponse: (token, id, message) =>
    request(`/complaints/${id}/responses`, {
      method: 'POST',
      body: { message },
      token,
    }),

  // Project proposals (ward chair)
  getProposals: (token) => request('/project-proposals', { token }),
  getProposal: (token, id) => request(`/project-proposals/${id}`, { token }),
  createProposal: (token, body) =>
    request('/project-proposals', { method: 'POST', body, token }),
  updateProposal: (token, id, body) =>
    request(`/project-proposals/${id}`, { method: 'PATCH', body, token }),
  submitProposal: (token, id) =>
    request(`/project-proposals/${id}/submit`, { method: 'POST', token }),
  getProposalHistory: (token, id) =>
    request(`/project-proposals/${id}/history`, { token }),
  decideProposal: (token, id, decision, reason) =>
    request(`/project-proposals/${id}/administrative-decision`, {
      method: 'POST',
      body: { decision, reason },
      token,
    }),
  addReview: (token, id, note) =>
    request(`/project-proposals/${id}/reviews`, {
      method: 'POST',
      body: { note },
      token,
    }),

  // Users (CAO / General Admin)
  getUsers: (token) => request('/users', { token }),
  createOfficial: (token, body) =>
    request('/users', { method: 'POST', body, token }),
  setUserStatus: (token, id, accountStatus) =>
    request(`/users/${id}/status`, {
      method: 'PATCH',
      body: { accountStatus },
      token,
    }),

  // Departments
  getDepartments: (token) => request('/departments', { token }),

  // Notifications
  getNotifications: (token) => request('/notifications', { token }),
  getUnreadCount: (token) => request('/notifications/unread-count', { token }),
  markNotificationRead: (token, id) =>
    request(`/notifications/${id}/read`, { method: 'PATCH', token }),
  markAllNotificationsRead: (token) =>
    request('/notifications/read-all', { method: 'PATCH', token }),

  // Citizen project suggestions
  getSuggestions: (token) => request('/suggestions', { token }),
  createSuggestion: (token, body) =>
    request('/suggestions', { method: 'POST', body, token }),

  // Audit trail (CAO / General Admin)
  getAuditLogs: (token) => request('/audit-logs', { token }),
};
