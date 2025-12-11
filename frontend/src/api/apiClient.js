// src/api/apiClient.js
const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

async function request(path, { method = 'GET', body = null, token = null } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const authToken = token || (typeof window !== 'undefined' && localStorage.getItem('token'));
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  } else {
    if (!res.ok) throw new Error('Network error');
    return null;
  }
}

export const api = {
  login: async ({ identifier, password }) => {
    // returns { success, student, token } on our backend
    return await request('/api/auth/login', { method: 'POST', body: { identifier, password } });
  },

  signup: async ({ studentId, name, email, classSection, password }) => {
    return await request('/api/auth/signup', { method: 'POST', body: { studentId, name, email, classSection, password } });
  },

  getAttendanceByStudent: async (studentId) => {
    return await request(`/api/attendance/student/${encodeURIComponent(studentId)}`, { method: 'GET' });
  },

  markAttendance: async (payload) => {
    return await request('/api/attendance/mark', { method: 'POST', body: payload });
  },

  // add more wrappers later (verifyFace, sessions, etc.)
};
