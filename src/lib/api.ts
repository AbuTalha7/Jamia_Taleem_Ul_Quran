/**
 * api.ts — thin fetch wrappers for the Express/MongoDB API server.
 * All requests go to /api/* which Vite proxies to http://localhost:3001 in dev.
 */

import type { Student, Teacher, FeeRecord, Announcement, Result } from '@/types';

const BASE = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (username: string, password: string) =>
    request<{ success: boolean; role: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
};

export const stateApi = {
  get: () => request<Record<string, unknown> | null>('/state'),
  save: (state: Record<string, unknown>) =>
    request<{ success: boolean }>('/state', { method: 'PUT', body: JSON.stringify(state) }),
};

// ── Students ──────────────────────────────────────────────────────────────────
export const studentsApi = {
  getAll: () => request<Student[]>('/students'),
  create: (data: Omit<Student, 'id'>) =>
    request<Student>('/students', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Student>) =>
    request<Student>(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) =>
    request<{ success: boolean }>(`/students/${id}`, { method: 'DELETE' }),
};

// ── Teachers ──────────────────────────────────────────────────────────────────
export const teachersApi = {
  getAll: () => request<Teacher[]>('/teachers'),
  create: (data: Omit<Teacher, 'id'>) =>
    request<Teacher>('/teachers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Teacher>) =>
    request<Teacher>(`/teachers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) =>
    request<{ success: boolean }>(`/teachers/${id}`, { method: 'DELETE' }),
};

// ── Fee Records ───────────────────────────────────────────────────────────────
export const feesApi = {
  getAll: () => request<FeeRecord[]>('/fees'),
  create: (data: Omit<FeeRecord, 'id'>) =>
    request<FeeRecord>('/fees', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<FeeRecord>) =>
    request<FeeRecord>(`/fees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) =>
    request<{ success: boolean }>(`/fees/${id}`, { method: 'DELETE' }),
};

// ── Announcements ─────────────────────────────────────────────────────────────
export const announcementsApi = {
  getAll: () => request<Announcement[]>('/announcements'),
  create: (data: Omit<Announcement, 'id'>) =>
    request<Announcement>('/announcements', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Announcement>) =>
    request<Announcement>(`/announcements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) =>
    request<{ success: boolean }>(`/announcements/${id}`, { method: 'DELETE' }),
};

// ── Results ───────────────────────────────────────────────────────────────────
export const resultsApi = {
  getAll: () => request<Result[]>('/results'),
  create: (data: Omit<Result, 'id'>) =>
    request<Result>('/results', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Result>) =>
    request<Result>(`/results/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) =>
    request<{ success: boolean }>(`/results/${id}`, { method: 'DELETE' }),
};
