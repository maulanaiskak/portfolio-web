'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, Mail, MapPin } from 'lucide-react';
import GlitchText from '@/components/effects/GlitchText';
import { GithubIcon, LinkedinIcon } from '@/components/layout/icons';
import { site } from '@/lib/site';

const ParticleCanvas = dynamic(() => import('@/components/effects/ParticleCanvas'), { ssr: false });

function TypewriterText() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const current = site.roles[roleIndex];
    if (!deleting && displayed.length < current.length) {
      timeoutRef.current = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 80);
    } else if (!deleting && displayed.length === current.length) {
      timeoutRef.current = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && displayed.length > 0) {
      timeoutRef.current = setTimeout(() => setDisplayed(current.slice(0, displayed.length - 1)), 40);
    } else {
      timeoutRef.current = setTimeout(() => {
        setDeleting(false);
        setRoleIndex((prev) => (prev + 1) % site.roles.length);
      }, 300);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [displayed, deleting, roleIndex]);

  return (
    <span className="text-accent" aria-live="off">
      {displayed}
      <span className="animate-pulse" aria-hidden>
        |
      </span>
    </span>
  );
}

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function Hero({ showJournal }: { showJournal: boolean }) {
  const reduced = useReducedMotion();

  return (
    <section id="hero" className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden">
      {!reduced && (
        <div className="absolute inset-0 z-0" aria-hidden>
          <ParticleCanvas />
        </div>
      )}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-background/10 to-background" aria-hidden />
      <div
        className="absolute left-1/2 top-1/3 z-[1] h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 pt-24 text-center">
        <motion.div {...fadeUp(0)} className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-gray-300 backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald" />
          </span>
          Open to relocation abroad · visa sponsorship
        </motion.div>

        <motion.p {...fadeUp(0.05)} className="eyebrow mb-4">
          Hello, I&apos;m
        </motion.p>

        <motion.h1 {...fadeUp(0.1)} className="mb-5 text-5xl font-bold leading-[1.05] tracking-tight text-white md:text-7xl">
          <GlitchText>{site.name}</GlitchText>
        </motion.h1>

        <motion.div {...fadeUp(0.2)} className="mb-8 h-10 text-2xl font-light text-gray-300 md:text-3xl">
          <span className="sr-only">{site.roles.join(', ')}</span>
          <span aria-hidden>
            <TypewriterText />
          </span>
        </motion.div>

        <motion.p {...fadeUp(0.3)} className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-gray-400">
          4+ years building regulated fintech &amp; crypto systems that move real money for ~5M users — on Java,
          Spring Boot and Go, across Google Cloud.
        </motion.p>

        <motion.div {...fadeUp(0.4)} className="mb-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/#projects"
            className="rounded-full bg-accent px-8 py-3 font-semibold text-background shadow-[0_0_40px_-8px] shadow-accent/60 transition-all hover:-translate-y-0.5 hover:bg-white"
          >
            View my work
          </Link>
          {showJournal && (
            <Link
              href="/blog"
              className="rounded-full border border-white/15 bg-white/5 px-8 py-3 font-semibold text-white backdrop-blur transition-all hover:-translate-y-0.5 hover:border-accent/50"
            >
              Read the journal
            </Link>
          )}
        </motion.div>

        <motion.div {...fadeUp(0.5)} className="flex items-center justify-center gap-5 text-gray-400">
          <a href={site.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="transition-colors hover:text-accent">
            <GithubIcon size={22} />
          </a>
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="transition-colors hover:text-accent">
            <LinkedinIcon size={22} />
          </a>
          <a href={`mailto:${site.email}`} aria-label="Email" className="transition-colors hover:text-accent">
            <Mail size={22} />
          </a>
          <span className="h-4 w-px bg-white/10" aria-hidden />
          <span className="flex items-center gap-1.5 text-sm">
            <MapPin size={14} /> Indonesia · Remote
          </span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <Link href="/#about" aria-label="Scroll to about" className="grid h-11 w-7 place-items-start justify-center rounded-full border border-white/15 pt-2">
          <ArrowDown size={14} className="animate-bounce text-gray-400" />
        </Link>
      </motion.div>
    </section>
  );
}
