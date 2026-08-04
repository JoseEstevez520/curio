import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  /** Stagger offset (s) so a panel's pieces flow in top-to-bottom instead of all at once. */
  delay?: number;
}

/**
 * The shared entrance for a generative panel's pieces: a gentle fade-up on the decelerating
 * curve (register 2, DESIGN §9 "todo fluye a un lugar"). Pieces are revealed together when the
 * reply is complete — staggered by `delay` so they flow top-to-bottom. Level 3 (SandboxHTML)
 * is never wrapped.
 */
export default function Reveal({ children, delay = 0 }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, ease: [0.32, 0.72, 0, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
