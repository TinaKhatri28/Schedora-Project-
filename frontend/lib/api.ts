import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.error || err.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// Users
export const getMe = () => api.get('/users/me').then(r => r.data);
export const updateMe = (data: any) => api.put('/users/me', data).then(r => r.data);

// Event Types  — response shape: { eventTypes: [...] }
export const getEventTypes = () => api.get('/event-types').then(r => r.data);
export const createEventType = (data: any) => api.post('/event-types', data).then(r => r.data);
export const updateEventType = (id: string, data: any) => api.put(`/event-types/${id}`, data).then(r => r.data);
export const toggleEventType = (id: string) => api.patch(`/event-types/${id}/toggle`).then(r => r.data);
export const deleteEventType = (id: string) => api.delete(`/event-types/${id}`).then(r => r.data);

// Availability  — response shape: { timezone, days: [...] }
export const getAvailability = () => api.get('/availability').then(r => r.data);
export const updateAvailability = (data: any) => api.put('/availability', data).then(r => r.data);

// Meetings  — response shape: { meetings: [...] }
export const getMeetings = (filter: 'upcoming' | 'past' | 'all' = 'all') =>
  api.get(`/meetings?filter=${filter}`).then(r => r.data);
export const getMeeting = (id: string) => api.get(`/meetings/${id}`).then(r => r.data);
export const cancelMeeting = (id: string) => api.delete(`/meetings/${id}`).then(r => r.data);

// Public Booking
export const getPublicProfile = (username: string) =>
  api.get(`/booking/${username}`).then(r => r.data);
export const getBookingEventType = (username: string, slug: string) =>
  api.get(`/booking/${username}/${slug}`).then(r => r.data);
export const getAvailableSlots = (username: string, slug: string, date: string) =>
  api.get(`/booking/${username}/${slug}/slots?date=${date}`).then(r => r.data);
export const createBooking = (username: string, slug: string, data: any) =>
  api.post(`/booking/${username}/${slug}`, data).then(r => r.data);

export default api;
// ─────────────────────────────────────────────────────────────
// ADD THESE FUNCTIONS TO YOUR EXISTING frontend/lib/api.ts
// ─────────────────────────────────────────────────────────────

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ── Contacts ──────────────────────────────────────────────────
export const getContacts = () =>
  fetch(`${API}/contacts`).then((r) => r.json());

export const getContact = (email: string) =>
  fetch(`${API}/contacts/${encodeURIComponent(email)}`).then((r) => r.json());

// ── Workflows ─────────────────────────────────────────────────
export const getWorkflows = () =>
  fetch(`${API}/workflows`).then((r) => r.json());

export const createWorkflow = (data: { name: string; trigger: string; action: string; description?: string }) =>
  fetch(`${API}/workflows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((r) => r.json());

// ── Integrations ─────────────────────────────────────────────
export const getIntegrations = () =>
  fetch(`${API}/integrations`).then((r) => r.json());

export const connectIntegration = (id: string) =>
  fetch(`${API}/integrations/${id}/connect`, { method: 'POST' }).then((r) => r.json());

export const disconnectIntegration = (id: string) =>
  fetch(`${API}/integrations/${id}/disconnect`, { method: 'DELETE' }).then((r) => r.json());

// ── Routing ──────────────────────────────────────────────────
export const getRoutingForms = () =>
  fetch(`${API}/routing`).then((r) => r.json());

export const createRoutingForm = (data: { name: string }) =>
  fetch(`${API}/routing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((r) => r.json());

// ── Analytics ─────────────────────────────────────────────────
export const getAnalytics = () =>
  fetch(`${API}/analytics`).then((r) => r.json());