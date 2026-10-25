'use client';

import { motion } from 'framer-motion';

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'center' | 'left';
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`mb-14 ${align === 'center' ? 'mx-auto text-center' : ''} max-w-2xl`}
    >
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">{title}</h2>
      {description && <p className="mt-4 leading-relaxed text-gray-400">{description}</p>}
    </motion.div>
  );
}
