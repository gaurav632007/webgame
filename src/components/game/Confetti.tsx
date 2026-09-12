'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const CONFETTI_COLORS = ['#f97316', '#ec4899', '#a855f7', '#3b82f6', '#14b8a6', '#eab308', '#22c55e'];

export function ConfettiBurst({ pieces = 48 }: { pieces?: number }) {
  const reduceMotion = useReducedMotion();
  const parts = useMemo(
    () =>
      Array.from({ length: pieces }).map((_, i) => ({
        id: i,
        left: (i * 37) % 100,
        delay: (i % 12) * 0.08,
        duration: 2 + ((i * 7) % 10) / 8,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 6 + ((i * 13) % 8),
        round: i % 3 === 0,
      })),
    [pieces],
  );
  if (reduceMotion) return null;
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-40" aria-hidden="true">
      {parts.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: '-5vh', x: 0, opacity: 1, rotate: 0 }}
          animate={{ y: '105vh', x: p.id % 2 === 0 ? 60 : -60, opacity: 0.9, rotate: 540 }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          className="absolute top-0"
          style={{ left: `${p.left}%`, width: p.size, height: p.size * (p.round ? 1 : 0.5), backgroundColor: p.color, borderRadius: p.round ? '50%' : 2 }}
        />
      ))}
    </div>
  );
}
