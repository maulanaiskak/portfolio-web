import Link from 'next/link';
import { Mail } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './icons';
import { NAV, site } from '@/lib/site';

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link href="/" className="text-lg font-bold">
            <span className="text-accent">Maulana</span> Iskak
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-gray-500">
            Backend engineer building money-movement systems by day; writing about trips, career turns and the
            occasional distributed-systems rabbit hole.
          </p>
          <div className="mt-5 flex gap-2">
            {[
              { href: site.github, label: 'GitHub', icon: <GithubIcon size={18} /> },
              { href: site.linkedin, label: 'LinkedIn', icon: <LinkedinIcon size={18} /> },
              { href: `mailto:${site.email}`, label: 'Email', icon: <Mail size={18} /> },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                target={s.href.startsWith('http') ? '_blank' : undefined}
                rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-gray-400 transition-colors hover:border-accent/40 hover:text-accent"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="eyebrow mb-4 !text-gray-500">Explore</p>
          <ul className="grid gap-2 text-sm">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-gray-400 transition-colors hover:text-white">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-4 !text-gray-500">Say hello</p>
          <a href={`mailto:${site.email}`} className="break-all text-sm text-gray-300 hover:text-accent">
            {site.email}
          </a>
          <p className="mt-2 text-sm text-gray-500">{site.location}</p>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-gray-600 sm:flex-row">
          <span>© {new Date().getFullYear()} Maulana Iskak</span>
          <span>Next.js · Go · Postgres · Three.js</span>
        </div>
      </div>
    </footer>
  );
}
