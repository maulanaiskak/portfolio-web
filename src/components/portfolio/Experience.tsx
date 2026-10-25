'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, useInView } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';
import type { SceneVariant } from '@/components/effects/MiniScene';
import type { Experience as ExperienceItem } from '@/types';
import SectionHeading from './SectionHeading';

const MiniScene = dynamic(() => import('@/components/effects/MiniScene'), { ssr: false });

const EXP_SCENES: { variant: SceneVariant; color: string }[] = [
  { variant: 'multiChain', color: '#00d4ff' },
  { variant: 'dataPipeline', color: '#7c3aed' },
  { variant: 'alertNetwork', color: '#f59e0b' },
  { variant: 'neuralCloud', color: '#10b981' },
];

function ExperienceCard({ exp, index }: { exp: ExperienceItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const isLeft = index % 2 === 0;
  const scene = EXP_SCENES[index % EXP_SCENES.length];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex flex-col gap-8 md:flex-row ${isLeft ? '' : 'md:flex-row-reverse'}`}
    >
      <div className="absolute left-4 mt-7 h-3 w-3 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_12px_#00d4ff] md:left-1/2" aria-hidden />

      <div className="hidden items-center justify-center md:flex md:w-1/2" aria-hidden>
        {inView && (
          <div className="h-80 w-full">
            <MiniScene variant={scene.variant} color={scene.color} className="h-full w-full" />
          </div>
        )}
      </div>

      <div className="ml-10 md:ml-0 md:w-1/2">
        <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors duration-300 hover:border-accent/30">
          <header className="mb-4">
            <h3 className="text-xl font-bold text-white">{exp.position}</h3>
            <p className="font-semibold text-accent">{exp.company}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <MapPin size={13} aria-hidden /> {exp.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={13} aria-hidden /> {exp.period}
              </span>
            </div>
          </header>

          {exp.responsibilities.map((r, i) => (
            <div key={i} className="mb-4 rounded-xl bg-white/[0.04] p-3">
              {r.period && <span className="font-mono text-xs text-accent">{r.period}</span>}
              <p className="mt-1 text-sm text-gray-300">{r.description}</p>
            </div>
          ))}

          <ul className="mb-5 space-y-2">
            {exp.projectsAndAchievements.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-gray-400">
                <span className="mt-0.5 shrink-0 text-accent" aria-hidden>
                  ▸
                </span>
                <span>{a}</span>
              </li>
            ))}
          </ul>

          <ul className="flex flex-wrap gap-2" aria-label="Technologies">
            {exp.tech.map((t) => (
              <li key={t} className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 text-xs text-accent">
                {t}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </motion.div>
  );
}

export default function Experience({ experiences }: { experiences: ExperienceItem[] }) {
  if (experiences.length === 0) return null;
  return (
    <section id="experience" className="bg-surface py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow="My journey" title="Experience" />
        <div className="relative">
          <div className="absolute bottom-0 left-4 top-0 w-px -translate-x-1/2 bg-gradient-to-b from-accent/40 via-white/10 to-transparent md:left-1/2" aria-hidden />
          <div className="space-y-14">
            {experiences.map((exp, index) => (
              <ExperienceCard key={exp.id ?? index} exp={exp} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
