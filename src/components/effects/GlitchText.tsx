'use client';

import { useEffect, useState, useRef } from 'react';

const GLITCH_CHARS = '!@#$%^&*<>/\\|[]{}';

function randomChar() {
  return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
}

function corruptText(text: string) {
  return text
    .split('')
    .map((ch) => (ch !== ' ' && Math.random() < 0.5 ? randomChar() : ch))
    .join('');
}

interface GlitchTextProps {
  children: string;
  className?: string;
}

export default function GlitchText({ children, className }: GlitchTextProps) {
  const [display, setDisplay] = useState(children);
  const [glitching, setGlitching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let frameCount = 0;
    let rafId: number;

    const startGlitch = () => {
      setGlitching(true);
      frameCount = 0;
      const animate = () => {
        frameCount++;
        setDisplay(corruptText(children));
        if (frameCount < 10) {
          rafId = requestAnimationFrame(animate);
        } else {
          setDisplay(children);
          setGlitching(false);
          scheduleNext();
        }
      };
      rafId = requestAnimationFrame(animate);
    };

    const scheduleNext = () => {
      const delay = 4000 + Math.random() * 4000;
      timerRef.current = setTimeout(startGlitch, delay);
    };

    scheduleNext();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      cancelAnimationFrame(rafId);
    };
  }, [children]);

  return (
    <span
      className={className}
      style={{
        position: 'relative',
        display: 'inline-block',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {display}
      {glitching && (
        <>
          <span
            style={{
              position: 'absolute',
              inset: 0,
              clipPath: 'polygon(0 20%, 100% 20%, 100% 40%, 0 40%)',
              transform: 'translateX(-3px)',
              color: '#ff003c',
              pointerEvents: 'none',
              mixBlendMode: 'screen',
            }}
            aria-hidden
          >
            {display}
          </span>
          <span
            style={{
              position: 'absolute',
              inset: 0,
              clipPath: 'polygon(0 60%, 100% 60%, 100% 75%, 0 75%)',
              transform: 'translateX(3px)',
              color: '#00d4ff',
              pointerEvents: 'none',
              mixBlendMode: 'screen',
            }}
            aria-hidden
          >
            {display}
          </span>
        </>
      )}
    </span>
  );
}
