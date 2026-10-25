import type { Metadata } from 'next';
import AdminRoot from '@/components/admin/AdminRoot';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AdminRoot>{children}</AdminRoot>;
}
