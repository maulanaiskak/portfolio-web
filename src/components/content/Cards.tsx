import Link from 'next/link';
import { ArrowUpRight, Calendar, Clock, MapPin } from 'lucide-react';
import RemoteImage from './RemoteImage';
import { flagEmoji, formatDate, formatRange, tripDays } from '@/lib/format';
import type { PostSummary, TripSummary } from '@/types';

function Cover({ src, alt, fallback }: { src: string; alt: string; fallback: React.ReactNode }) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-[#0a0a0a]">
      {src ? (
        <RemoteImage
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,rgba(0,212,255,0.15),transparent_60%),radial-gradient(circle_at_80%_80%,rgba(124,58,237,0.15),transparent_60%)]">
          {fallback}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
    </div>
  );
}

export function TripCard({ trip, priority = false }: { trip: TripSummary; priority?: boolean }) {
  const days = tripDays(trip.startDate, trip.endDate);
  return (
    <Link
      href={`/trips/${trip.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_20px_60px_-20px_rgba(0,212,255,0.25)]"
      data-priority={priority || undefined}
    >
      <div className="relative">
        <Cover src={trip.coverImageUrl} alt="" fallback={<span className="text-6xl">{flagEmoji(trip.countryCode) || '✈️'}</span>} />
        {trip.countryCode && (
          <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-background/60 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            {flagEmoji(trip.countryCode)} {trip.countryCode}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
          {trip.location && (
            <span className="flex items-center gap-1">
              <MapPin size={12} aria-hidden /> {trip.location}
            </span>
          )}
          {trip.startDate && (
            <span className="flex items-center gap-1">
              <Calendar size={12} aria-hidden /> {formatRange(trip.startDate, trip.endDate)}
            </span>
          )}
          {days && <span>{days} days</span>}
        </div>
        <h3 className="mb-2 text-lg font-bold leading-snug text-white transition-colors group-hover:text-accent">{trip.title}</h3>
        {trip.summary && <p className="line-clamp-3 text-sm leading-relaxed text-gray-400">{trip.summary}</p>}
      </div>
    </Link>
  );
}

export function PostCard({ post, featured = false }: { post: PostSummary; featured?: boolean }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group flex h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 ${
        featured ? 'flex-col md:flex-row' : 'flex-col'
      }`}
    >
      <div className={featured ? 'md:w-1/2' : ''}>
        <Cover src={post.coverImageUrl} alt="" fallback={<span className="font-mono text-4xl text-accent/60">{'{ }'}</span>} />
      </div>
      <div className={`flex flex-1 flex-col p-5 ${featured ? 'md:justify-center md:p-10' : ''}`}>
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
          {post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>}
          <span className="flex items-center gap-1">
            <Clock size={12} aria-hidden /> {post.readMinutes} min read
          </span>
        </div>
        <h3 className={`mb-2 font-bold leading-snug text-white transition-colors group-hover:text-accent ${featured ? 'text-2xl md:text-3xl' : 'text-lg'}`}>
          {post.title}
        </h3>
        {post.summary && <p className={`text-sm leading-relaxed text-gray-400 ${featured ? '' : 'line-clamp-3'}`}>{post.summary}</p>}
        {post.tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 4).map((t) => (
              <li key={t} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-gray-400">
                #{t}
              </li>
            ))}
          </ul>
        )}
        {featured && (
          <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-accent">
            Read story <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        )}
      </div>
    </Link>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-20 text-center">
      <p className="text-lg font-semibold text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">{description}</p>
    </div>
  );
}
