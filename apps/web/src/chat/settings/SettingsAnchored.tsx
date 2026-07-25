import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { OllamaModel } from '@curio/core';
import SettingsContent from './SettingsContent';
import SlidersIcon from './SlidersIcon';

/**
 * Candidate A — anchored popover. The trigger icon STAYS put in the header; the panel unfolds just
 * below it and grows out of the top-right corner (scale + downward drop + a short blur that clears)
 * on a bounce-free spring. Nothing disappears — the icon is the anchor the panel hangs from.
 */
export default function SettingsAnchored({ models }: { models: OllamaModel[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Ajustes"
        title="Ajustes"
        onClick={() => setOpen((o) => !o)}
        className={`grid h-7 w-7 place-items-center rounded-full transition-colors duration-fast ${
          open ? 'text-fg' : 'text-fg-muted hover:text-fg'
        }`}
      >
        <SlidersIcon />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.96, y: -8, filter: 'blur(8px)' }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              filter: 'blur(0px)',
              transition: { type: 'spring', bounce: 0, duration: 0.36 },
            }}
            exit={{
              opacity: 0,
              scale: 0.98,
              y: -4,
              filter: 'blur(4px)',
              transition: { duration: 0.13, ease: [0.4, 0, 1, 1] },
            }}
            style={{ transformOrigin: 'top right' }}
            className="absolute right-0 top-full z-30 mt-2 w-56 rounded-xl border border-border bg-bg p-3"
          >
            <SettingsContent models={models} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
