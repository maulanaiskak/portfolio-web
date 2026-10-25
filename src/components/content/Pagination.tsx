import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  page,
  total,
  pageSize,
  href,
}: {
  page: number;
  total: number;
  pageSize: number;
  href: (page: number) => string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;

  const btn = 'inline-flex h-10 min-w-10 items-center justify-center gap-1 rounded-full border px-3 text-sm transition-colors';
  return (
    <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={href(page - 1)} className={`${btn} border-white/10 text-gray-300 hover:border-accent/40 hover:text-white`} rel="prev">
          <ChevronLeft size={16} /> Prev
        </Link>
      ) : (
        <span className={`${btn} border-white/5 text-gray-700`} aria-disabled>
          <ChevronLeft size={16} /> Prev
        </span>
      )}
      <span className="px-3 text-sm tabular-nums text-gray-500">
        {page} / {pages}
      </span>
      {page < pages ? (
        <Link href={href(page + 1)} className={`${btn} border-white/10 text-gray-300 hover:border-accent/40 hover:text-white`} rel="next">
          Next <ChevronRight size={16} />
        </Link>
      ) : (
        <span className={`${btn} border-white/5 text-gray-700`} aria-disabled>
          Next <ChevronRight size={16} />
        </span>
      )}
    </nav>
  );
}
