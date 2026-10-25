'use client';

import { useCallback, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import type { SceneVariant } from '@/components/effects/MiniScene';
import type { Project } from '@/types';
import SectionHeading from './SectionHeading';

const MiniScene = dynamic(() => import('@/components/effects/MiniScene'), { ssr: false });

const PROJECT_SCENES: { variant: SceneVariant; color: string }[] = [
  { variant: 'torusknot', color: '#00d4ff' },
  { variant: 'wireSphere', color: '#7c3aed' },
  { variant: 'octahedron', color: '#00d4ff' },
  { variant: 'bars', color: '#10b981' },
  { variant: 'twinBoxes', color: '#f59e0b' },
  { variant: 'icosahedron', color: '#ef4444' },
  { variant: 'organicParticles', color: '#10b981' },
];

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduced = useReducedMotion();
  const scene = PROJECT_SCENES[index % PROJECT_SCENES.length];
  const [hovered, setHovered] = useState(false);

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const card = cardRef.current;
      if (!card || reduced) return;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-2px)`;
      card.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
      card.style.setProperty('--my', `${(y + 0.5) * 100}%`);
    },
    [reduced],
  );

  const onLeave = useCallback(() => {
    if (cardRef.current) cardRef.current.style.transform = '';
    setHovered(false);
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
      className="h-full"
    >
      <article
        ref={cardRef}
        onMouseMove={onMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={onLeave}
        className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition-[border-color,transform] duration-200 hover:border-accent/30"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: 'radial-gradient(400px circle at var(--mx) var(--my), rgba(0,212,255,0.08), transparent 40%)' }}
          aria-hidden
        />
        <div className="relative h-44 bg-[#0a0a0a]" aria-hidden>
          {inView && <MiniScene variant={scene.variant} color={scene.color} className="absolute inset-0" isHovered={hovered} />}
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-transparent to-transparent" />
        </div>

        <div className="relative -mt-10 p-5">
          <h3 className="mb-3 text-lg font-bold leading-snug text-white">{project.title}</h3>
          <p className="mb-4 text-sm leading-relaxed text-gray-400">{project.description}</p>
          <ul className="mb-4 space-y-1.5">
            {project.highlights.slice(0, 3).map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                <span className="mt-0.5 shrink-0 text-accent" aria-hidden>
                  ▸
                </span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
          <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
            {project.technologies.slice(0, 5).map((tech) => (
              <li key={tech} className="rounded-full border border-accent/20 bg-accent/10 px-2 py-0.5 text-[11px] text-accent">
                {tech}
              </li>
            ))}
            {project.technologies.length > 5 && (
              <li className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-gray-500">
                +{project.technologies.length - 5}
              </li>
            )}
          </ul>
        </div>
      </article>
    </motion.div>
  );
}

export default function Projects({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;
  return (
    <section id="projects" className="py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="What I've built"
          title="Selected work"
          description="Production systems from regulated fintech — the problem, the approach, and the numbers that moved."
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <ProjectCard key={project.id ?? project.title} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
