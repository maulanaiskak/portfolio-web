'use client';

import dynamic from 'next/dynamic';
import { useReducedMotion } from 'framer-motion';
import { useMediaQuery } from '@/lib/hooks';

const CursorTrail = dynamic(() => import('@/components/effects/CursorTrail'), { ssr: false });

/** Decorative cursor trail: only on devices with a fine pointer and when the
 * user hasn't asked for reduced motion. */
export default function Ambient() {
  const reduced = useReducedMotion();
  const finePointer = useMediaQuery('(pointer: fine)');
  if (reduced || !finePointer) return null;
  return <CursorTrail />;
}
