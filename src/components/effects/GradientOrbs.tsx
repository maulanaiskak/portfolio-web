'use client';

import { motion } from 'framer-motion';

type OrbVariant = 'cyan' | 'purple' | 'amber';

const ORB_CONFIGS: Record<OrbVariant, { color: string; orbs: { x: string; y: string; size: string }[] }> = {
  cyan: {
    color: 'rgba(0,212,255,0.12)',
    orbs: [
      { x: '-10%', y: '20%', size: '380px' },
      { x: '70%',  y: '60%', size: '280px' },
    ],
  },
  purple: {
    color: 'rgba(124,58,237,0.12)',
    orbs: [
      { x: '60%',  y: '-10%', size: '340px' },
      { x: '-5%',  y: '55%',  size: '260px' },
    ],
  },
  amber: {
    color: 'rgba(245,158,11,0.10)',
    orbs: [
      { x: '40%',  y: '10%',  size: '300px' },
      { x: '-15%', y: '40%',  size: '240px' },
    ],
  },
};

interface GradientOrbsProps {
  variant?: OrbVariant;
}

export default function GradientOrbs({ variant = 'cyan' }: GradientOrbsProps) {
  const config = ORB_CONFIGS[variant];
  return (
    <>
      {config.orbs.map((orb, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            borderRadius: '50%',
            background: config.color,
            filter: 'blur(80px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 30, 0],
          }}
          transition={{
            duration: 12 + i * 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 2,
          }}
        />
      ))}
    </>
  );
}
