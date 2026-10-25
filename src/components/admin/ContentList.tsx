'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, FileText, Loader2, Plus, Search } from 'lucide-react';
import RemoteImage from '@/components/content/RemoteImage';
import { ApiError } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { ContentStatus, ContentSummary } from '@/types';
import { kinds, type KindKey } from './content-kinds';
import { Button, inputClass, PageTitle, StatusBadge } from './ui';

const PAGE_SIZE = 20;

export default function ContentList({ kind: kindKey }: { kind: KindKey }) {
  const kind = kinds[kindKey];
  const [status, setStatus] = useState<ContentStatus | ''>('');
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [data, setData] = useState<{ items: ContentSummary[]; total: number } | null>(null);
  const [error, setError] = useState('');

  const [reloadKey, setReloadKey] = useState(0);
  const load = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    kind
      .list(page, status)
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setError('');
      })
      .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : 'Failed to load'));
    return () => {
      cancelled = true;
    };
  }, [kind, page, status, reloadKey]);

  const items = (data?.items ?? []).filter((i) => !query || i.title.toLowerCase().includes(query.toLowerCase()));
  const pages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  return (
    <>
      <PageTitle
        title={kind.plural}
        description={data ? `${data.total} total` : undefined}
        actions={
          <Link href={`${kind.adminPath}/new`}>
            <Button variant="primary">
              <Plus size={16} /> New {kind.singular}
            </Button>
          </Link>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex rounded-xl border border-white/10 bg-white/[0.03] p-1" role="tablist" aria-label="Filter by status">
          {(['', 'published', 'draft'] as const).map((s) => (
            <button
              key={s || 'all'}
              role="tab"
              aria-selected={status === s}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${status === s ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
            >
              {s === '' ? 'All' : s === 'published' ? 'Published' : 'Drafts'}
            </button>
          ))}
        </div>
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter this page…" className={`${inputClass} pl-9`} aria-label="Filter by title" />
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-4 flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
          <Button variant="ghost" onClick={load}>
            Retry
          </Button>
        </div>
      )}

      {!data && !error ? (
        <div className="grid place-items-center py-24">
          <Loader2 className="animate-spin text-accent" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center">
          <FileText className="mx-auto mb-3 text-gray-600" />
          <p className="font-medium text-white">No {kind.plural.toLowerCase()} {status ? `(${status})` : ''} yet</p>
          <Link href={`${kind.adminPath}/new`} className="mt-3 inline-block text-sm text-accent hover:underline">
            Create the first one →
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          {items.map((item) => (
            <li key={item.id} className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-white/[0.03]">
              <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-white/5">
                {item.coverImageUrl && <RemoteImage src={item.coverImageUrl} alt="" fill sizes="64px" className="object-cover" />}
              </div>
              <Link href={`${kind.adminPath}/${item.id}`} className="min-w-0 flex-1">
                <p className="truncate font-medium text-white group-hover:text-accent">{item.title}</p>
                <p className="truncate text-xs text-gray-500">
                  /{item.slug} · updated {formatDate(item.updatedAt)}
                  {item.publishedAt ? ` · published ${formatDate(item.publishedAt)}` : ''}
                </p>
              </Link>
              <StatusBadge status={item.status} />
              {item.status === 'published' && (
                <a href={`${kind.publicPath}/${item.slug}`} target="_blank" className="hidden text-gray-500 hover:text-white sm:block" aria-label="View live">
                  <ExternalLink size={16} />
                </a>
              )}
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3 text-sm">
          <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </Button>
          <span className="tabular-nums text-gray-500">
            {page} / {pages}
          </span>
          <Button variant="ghost" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </>
  );
}
