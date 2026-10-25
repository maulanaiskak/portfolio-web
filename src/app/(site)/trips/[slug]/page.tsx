import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Calendar, Camera, MapPin } from 'lucide-react';
import ArticleShell from '@/components/content/ArticleShell';
import MarkdownRenderer from '@/components/content/MarkdownRenderer';
import Gallery from '@/components/content/Gallery';
import { isNotFound, publicApi } from '@/lib/api';
import { flagEmoji, formatRange, tripDays } from '@/lib/format';
import type { Trip } from '@/types';

export const revalidate = 60; // seconds; keep in sync with REVALIDATE_SECONDS

type Params = { params: Promise<{ slug: string }> };

// Render on first request, then serve from the ISR cache.
export function generateStaticParams() {
  return [];
}

async function load(slug: string): Promise<Trip> {
  try {
    return await publicApi.trip(slug);
  } catch (err) {
    if (isNotFound(err)) notFound();
    throw err;
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  try {
    const trip = await publicApi.trip((await params).slug);
    return {
      title: trip.title,
      description: trip.summary,
      alternates: { canonical: `/trips/${trip.slug}` },
      openGraph: { type: 'article', title: trip.title, description: trip.summary, images: trip.coverImageUrl ? [trip.coverImageUrl] : undefined },
    };
  } catch {
    return { title: 'Trip' };
  }
}

export default async function TripPage({ params }: Params) {
  const trip = await load((await params).slug);
  const days = tripDays(trip.startDate, trip.endDate);

  return (
    <ArticleShell
      back={{ href: '/trips', label: 'All trips' }}
      eyebrow={
        <>
          {flagEmoji(trip.countryCode)} {trip.location || 'Travel journal'}
        </>
      }
      title={trip.title}
      summary={trip.summary}
      cover={trip.coverImageUrl}
      meta={
        <>
          {trip.location && (
            <span className="flex items-center gap-1.5">
              <MapPin size={14} aria-hidden /> {trip.location}
            </span>
          )}
          {trip.startDate && (
            <span className="flex items-center gap-1.5">
              <Calendar size={14} aria-hidden /> {formatRange(trip.startDate, trip.endDate)}
              {days ? ` · ${days} days` : ''}
            </span>
          )}
          {trip.photos.length > 0 && (
            <span className="flex items-center gap-1.5">
              <Camera size={14} aria-hidden /> {trip.photos.length} photos
            </span>
          )}
        </>
      }
      footer={
        trip.photos.length > 0 ? (
          <section aria-labelledby="gallery-heading">
            <h2 id="gallery-heading" className="mb-6 text-2xl font-bold text-white">
              Gallery
            </h2>
            <Gallery photos={trip.photos} title={trip.title} />
          </section>
        ) : undefined
      }
    >
      {trip.bodyMarkdown ? <MarkdownRenderer source={trip.bodyMarkdown} /> : null}
    </ArticleShell>
  );
}
