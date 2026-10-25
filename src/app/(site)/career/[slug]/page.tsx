import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Briefcase, Calendar } from 'lucide-react';
import ArticleShell from '@/components/content/ArticleShell';
import MarkdownRenderer from '@/components/content/MarkdownRenderer';
import { isNotFound, publicApi } from '@/lib/api';
import { formatMonth } from '@/lib/format';
import type { Milestone } from '@/types';

export const revalidate = 60; // seconds; keep in sync with REVALIDATE_SECONDS

type Params = { params: Promise<{ slug: string }> };

// Render on first request, then serve from the ISR cache.
export function generateStaticParams() {
  return [];
}

async function load(slug: string): Promise<Milestone> {
  try {
    return await publicApi.milestone(slug);
  } catch (err) {
    if (isNotFound(err)) notFound();
    throw err;
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  try {
    const m = await publicApi.milestone((await params).slug);
    return {
      title: m.title,
      description: m.summary,
      alternates: { canonical: `/career/${m.slug}` },
      openGraph: { type: 'article', title: m.title, description: m.summary, images: m.coverImageUrl ? [m.coverImageUrl] : undefined },
    };
  } catch {
    return { title: 'Career' };
  }
}

export default async function MilestonePage({ params }: Params) {
  const m = await load((await params).slug);

  return (
    <ArticleShell
      back={{ href: '/career', label: 'Career story' }}
      eyebrow={formatMonth(m.milestoneDate) || 'Career'}
      title={m.title}
      summary={m.summary}
      cover={m.coverImageUrl}
      meta={
        m.role || m.company || m.milestoneDate ? (
          <>
            {(m.role || m.company) && (
              <span className="flex items-center gap-1.5">
                <Briefcase size={14} aria-hidden /> {[m.role, m.company].filter(Boolean).join(' · ')}
              </span>
            )}
            {m.milestoneDate && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} aria-hidden /> {formatMonth(m.milestoneDate)}
              </span>
            )}
          </>
        ) : undefined
      }
    >
      {m.bodyMarkdown ? <MarkdownRenderer source={m.bodyMarkdown} /> : null}
    </ArticleShell>
  );
}
