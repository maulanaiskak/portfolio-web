'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, useInView } from 'framer-motion';
import { Calendar, ExternalLink, GraduationCap, MapPin } from 'lucide-react';
import type { Education as EducationItem } from '@/types';
import SectionHeading from './SectionHeading';

const MiniScene = dynamic(() => import('@/components/effects/MiniScene'), { ssr: false });

export default function Education({ education }: { education: EducationItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  if (education.length === 0) return null;

  return (
    <section id="education" className="py-28">
      <div className="mx-auto max-w-4xl px-6" ref={ref}>
        <SectionHeading eyebrow="Academic background" title="Education" />
        <div className="space-y-6">
          {education.map((edu, index) => (
            <motion.article
              key={edu.id ?? index}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors duration-300 hover:border-accent/30 md:p-8"
            >
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 rounded-xl border border-accent/20 bg-accent/10 p-3">
                    <GraduationCap className="text-accent" size={22} aria-hidden />
                  </div>
                  <div>
                    <h3 className="mb-1 text-xl font-bold text-white">{edu.degree}</h3>
                    <p className="mb-3 font-semibold text-accent">{edu.institution}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={13} aria-hidden /> {edu.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} aria-hidden /> {edu.period}
                      </span>
                    </div>
                  </div>
                </div>
                {edu.gpa && (
                  <div className="shrink-0 md:text-right">
                    <div className="text-2xl font-bold text-accent">{edu.gpa}</div>
                    <div className="mt-0.5 text-xs uppercase tracking-wider text-gray-500">GPA</div>
                  </div>
                )}
              </div>

              {edu.thesis && (
                <div className="rounded-xl border border-white/5 bg-white/[0.04] p-5">
                  <h4 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-500">Thesis</h4>
                  <div className="flex flex-col items-center gap-6 md:flex-row">
                    <div className="h-36 w-full shrink-0 overflow-hidden rounded-lg bg-[#0a0a0a] md:w-72" aria-hidden>
                      {inView && <MiniScene variant="thesisSignal" color="#00d4ff" className="h-full w-full" isHovered={false} />}
                    </div>
                    <div>
                      <p className="mb-3 text-sm leading-relaxed text-gray-300">{edu.thesis}</p>
                      {edu.thesis_link && (
                        <a
                          href={edu.thesis_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
                        >
                          <ExternalLink size={13} aria-hidden /> View thesis
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
