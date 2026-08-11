import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { EASE_OUT } from '../lib/motion';

interface RevealProps {
  children: ReactNode;
  /** Stagger index — each step adds a small delay so grids cascade in rather than pop at once. */
  index?: number;
  className?: string;
}

/**
 * Fades and rises into place once, the first time it enters the viewport. Never starts from
 * scale(0) or fully invisible-and-static — a small translateY reads as settling, not appearing.
 * Respects prefers-reduced-motion by skipping the transform entirely.
 */
export function Reveal({ children, index = 0, className }: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: EASE_OUT, delay: index * 0.07 }}
    >
      {children}
    </motion.div>
  );
}
