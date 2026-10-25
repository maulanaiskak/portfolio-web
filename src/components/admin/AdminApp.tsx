'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, Briefcase, ExternalLink, FileUser, LayoutDashboard, Loader2, LogOut, Map, Menu, X } from 'lucide-react';
import { adminApi, UNAUTHORIZED_EVENT } from '@/lib/admin-api';
import { clearSession, getStoredAdmin, getToken } from '@/lib/auth';
import type { AdminUser } from '@/types';
import LoginForm from './LoginForm';
import { ToastProvider } from './Toast';

const AdminContext = createContext<AdminUser | null>(null);
export const useAdmin = () => useContext(AdminContext);

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/cv', label: 'CV', icon: FileUser },
  { href: '/admin/posts', label: 'Blog posts', icon: BookOpen },
  { href: '/admin/trips', label: 'Trips', icon: Map },
  { href: '/admin/career', label: 'Career', icon: Briefcase },
];

type State = { status: 'checking' } | { status: 'anonymous' } | { status: 'authed'; admin: AdminUser };

/** Client-side gate for /admin. Real enforcement is the API's JWT check;
 * this decides whether to show the login form or the dashboard. */
// Rendered client-only (see AdminRoot), so localStorage is readable on first render.
function initialState(): State {
  if (!getToken()) return { status: 'anonymous' };
  // Optimistic: show the stored admin immediately; the effect confirms with the API.
  const stored = getStoredAdmin();
  return stored ? { status: 'authed', admin: stored } : { status: 'checking' };
}

export default function AdminApp({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(initialState);
  const pathname = usePathname();
  const router = useRouter();
  // Keyed to the path it was opened on, so navigating closes the drawer.
  const [navOpenOn, setNavOpenOn] = useState<string | null>(null);
  const navOpen = navOpenOn === pathname;

  useEffect(() => {
    if (!getToken()) return;
    let cancelled = false;
    adminApi
      .me()
      .then((admin) => !cancelled && setState({ status: 'authed', admin }))
      .catch(() => {
        if (cancelled) return;
        clearSession();
        setState({ status: 'anonymous' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onUnauthorized = () => setState({ status: 'anonymous' });
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setState({ status: 'anonymous' });
    router.push('/admin');
  }, [router]);

  if (state.status === 'checking') {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Loader2 className="animate-spin text-accent" aria-label="Loading" />
      </div>
    );
  }

  if (state.status === 'anonymous') {
    return (
      <ToastProvider>
        <LoginForm onSuccess={(admin) => setState({ status: 'authed', admin })} />
      </ToastProvider>
    );
  }

  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

  const nav = (
    <nav aria-label="Admin" className="flex h-full flex-col">
      <Link href="/admin" className="mb-8 flex items-center gap-2 px-3 text-lg font-bold">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm">
          <span className="text-accent">M</span>I
        </span>
        <span className="text-white">Admin</span>
      </Link>
      <ul className="space-y-1">
        {NAV.map(({ href, label, icon: Icon, exact }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={isActive(href, exact) ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(href, exact) ? 'bg-white/[0.07] text-white' : 'text-gray-400 hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <Icon size={17} className={isActive(href, exact) ? 'text-accent' : ''} />
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-auto space-y-1 border-t border-white/5 pt-4">
        <a href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-400 hover:bg-white/[0.04] hover:text-white">
          <ExternalLink size={17} /> View site
        </a>
        <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-400 hover:bg-white/[0.04] hover:text-white">
          <LogOut size={17} /> Sign out
        </button>
        <p className="truncate px-3 pt-2 text-xs text-gray-600">{state.admin.email}</p>
      </div>
    </nav>
  );

  return (
    <AdminContext.Provider value={state.admin}>
      <ToastProvider>
        <div className="flex min-h-dvh">
          <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 border-r border-white/5 bg-[#0a0a0a] p-4 lg:block">{nav}</aside>

          {navOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/70" onClick={() => setNavOpenOn(null)} />
              <aside className="absolute inset-y-0 left-0 w-64 border-r border-white/10 bg-[#0a0a0a] p-4">{nav}</aside>
            </div>
          )}

          <div className="min-w-0 flex-1">
            <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/5 bg-background/80 px-4 py-3 backdrop-blur lg:hidden">
              <button type="button" onClick={() => setNavOpenOn(navOpen ? null : pathname)} aria-label="Toggle navigation" className="grid h-9 w-9 place-items-center rounded-lg hover:bg-white/5">
                {navOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <span className="text-sm font-semibold text-white">Admin</span>
              <span className="w-9" />
            </header>
            <main id="main" className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
              {children}
            </main>
          </div>
        </div>
      </ToastProvider>
    </AdminContext.Provider>
  );
}
