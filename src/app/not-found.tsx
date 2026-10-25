import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="eyebrow mb-4">404</p>
        <h1 className="text-5xl font-bold tracking-tight text-white md:text-6xl">Lost the trail.</h1>
        <p className="mx-auto mt-4 max-w-md text-gray-400">That page doesn&apos;t exist, or it hasn&apos;t been published yet.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="rounded-full bg-accent px-6 py-2.5 font-semibold text-background hover:bg-white">
            Go home
          </Link>
          <Link href="/blog" className="rounded-full border border-white/15 px-6 py-2.5 font-semibold text-white hover:border-accent/50">
            Read the blog
          </Link>
        </div>
      </div>
    </main>
  );
}
