import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PostCard, TripCard } from '@/components/content/Cards';
import { formatMonth } from '@/lib/format';
import type { MilestoneSummary, PostSummary, TripSummary } from '@/types';

function Heading({ eyebrow, title, href, cta }: { eyebrow: string; title: string; href: string; cta: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <p className="eyebrow mb-2">{eyebrow}</p>
        <h3 className="text-2xl font-bold text-white md:text-3xl">{title}</h3>
      </div>
      <Link href={href} className="group hidden shrink-0 items-center gap-1 text-sm font-medium text-gray-400 hover:text-accent sm:inline-flex">
        {cta} <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

/** Home-page teaser for the non-CV content: latest posts, trips, milestones. */
export default function BeyondCode({
  posts,
  trips,
  milestones,
}: {
  posts: PostSummary[];
  trips: TripSummary[];
  milestones: MilestoneSummary[];
}) {
  if (posts.length + trips.length + milestones.length === 0) return null;

  return (
    <section id="journal" className="relative py-28">
      <div className="mx-auto max-w-6xl space-y-24 px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-3">Beyond the code</p>
          <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">Stories, trips &amp; turning points</h2>
          <p className="mt-4 leading-relaxed text-gray-400">
            Notes from the road, how I ended up in software, and things I&apos;ve learned along the way.
          </p>
        </div>

        {posts.length > 0 && (
          <div>
            <Heading eyebrow="Journal" title="Latest writing" href="/blog" cta="All posts" />
            <div className="grid gap-6 md:grid-cols-3">
              {posts.slice(0, 3).map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        )}

        {trips.length > 0 && (
          <div>
            <Heading eyebrow="Travel" title="Recent trips" href="/trips" cta="All trips" />
            <div className="grid gap-6 md:grid-cols-3">
              {trips.slice(0, 3).map((t) => (
                <TripCard key={t.id} trip={t} />
              ))}
            </div>
          </div>
        )}

        {milestones.length > 0 && (
          <div>
            <Heading eyebrow="Career" title="Turning points" href="/career" cta="Full story" />
            <ol className="grid gap-4 md:grid-cols-3">
              {milestones.slice(0, 3).map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/career/${m.slug}`}
                    className="group block h-full rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-all hover:-translate-y-1 hover:border-accent/30"
                  >
                    <p className="font-mono text-xs text-accent">{formatMonth(m.milestoneDate) || '—'}</p>
                    <h4 className="mt-3 text-lg font-bold text-white group-hover:text-accent">{m.title}</h4>
                    {(m.role || m.company) && (
                      <p className="mt-1 text-sm text-gray-500">{[m.role, m.company].filter(Boolean).join(' · ')}</p>
                    )}
                    {m.summary && <p className="mt-3 line-clamp-3 text-sm text-gray-400">{m.summary}</p>}
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
