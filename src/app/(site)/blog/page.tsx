import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/content/PageHeader';
import { EmptyState, PostCard } from '@/components/content/Cards';
import Pagination from '@/components/content/Pagination';
import { publicApi, safe } from '@/lib/api';

export const revalidate = 60; // seconds; keep in sync with REVALIDATE_SECONDS

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Writing on backend engineering, distributed systems, career and life.',
  alternates: { canonical: '/blog' },
};

const PAGE_SIZE = 9;

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ page?: string; tag?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const tag = (sp.tag ?? '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30);

  const [{ items, total }, tags] = await Promise.all([publicApi.posts(page, PAGE_SIZE, tag || undefined), safe(publicApi.tags, [])]);
  if (total === 0 && !tag && page === 1) notFound(); // hidden until the first post

  const [featured, ...rest] = page === 1 && !tag ? items : [undefined, ...items];

  const chip = (active: boolean) =>
    `rounded-full px-3.5 py-1.5 text-sm transition-colors ${
      active ? 'bg-accent font-semibold text-background' : 'border border-white/10 bg-white/5 text-gray-400 hover:text-white'
    }`;

  return (
    <>
      <PageHeader
        eyebrow="Journal"
        title={
          <>
            Notes, essays &amp; <span className="text-gradient">lessons</span>
          </>
        }
        description="Backend engineering deep dives, career reflections and the occasional life update."
      >
        {tags.length > 0 && (
          <nav aria-label="Filter by tag" className="mt-8 flex flex-wrap gap-2">
            <Link href="/blog" className={chip(!tag)} aria-current={!tag ? 'page' : undefined}>
              All
            </Link>
            {tags.map((t) => (
              <Link key={t.tag} href={`/blog?tag=${t.tag}`} className={chip(tag === t.tag)} aria-current={tag === t.tag ? 'page' : undefined}>
                #{t.tag} <span className="opacity-60">{t.count}</span>
              </Link>
            ))}
          </nav>
        )}
      </PageHeader>

      <section className="mx-auto max-w-6xl px-6 pb-28">
        {items.length === 0 ? (
          <EmptyState
            title={tag ? `Nothing tagged #${tag}` : 'No posts yet'}
            description={tag ? 'Try another tag, or browse everything.' : 'The first post is on its way.'}
          />
        ) : (
          <>
            {featured && (
              <div className="mb-6">
                <PostCard post={featured} featured />
              </div>
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.filter(Boolean).map((post) => (
                <PostCard key={post!.id} post={post!} />
              ))}
            </div>
          </>
        )}
        <Pagination
          page={page}
          total={total}
          pageSize={PAGE_SIZE}
          href={(p) => `/blog?${new URLSearchParams({ page: String(p), ...(tag ? { tag } : {}) })}`}
        />
      </section>
    </>
  );
}
