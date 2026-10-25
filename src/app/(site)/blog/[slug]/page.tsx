import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Clock } from 'lucide-react';
import ArticleShell from '@/components/content/ArticleShell';
import MarkdownRenderer from '@/components/content/MarkdownRenderer';
import { isNotFound, publicApi } from '@/lib/api';
import { formatDate, SITE_URL } from '@/lib/format';
import { site } from '@/lib/site';
import type { Post } from '@/types';

export const revalidate = 60; // seconds; keep in sync with REVALIDATE_SECONDS

type Params = { params: Promise<{ slug: string }> };

// Render on first request, then serve from the ISR cache.
export function generateStaticParams() {
  return [];
}

async function load(slug: string): Promise<Post> {
  try {
    return await publicApi.post(slug);
  } catch (err) {
    if (isNotFound(err)) notFound();
    throw err;
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  try {
    const post = await publicApi.post((await params).slug);
    return {
      title: post.title,
      description: post.summary,
      keywords: post.tags,
      alternates: { canonical: `/blog/${post.slug}` },
      openGraph: {
        type: 'article',
        title: post.title,
        description: post.summary,
        publishedTime: post.publishedAt ?? undefined,
        modifiedTime: post.updatedAt,
        tags: post.tags,
        images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
      },
    };
  } catch {
    return { title: 'Post' };
  }
}

export default async function PostPage({ params }: Params) {
  const post = await load((await params).slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { '@type': 'Person', name: site.name, url: SITE_URL },
    image: post.coverImageUrl || undefined,
    keywords: post.tags.join(', '),
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };

  return (
    <ArticleShell
      back={{ href: '/blog', label: 'All posts' }}
      eyebrow={post.tags[0] ? `#${post.tags[0]}` : 'Journal'}
      title={post.title}
      summary={post.summary}
      cover={post.coverImageUrl}
      meta={
        <>
          {post.publishedAt && (
            <span className="flex items-center gap-1.5">
              <Calendar size={14} aria-hidden /> <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock size={14} aria-hidden /> {post.readMinutes} min read
          </span>
        </>
      }
      footer={
        post.tags.length > 0 ? (
          <div className="mx-auto flex max-w-3xl flex-wrap gap-2 border-t border-white/5 pt-8">
            {post.tags.map((t) => (
              <Link key={t} href={`/blog?tag=${t}`} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-gray-400 hover:border-accent/40 hover:text-white">
                #{t}
              </Link>
            ))}
          </div>
        ) : undefined
      }
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <MarkdownRenderer source={post.bodyMarkdown} />
    </ArticleShell>
  );
}
