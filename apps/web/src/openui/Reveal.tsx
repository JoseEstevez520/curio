import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * SPIKE (exp/openui) — the shared entrance for a generative panel's pieces. Each top-level
 * component fades up gently as it lands (and, during streaming, they arrive one by one — so
 * the panel reveals itself in sequence instead of popping in as a block). Same iOS decelerating
 * curve as the rest of Curio's motion, so a composed answer feels choreographed like the
 * hand-made UI. Level 3 (SandboxHTML) is NOT wrapped — its iframe runs its own animation.
 */
export default function Reveal({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, ease: [0.32, 0.72, 0, 1] }}
    >
      {children}
    </motion.div>
  );
}
