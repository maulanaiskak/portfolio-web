'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Briefcase, FileUser, Map, Plus } from 'lucide-react';
import { useAdmin } from '@/components/admin/AdminApp';
import { kinds, type KindKey } from '@/components/admin/content-kinds';
import { Card, PageTitle, StatusBadge } from '@/components/admin/ui';
import { formatDate } from '@/lib/format';
import type { ContentSummary } from '@/types';

type Stats = Record<KindKey, { published: number; drafts: number; recent: ContentSummary[] }>;

const ICONS = { posts: BookOpen, trips: Map, career: Briefcase };

export default function Dashboard() {
  const admin = useAdmin();
  const [stats, setStats] = useState<Partial<Stats>>({});

  useEffect(() => {
    (Object.keys(kinds) as KindKey[]).forEach(async (key) => {
      try {
        const kind = kinds[key];
        const [pub, drafts, recent] = await Promise.all([kind.list(1, 'published'), kind.list(1, 'draft'), kind.list(1, '')]);
        setStats((s) => ({ ...s, [key]: { published: pub.total, drafts: drafts.total, recent: recent.items.slice(0, 4) } }));
      } catch {
        // AdminApp handles 401; other failures just leave the card empty.
      }
    });
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      <PageTitle title={`${greeting} 👋`} description={admin?.email} />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/cv" className="group">
          <Card className="h-full transition-colors group-hover:border-accent/30">
            <FileUser className="mb-4 text-accent" />
            <p className="font-semibold text-white">Edit CV</p>
            <p className="mt-1 text-sm text-gray-500">Experience, projects, skills</p>
          </Card>
        </Link>
        {(Object.keys(kinds) as KindKey[]).map((key) => {
          const Icon = ICONS[key];
          const s = stats[key];
          return (
            <Link key={key} href={kinds[key].adminPath} className="group">
              <Card className="h-full transition-colors group-hover:border-accent/30">
                <Icon className="mb-4 text-accent" />
                <p className="font-semibold text-white">{kinds[key].plural}</p>
                <p className="mt-1 text-sm tabular-nums text-gray-500">
                  {s ? `${s.published} published · ${s.drafts} drafts` : '…'}
                </p>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {(Object.keys(kinds) as KindKey[]).map((key) => (
          <Card key={key}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-white">Recent {kinds[key].plural.toLowerCase()}</h2>
              <Link href={`${kinds[key].adminPath}/new`} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-accent hover:bg-accent/10">
                <Plus size={14} /> New
              </Link>
            </div>
            {stats[key]?.recent.length ? (
              <ul className="space-y-1">
                {stats[key]!.recent.map((item) => (
                  <li key={item.id}>
                    <Link href={`${kinds[key].adminPath}/${item.id}`} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-white/[0.04]">
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-gray-200">{item.title}</span>
                        <span className="text-xs text-gray-600">{formatDate(item.updatedAt)}</span>
                      </span>
                      <StatusBadge status={item.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-sm text-gray-600">{stats[key] ? 'Nothing yet' : 'Loading…'}</p>
            )}
            <Link href={kinds[key].adminPath} className="mt-3 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-white">
              View all <ArrowRight size={12} />
            </Link>
          </Card>
        ))}
      </div>
    </>
  );
}
