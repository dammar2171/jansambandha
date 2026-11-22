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

  // Complaints (citizen)
  getMyComplaints: (token) => request('/complaints', { token }),
  createComplaint: (token, body) =>
    request('/complaints', { method: 'POST', body, token }),
};
