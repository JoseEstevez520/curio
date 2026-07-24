import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  /** Stagger offset (s) so a panel's pieces flow in top-to-bottom instead of all at once. */
  delay?: number;
}

/**
 * The shared entrance for a generative panel's pieces: a gentle fade-up on the iOS decelerating
 * curve (register 2, DESIGN §9 "todo fluye a un lugar"). Pieces are revealed together when the
 * reply is complete — staggered by `delay` so they flow top-to-bottom. Honors reduced-motion
 * (no offset, no delay — the piece just appears). Level 3 (SandboxHTML) is never wrapped.
 */
export default function Reveal({ children, delay = 0 }: RevealProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : { duration: 0.34, ease: [0.32, 0.72, 0, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
