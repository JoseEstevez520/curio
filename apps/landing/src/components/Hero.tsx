import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { GitHubIcon } from './GitHubIcon';
import { smoothScrollTo } from '../lib/motion';

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  // Parallax: the blobs drift slower than scroll, the mascot slower still — depth from layers
  // moving at different speeds, not from a shadow. Disabled outright under reduced-motion.
  const yBlobs = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, 120]);
  const yMascot = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, 60]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-5 text-center"
    >
      <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ y: yBlobs }}>
        <div className="absolute -left-40 top-8 h-[440px] w-[440px] rounded-full bg-[#3b82f6] opacity-[0.10] blur-[110px]" />
        <div className="absolute -right-24 top-1/3 h-[300px] w-[300px] rounded-full bg-[var(--color-curio)] opacity-[0.08] blur-[90px]" />
      </motion.div>
      <motion.div style={{ opacity }} className="flex flex-col items-center">
        <motion.img
          src="/media/curio.png"
          alt="Curio's mascot, a blue blob with eyes"
          className="relative mb-6 h-24 w-24 animate-breathe"
          style={{ y: yMascot }}
        />
        <p className="relative mb-4 text-sm text-fg-muted">
          <s className="text-fg-faint">Curiosity killed the cat.</s>{' '}
          <strong className="font-medium text-fg-secondary">Curio rewards it.</strong>
        </p>
        <h1 className="relative mb-5 max-w-[22ch] text-4xl font-bold leading-tight tracking-tight text-fg">
          Every word can be a link back.
        </h1>
        <p className="relative mb-8 max-w-[40ch] text-lg text-fg-secondary">
          Read. Get curious about a word. Click it. The answer appears right there, in context.
          No tab, no search, no leaving.
        </p>
        <div className="relative flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://github.com/JoseEstevez520/curio"
            className="flex items-center gap-2 rounded-sm bg-[linear-gradient(180deg,#3b82f6,var(--color-accent))] px-5 py-[0.6em] text-[0.9375rem] font-medium text-accent-fg transition-transform hover:bg-[linear-gradient(180deg,#2f6fe0,var(--color-accent-hover))] active:scale-[0.98]"
          >
            <GitHubIcon className="h-4 w-4" />
            View on GitHub
          </a>
          <a
            href="#how"
            onClick={(e) => {
              e.preventDefault();
              smoothScrollTo('how');
            }}
            className="rounded-sm border border-border-strong px-5 py-[0.6em] text-[0.9375rem] font-medium text-fg transition-transform transition-colors hover:border-fg-muted active:scale-[0.98]"
          >
            See how it works
          </a>
        </div>
      </motion.div>
    </section>
  );
}
