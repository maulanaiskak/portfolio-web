'use client';

import { useEffect } from 'react';

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="eyebrow mb-4">Something broke</p>
        <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">This page couldn&apos;t load.</h1>
        <p className="mx-auto mt-4 max-w-md text-gray-400">The content service may be waking up. Give it a second and try again.</p>
        <button onClick={reset} className="mt-8 rounded-full bg-accent px-6 py-2.5 font-semibold text-background hover:bg-white">
          Try again
        </button>
      </div>
    </div>
  );
}
