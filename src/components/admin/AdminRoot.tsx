'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// The admin UI depends on the session in localStorage, so it renders only in
// the browser (no SSR, no hydration mismatch). Admin pages carry no SEO value.
const AdminApp = dynamic(() => import('./AdminApp'), {
  ssr: false,
  loading: () => (
    <div className="grid min-h-dvh place-items-center">
      <Loader2 className="animate-spin text-accent" aria-label="Loading" />
    </div>
  ),
});

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <AdminApp>{children}</AdminApp>;
}
