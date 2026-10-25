import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/content/PageHeader';
import { EmptyState, TripCard } from '@/components/content/Cards';
import Pagination from '@/components/content/Pagination';
import { publicApi } from '@/lib/api';
import { flagEmoji } from '@/lib/format';

export const revalidate = 60; // seconds; keep in sync with REVALIDATE_SECONDS

export const metadata: Metadata = {
  title: 'Trips',
  description: 'Travel notes and photo journals — Japan, Malaysia and wherever the road goes next.',
  alternates: { canonical: '/trips' },
};

const PAGE_SIZE = 12;

export default async function TripsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const { items, total } = await publicApi.trips(page, PAGE_SIZE);
  if (total === 0 && page === 1) notFound(); // hidden until the first trip
  const countries = [...new Set(items.map((t) => t.countryCode).filter(Boolean))];

  return (
    <>
      <PageHeader
        eyebrow="Travel journal"
        title={
          <>
            Places I&apos;ve <span className="text-gradient">wandered</span>
          </>
        }
        description="Photo journals and notes from trips — what I ate, where I got lost, and what stuck with me."
        orb="purple"
      >
        {countries.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-gray-300">
              {total} {total === 1 ? 'trip' : 'trips'}
            </span>
            {countries.map((c) => (
              <span key={c} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-gray-300">
                {flagEmoji(c)} {c}
              </span>
            ))}
          </div>
        )}
      </PageHeader>

      <section className="mx-auto max-w-6xl px-6 pb-28">
        {items.length === 0 ? (
          <EmptyState title="No trips yet" description="The first travel journal is being written. Check back soon." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((trip, i) => (
              <TripCard key={trip.id} trip={trip} priority={i < 3} />
            ))}
          </div>
        )}
        <Pagination page={page} total={total} pageSize={PAGE_SIZE} href={(p) => `/trips?page=${p}`} />
      </section>
    </>
  );
}
