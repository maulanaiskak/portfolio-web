import type {
  ApiEnvelope,
  Cv,
  Milestone,
  MilestoneSummary,
  Paged,
  Post,
  PostSummary,
  TagCount,
  Trip,
  TripSummary,
} from '@/types';

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080').replace(/\/$/, '');

// Server-side fetches may use a private URL; the browser always uses the public one.
const serverBase = () =>
  (typeof window === 'undefined' && process.env.API_INTERNAL_BASE_URL
    ? process.env.API_INTERNAL_BASE_URL
    : API_BASE_URL
  ).replace(/\/$/, '');

/** Seconds public pages are cached before Next re-fetches from the API (ISR). */
export const REVALIDATE_SECONDS = 60;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function isNotFound(err: unknown): boolean {
  return err instanceof ApiError && err.status === 404;
}

async function parse<T>(res: Response): Promise<{ data: T; total: number }> {
  if (res.status === 204) return { data: undefined as T, total: 0 };
  let body: ApiEnvelope<T> | null = null;
  try {
    body = (await res.json()) as ApiEnvelope<T>;
  } catch {
    // non-JSON (proxy error page, network issue)
  }
  if (!res.ok || !body || body.response_code !== '00') {
    throw new ApiError(body?.response_message ?? `Request failed (${res.status})`, res.status, body?.response_code ?? 'XX');
  }
  return { data: body.data as T, total: body.total_data ?? 0 };
}

/** Public read used by Server Components, cached with ISR + tags. */
async function publicGet<T>(path: string, tags: string[]): Promise<{ data: T; total: number }> {
  const res = await fetch(`${serverBase()}/api/v1${path}`, {
    next: { revalidate: REVALIDATE_SECONDS, tags },
    headers: { Accept: 'application/json' },
  });
  return parse<T>(res);
}

function qs(params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') q.set(k, String(v));
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const publicApi = {
  cv: async (): Promise<Cv> => (await publicGet<Cv>('/cv', ['cv'])).data,

  trips: async (page = 1, limit = 12): Promise<Paged<TripSummary>> => {
    const r = await publicGet<TripSummary[]>(`/trips${qs({ page, limit })}`, ['trips']);
    return { items: r.data, total: r.total };
  },
  trip: async (slug: string): Promise<Trip> =>
    (await publicGet<Trip>(`/trips/${encodeURIComponent(slug)}`, ['trips', `trip:${slug}`])).data,

  milestones: async (page = 1, limit = 50): Promise<Paged<MilestoneSummary>> => {
    const r = await publicGet<MilestoneSummary[]>(`/milestones${qs({ page, limit })}`, ['milestones']);
    return { items: r.data, total: r.total };
  },
  milestone: async (slug: string): Promise<Milestone> =>
    (await publicGet<Milestone>(`/milestones/${encodeURIComponent(slug)}`, ['milestones', `milestone:${slug}`])).data,

  posts: async (page = 1, limit = 12, tag?: string): Promise<Paged<PostSummary>> => {
    const r = await publicGet<PostSummary[]>(`/posts${qs({ page, limit, tag })}`, ['posts']);
    return { items: r.data, total: r.total };
  },
  post: async (slug: string): Promise<Post> =>
    (await publicGet<Post>(`/posts/${encodeURIComponent(slug)}`, ['posts', `post:${slug}`])).data,
  tags: async (): Promise<TagCount[]> => (await publicGet<TagCount[]>('/posts/tags', ['posts'])).data,
};

/** Runs a public fetch, returning fallback if the API is unreachable, so one
 * failing section doesn't take down the whole page. */
export async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error('[api]', err instanceof Error ? err.message : err);
    return fallback;
  }
}

/** For pages pre-rendered at build time: if the API is unreachable during
 * `next build` (CI, first deploy), render empty and let ISR fill in later.
 * At runtime errors propagate, so Next keeps serving the last good page. */
export function buildSafe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  return process.env.NEXT_PHASE === 'phase-production-build' ? safe(fn, fallback) : fn();
}

export { parse as parseApiResponse };
