export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-28 pt-40" aria-busy="true" aria-label="Loading">
      <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
      <div className="mt-6 h-14 w-2/3 animate-pulse rounded-xl bg-white/10" />
      <div className="mt-4 h-5 w-1/2 animate-pulse rounded bg-white/5" />
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03]">
            <div className="aspect-[16/10] animate-pulse bg-white/5" />
            <div className="space-y-3 p-5">
              <div className="h-3 w-1/3 animate-pulse rounded bg-white/10" />
              <div className="h-5 w-3/4 animate-pulse rounded bg-white/10" />
              <div className="h-3 w-full animate-pulse rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
