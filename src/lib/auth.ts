'use client';

import type { AdminUser } from '@/types';

// The admin JWT lives in localStorage (the API authenticates via the
// Authorization header, not cookies, so there's no CSRF surface). It is
// cleared on expiry, on any 401, and on logout. The API is the real
// enforcement point; this is only UX state.

const TOKEN_KEY = 'portfolio.admin.token';
const EXPIRES_KEY = 'portfolio.admin.expiresAt';
const ADMIN_KEY = 'portfolio.admin.user';

function storage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function saveSession(token: string, expiresAt: string, admin: AdminUser) {
  const s = storage();
  if (!s) return;
  s.setItem(TOKEN_KEY, token);
  s.setItem(EXPIRES_KEY, expiresAt);
  s.setItem(ADMIN_KEY, JSON.stringify(admin));
}

export function clearSession() {
  const s = storage();
  s?.removeItem(TOKEN_KEY);
  s?.removeItem(EXPIRES_KEY);
  s?.removeItem(ADMIN_KEY);
}

/** Returns the stored token if present and not expired (with 30s skew). */
export function getToken(): string | null {
  const s = storage();
  if (!s) return null;
  const token = s.getItem(TOKEN_KEY);
  const expiresAt = Date.parse(s.getItem(EXPIRES_KEY) ?? '');
  if (!token || Number.isNaN(expiresAt) || expiresAt - 30_000 < Date.now()) {
    if (token) clearSession();
    return null;
  }
  return token;
}

export function getStoredAdmin(): AdminUser | null {
  try {
    const raw = storage()?.getItem(ADMIN_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
}
