// Shapes returned by portfolio-api (/api/v1). Keep in sync with internal/dto.

export interface ApiEnvelope<T> {
  response_code: string;
  response_message: string;
  data?: T;
  total_data?: number;
}

// ── CV ──────────────────────────────────────────────────────────────────────

export interface Responsibility {
  period: string;
  description: string;
}

export interface Experience {
  id?: number;
  company: string;
  location: string;
  position: string;
  period: string;
  responsibilities: Responsibility[];
  projectsAndAchievements: string[];
  tech: string[];
}

export interface Project {
  id?: number;
  title: string;
  description: string;
  technologies: string[];
  image: string;
  highlights: string[];
}

export interface Education {
  id?: number;
  institution: string;
  location: string;
  degree: string;
  period: string;
  gpa: string;
  thesis: string;
  thesis_link: string;
}

export interface SkillItem {
  id?: number;
  name: string;
  level: number;
  note?: string;
  link?: string;
}

export interface SkillCategory {
  id?: number;
  category: string;
  items: SkillItem[];
}

export interface Cv {
  experiences: Experience[];
  projects: Project[];
  education: Education[];
  skills: SkillCategory[];
}

// ── Content ─────────────────────────────────────────────────────────────────

export type ContentStatus = 'draft' | 'published';

export interface ContentSummary {
  id: number;
  slug: string;
  title: string;
  summary: string;
  coverImageUrl: string;
  status: ContentStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TripPhoto {
  id: number;
  url: string;
  caption: string;
  sortOrder: number;
}

export interface TripSummary extends ContentSummary {
  location: string;
  countryCode: string;
  startDate: string | null;
  endDate: string | null;
}

export interface Trip extends TripSummary {
  bodyMarkdown: string;
  photos: TripPhoto[];
}

export interface MilestoneSummary extends ContentSummary {
  company: string;
  role: string;
  milestoneDate: string | null;
}

export interface Milestone extends MilestoneSummary {
  bodyMarkdown: string;
}

export interface PostSummary extends ContentSummary {
  tags: string[];
  readMinutes: number;
}

export interface Post extends PostSummary {
  bodyMarkdown: string;
}

export interface TagCount {
  tag: string;
  count: number;
}

export interface Paged<T> {
  items: T[];
  total: number;
}

// ── Admin ───────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: number;
  email: string;
}

export interface LoginResult {
  token: string;
  tokenType: 'Bearer';
  expiresAt: string;
  admin: AdminUser;
}

export interface UploadedImage {
  url: string;
  contentType: string;
  width: number;
  height: number;
  bytes: number;
}

export interface ContentInput {
  slug: string;
  title: string;
  summary: string;
  bodyMarkdown: string;
  coverImageUrl: string;
  status: ContentStatus;
  publishedAt?: string | null;
}

export interface TripInput extends ContentInput {
  location: string;
  countryCode: string;
  startDate: string | null;
  endDate: string | null;
}

export interface MilestoneInput extends ContentInput {
  company: string;
  role: string;
  milestoneDate: string | null;
}

export interface PostInput extends ContentInput {
  tags: string[];
}
