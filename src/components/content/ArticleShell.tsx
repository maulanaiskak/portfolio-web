import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import RemoteImage from './RemoteImage';
import ReadingProgress from './ReadingProgress';

/** Shared layout for long-form detail pages (trip, post, milestone). */
export default function ArticleShell({
  back,
  eyebrow,
  title,
  meta,
  summary,
  cover,
  children,
  footer,
}: {
  back: { href: string; label: string };
  eyebrow?: React.ReactNode;
  title: string;
  meta?: React.ReactNode;
  summary?: string;
  cover?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <article className="pb-24">
      <ReadingProgress />
      <header className="relative overflow-hidden pt-32 md:pt-40">
        <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" aria-hidden />
        <div className="relative mx-auto max-w-3xl px-6">
          <Link href={back.href} className="group mb-8 inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white">
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> {back.label}
          </Link>
          {eyebrow && <div className="eyebrow mb-4">{eyebrow}</div>}
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white md:text-6xl">{title}</h1>
          {summary && <p className="mt-6 text-xl leading-relaxed text-gray-400">{summary}</p>}
          {meta && <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-white/5 py-4 text-sm text-gray-500">{meta}</div>}
        </div>
      </header>

      {cover && (
        <div className="mx-auto mt-10 max-w-5xl px-6">
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <RemoteImage src={cover} alt="" fill priority sizes="(min-width: 1024px) 1024px, 100vw" className="object-cover" />
          </div>
        </div>
      )}

      <div className="mx-auto mt-12 max-w-3xl px-6">{children}</div>
      {footer && <div className="mx-auto mt-16 max-w-5xl px-6">{footer}</div>}
    </article>
  );
}
