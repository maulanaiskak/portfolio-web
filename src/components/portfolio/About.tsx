'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import GradientOrbs from '@/components/effects/GradientOrbs';
import SectionHeading from './SectionHeading';

const STATS = [
  { value: 4, suffix: '+', label: 'Years in fintech & crypto' },
  { value: 5, suffix: 'M', prefix: '~', label: 'Registered users served' },
  { value: 180, suffix: 'K+', label: 'Tokens across 4 chains' },
  { text: 'GCP Pro', label: 'Cloud Architect certified' },
] as const;

function AnimatedCounter({ target, inView }: { target: number; inView: boolean }) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const duration = 1400;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);

  return <>{count}</>;
}

export default function About() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="about" className="relative overflow-hidden py-28">
      <GradientOrbs variant="cyan" />
      <div className="relative z-10 mx-auto max-w-6xl px-6" ref={ref}>
        <SectionHeading eyebrow="Get to know" title="About me" />

        <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative mx-auto w-full max-w-sm"
          >
            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-accent/30 via-transparent to-violet/30 blur-2xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
              <Image
                src="/profile.jpg"
                alt="Portrait of Maulana Iskak"
                width={720}
                height={960}
                sizes="(min-width: 1024px) 384px, 90vw"
                className="aspect-[4/5] h-auto w-full object-cover"
                priority={false}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-5">
                <p className="font-semibold text-white">Maulana Iskak</p>
                <p className="text-sm text-gray-400">Backend Engineer · Nanovest</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <p className="mb-5 text-lg leading-relaxed text-gray-300">
              I&apos;m a <span className="font-medium text-accent">Backend Engineer</span> at{' '}
              <span className="font-medium text-white">Nanovest</span>, a regulated Indonesian investment platform where
              ~5M users trade US stocks, crypto and gold. I work where correctness matters most: money movement,
              identity, and regulatory reporting.
            </p>
            <p className="mb-5 leading-relaxed text-gray-400">
              Lately that&apos;s meant leading the backend launch of a Web3 swap product across Ethereum, Base, BNB
              Chain and Solana, a regulatory reporting migration at 99.8% success, and a shared maker-checker service
              that cut new approval flows by ~60%. Mostly <span className="text-gray-200">Java / Spring Boot</span> and{' '}
              <span className="text-gray-200">Go</span> on GCP.
            </p>
            <p className="mb-8 leading-relaxed text-gray-400">
              Engineering Physics graduate from <span className="text-gray-200">Universitas Gadjah Mada</span> (cum
              laude) and a <span className="text-gray-200">Google Cloud Professional Cloud Architect</span>. Outside work
              I travel, learn Japanese (JLPT N3), and write about both.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.35 + i * 0.08 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-colors hover:border-accent/40"
                >
                  <div className="mb-1 text-3xl font-bold tabular-nums text-accent">
                    {'value' in stat ? (
                      <>
                        {'prefix' in stat ? stat.prefix : ''}
                        <AnimatedCounter target={stat.value} inView={inView} />
                        {stat.suffix}
                      </>
                    ) : (
                      stat.text
                    )}
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
