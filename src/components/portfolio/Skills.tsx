'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import type { SkillCategory } from '@/types';
import SectionHeading from './SectionHeading';

const RadarChart = dynamic(() => import('@/components/effects/RadarChart'), { ssr: false });

const PALETTE = ['#00d4ff', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#38bdf8', '#a78bfa'];

function isCertifications(category: string) {
  return /certif/i.test(category);
}

export default function Skills({ skills }: { skills: SkillCategory[] }) {
  const [active, setActive] = useState('All');
  if (skills.length === 0) return null;

  const categories = ['All', ...skills.map((s) => s.category)];
  const selected = skills.find((s) => s.category === active);
  const showRadar = !!selected && !isCertifications(selected.category) && selected.items.length >= 3;
  const color = PALETTE[Math.max(0, skills.findIndex((s) => s.category === active)) % PALETTE.length];
  const visible = active === 'All' ? skills : skills.filter((s) => s.category === active);

  return (
    <section id="skills" className="bg-surface py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow="Toolkit" title="Skills" />

        <div role="tablist" aria-label="Skill categories" className="mb-12 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={active === cat}
              onClick={() => setActive(cat)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                active === cat
                  ? 'bg-accent text-background'
                  : 'border border-white/10 bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {showRadar && selected ? (
            <motion.div
              key={active}
              role="tabpanel"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="grid items-center gap-8 md:grid-cols-2"
            >
              <div className="h-72 md:h-96" aria-hidden>
                <RadarChart items={selected.items.map((i) => ({ name: i.name, level: i.level }))} color={color} />
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-white">{selected.category}</h3>
                <ul className="space-y-4">
                  {selected.items.map((item, i) => (
                    <li key={item.name}>
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-gray-300">{item.name}</span>
                          {item.note && <span className="rounded bg-white/5 px-2 py-0.5 text-xs text-gray-500">{item.note}</span>}
                        </div>
                        <span className="text-xs tabular-nums text-gray-600">{item.level}%</span>
                      </div>
                      <div
                        className="h-1.5 w-full overflow-hidden rounded-full bg-white/5"
                        role="meter"
                        aria-valuenow={item.level}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={item.name}
                      >
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${color}, ${color}99)` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${item.level}%` }}
                          transition={{ duration: 0.9, delay: i * 0.06, ease: 'easeOut' }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={active}
              role="tabpanel"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {visible.map((category) => (
                <div
                  key={category.category}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-colors duration-300 hover:border-accent/20"
                >
                  <p className="eyebrow mb-4">{category.category}</p>
                  <ul className="flex flex-wrap gap-2">
                    {category.items.map((item) => {
                      const k = item.level / 100;
                      return (
                        <li key={item.name}>
                          {item.link ? (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-transform hover:scale-105"
                              style={{
                                borderColor: `rgba(0,212,255,${0.3 + k * 0.5})`,
                                backgroundColor: `rgba(0,212,255,${0.05 + k * 0.1})`,
                                color: `rgba(0,212,255,${0.7 + k * 0.3})`,
                              }}
                            >
                              {item.name}
                              {item.note && <span className="opacity-60">· {item.note}</span>}
                              <ExternalLink size={10} aria-hidden />
                            </a>
                          ) : (
                            <span
                              className="inline-block rounded-full border px-3 py-1.5 text-xs font-medium"
                              style={{
                                borderColor: `rgba(255,255,255,${0.06 + k * 0.14})`,
                                backgroundColor: `rgba(255,255,255,${0.02 + k * 0.06})`,
                                color: `rgba(255,255,255,${0.45 + k * 0.5})`,
                              }}
                              title={`${item.level}%${item.note ? ` · ${item.note}` : ''}`}
                            >
                              {item.name}
                              {item.note && <span className="ml-1 opacity-50">· {item.note}</span>}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
