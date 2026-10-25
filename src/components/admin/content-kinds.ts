'use client';

import { adminApi } from '@/lib/admin-api';
import type {
  ContentStatus,
  ContentSummary,
  Milestone,
  MilestoneInput,
  Paged,
  Post,
  PostInput,
  Trip,
  TripInput,
} from '@/types';

// One config per content type so the list and editor screens stay generic.

export type KindKey = 'posts' | 'trips' | 'career';

type Entity = Post | Trip | Milestone;
type Input = PostInput | TripInput | MilestoneInput;

export interface KindConfig<E extends Entity = Entity, I extends Input = Input> {
  key: KindKey;
  singular: string;
  plural: string;
  adminPath: string;
  publicPath: string;
  list: (page: number, status?: ContentStatus | '') => Promise<Paged<ContentSummary>>;
  get: (id: number) => Promise<E>;
  create: (input: I) => Promise<E>;
  update: (id: number, input: I) => Promise<E>;
  remove: (id: number) => Promise<void>;
  empty: () => I;
  toInput: (e: E) => I;
}

const baseEmpty = { slug: '', title: '', summary: '', bodyMarkdown: '', coverImageUrl: '', status: 'draft' as ContentStatus, publishedAt: null };

const baseInput = (e: Entity) => ({
  slug: e.slug,
  title: e.title,
  summary: e.summary,
  bodyMarkdown: e.bodyMarkdown,
  coverImageUrl: e.coverImageUrl,
  status: e.status,
  publishedAt: e.publishedAt,
});

export const posts: KindConfig<Post, PostInput> = {
  key: 'posts',
  singular: 'post',
  plural: 'Blog posts',
  adminPath: '/admin/posts',
  publicPath: '/blog',
  list: adminApi.posts,
  get: adminApi.post,
  create: adminApi.createPost,
  update: adminApi.updatePost,
  remove: adminApi.deletePost,
  empty: () => ({ ...baseEmpty, tags: [] }),
  toInput: (p) => ({ ...baseInput(p), tags: p.tags }),
};

export const trips: KindConfig<Trip, TripInput> = {
  key: 'trips',
  singular: 'trip',
  plural: 'Trips',
  adminPath: '/admin/trips',
  publicPath: '/trips',
  list: adminApi.trips,
  get: adminApi.trip,
  create: adminApi.createTrip,
  update: adminApi.updateTrip,
  remove: adminApi.deleteTrip,
  empty: () => ({ ...baseEmpty, location: '', countryCode: '', startDate: null, endDate: null }),
  toInput: (t) => ({ ...baseInput(t), location: t.location, countryCode: t.countryCode, startDate: t.startDate, endDate: t.endDate }),
};

export const career: KindConfig<Milestone, MilestoneInput> = {
  key: 'career',
  singular: 'milestone',
  plural: 'Career milestones',
  adminPath: '/admin/career',
  publicPath: '/career',
  list: adminApi.milestones,
  get: adminApi.milestone,
  create: adminApi.createMilestone,
  update: adminApi.updateMilestone,
  remove: adminApi.deleteMilestone,
  empty: () => ({ ...baseEmpty, company: '', role: '', milestoneDate: null }),
  toInput: (m) => ({ ...baseInput(m), company: m.company, role: m.role, milestoneDate: m.milestoneDate }),
};

export const kinds = { posts, trips, career } as const;

/** Mirrors the API's Slugify for live slug previews. */
export function slugify(s: string): string {
  return s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
    .replace(/-+$/, '');
}
