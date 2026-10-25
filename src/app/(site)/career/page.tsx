import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import PageHeader from '@/components/content/PageHeader';
import { EmptyState } from '@/components/content/Cards';
import RemoteImage from '@/components/content/RemoteImage';
import { buildSafe, publicApi } from '@/lib/api';
import { formatMonth } from '@/lib/format';
import type { MilestoneSummary, Paged } from '@/types';

export const revalidate = 60; // seconds; keep in sync with REVALIDATE_SECONDS

export const metadata: Metadata = {
  title: 'Career',
  description: 'How an Engineering Physics graduate became a backend engineer — the turning points, in order.',
  alternates: { canonical: '/career' },
};

export default async function CareerPage() {
  // null only when the API is unreachable during `next build`: render empty
  // rather than baking a 404 into the first deploy.
  const res = await buildSafe<Paged<MilestoneSummary> | null>(() => publicApi.milestones(1, 50), null);
  if (res?.total === 0) notFound(); // hidden until the first milestone
  const items = res?.items ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Career story"
        title={
          <>
            From physics to <span className="text-gradient">production systems</span>
          </>
        }
        description="Switching majors, switching campuses, and the decisions in between — the long-form story behind the CV."
        orb="amber"
      />

      <section className="mx-auto max-w-4xl px-6 pb-28">
        {items.length === 0 ? (
          <EmptyState title="The story is being written" description="Career milestones will appear here soon." />
        ) : (
          <ol className="relative border-l border-white/10 pl-8 md:pl-12">
            {items.map((m) => (
              <li key={m.id} className="group relative pb-14 last:pb-0">
                <span className="absolute -left-[37px] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-accent shadow-[0_0_12px_#00d4ff] md:-left-[53px]" aria-hidden />
                <p className="font-mono text-sm text-accent">{formatMonth(m.milestoneDate) || 'Undated'}</p>
                <Link
                  href={`/career/${m.slug}`}
                  className="mt-3 block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition-all duration-300 hover:-translate-y-1 hover:border-accent/30"
                >
                  {m.coverImageUrl && (
                    <div className="relative aspect-[21/9]">
                      <RemoteImage src={m.coverImageUrl} alt="" fill sizes="(min-width: 768px) 800px, 100vw" className="object-cover" />
                    </div>
                  )}
                  <div className="p-6">
                    <h2 className="flex items-start justify-between gap-4 text-2xl font-bold text-white group-hover:text-accent">
                      {m.title}
                      <ArrowUpRight size={20} className="mt-1 shrink-0 text-gray-600 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                    </h2>
                    {(m.role || m.company) && <p className="mt-1 text-sm text-gray-500">{[m.role, m.company].filter(Boolean).join(' · ')}</p>}
                    {m.summary && <p className="mt-4 leading-relaxed text-gray-400">{m.summary}</p>}
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
