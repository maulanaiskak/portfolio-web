'use client';

import { API_BASE_URL, ApiError, parseApiResponse } from '@/lib/api';
import { clearSession, getToken } from '@/lib/auth';
import type {
  AdminUser,
  ContentStatus,
  Cv,
  LoginResult,
  Milestone,
  MilestoneInput,
  MilestoneSummary,
  Paged,
  Post,
  PostInput,
  PostSummary,
  Trip,
  TripInput,
  TripPhoto,
  TripSummary,
  UploadedImage,
} from '@/types';

/** Fired when the API rejects the stored token; AdminGuard shows the login form. */
export const UNAUTHORIZED_EVENT = 'admin:unauthorized';

async function request<T>(method: string, path: string, body?: unknown | FormData): Promise<{ data: T; total: number }> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body; // browser sets the multipart boundary
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api/v1${path}`, { method, headers, body: payload, cache: 'no-store' });
  } catch {
    throw new ApiError('Cannot reach the API. Is it running?', 0, 'NETWORK');
  }
  if (res.status === 401 && path !== '/auth/login') {
    clearSession();
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }
  return parseApiResponse<T>(res);
}

const get = async <T>(path: string) => (await request<T>('GET', path)).data;
const list = async <T>(path: string): Promise<Paged<T>> => {
  const r = await request<T[]>('GET', path);
  return { items: r.data ?? [], total: r.total };
};
const send = async <T>(method: string, path: string, body?: unknown) => (await request<T>(method, path, body)).data;

function listQuery(page: number, status?: ContentStatus | '') {
  const q = new URLSearchParams({ page: String(page), limit: '20' });
  if (status) q.set('status', status);
  return `?${q}`;
}

export const adminApi = {
  login: (email: string, password: string) => send<LoginResult>('POST', '/auth/login', { email, password }),
  me: () => get<AdminUser>('/admin/me'),

  cv: () => get<Cv>('/admin/cv'),
  saveCv: (cv: Cv) => send<Cv>('PUT', '/admin/cv', cv),

  trips: (page = 1, status?: ContentStatus | '') => list<TripSummary>(`/admin/trips${listQuery(page, status)}`),
  trip: (id: number) => get<Trip>(`/admin/trips/${id}`),
  createTrip: (input: TripInput) => send<Trip>('POST', '/admin/trips', input),
  updateTrip: (id: number, input: TripInput) => send<Trip>('PUT', `/admin/trips/${id}`, input),
  deleteTrip: (id: number) => send<void>('DELETE', `/admin/trips/${id}`),
  addPhoto: (tripId: number, photo: { url: string; caption: string; sortOrder?: number }) =>
    send<TripPhoto>('POST', `/admin/trips/${tripId}/photos`, { sortOrder: 0, ...photo }),
  updatePhoto: (tripId: number, photoId: number, photo: { caption: string; sortOrder: number }) =>
    send<TripPhoto>('PUT', `/admin/trips/${tripId}/photos/${photoId}`, { url: '', ...photo }),
  deletePhoto: (tripId: number, photoId: number) => send<void>('DELETE', `/admin/trips/${tripId}/photos/${photoId}`),

  milestones: (page = 1, status?: ContentStatus | '') => list<MilestoneSummary>(`/admin/milestones${listQuery(page, status)}`),
  milestone: (id: number) => get<Milestone>(`/admin/milestones/${id}`),
  createMilestone: (input: MilestoneInput) => send<Milestone>('POST', '/admin/milestones', input),
  updateMilestone: (id: number, input: MilestoneInput) => send<Milestone>('PUT', `/admin/milestones/${id}`, input),
  deleteMilestone: (id: number) => send<void>('DELETE', `/admin/milestones/${id}`),

  posts: (page = 1, status?: ContentStatus | '') => list<PostSummary>(`/admin/posts${listQuery(page, status)}`),
  post: (id: number) => get<Post>(`/admin/posts/${id}`),
  createPost: (input: PostInput) => send<Post>('POST', '/admin/posts', input),
  updatePost: (id: number, input: PostInput) => send<Post>('PUT', `/admin/posts/${id}`, input),
  deletePost: (id: number) => send<void>('DELETE', `/admin/posts/${id}`),

  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return send<UploadedImage>('POST', '/admin/uploads', form);
  },
};
