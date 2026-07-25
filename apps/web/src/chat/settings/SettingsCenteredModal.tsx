import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MODAL_IN, SCRIM_FADE, type OllamaModel } from '@curio/core';
import SettingsContent from './SettingsContent';
import SlidersIcon from './SlidersIcon';

/**
 * Candidate B — centered modal. The trigger icon STAYS put; clicking dims the screen with a flat
 * scrim (never a shadow, §5) and a centered dialog scales+fades in (MODAL_IN). Closes on scrim
 * click or Escape. More of an "event" than a quick tweak, but focused and unmistakable.
 */
export default function SettingsCenteredModal({ models }: { models: OllamaModel[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Ajustes"
        title="Ajustes"
        onClick={() => setOpen(true)}
        className={`grid h-7 w-7 place-items-center rounded-full transition-colors duration-fast ${
          open ? 'text-fg' : 'text-fg-muted hover:text-fg'
        }`}
      >
        <SlidersIcon />
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 grid place-items-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={SCRIM_FADE}
              onClick={() => setOpen(false)}
              className="absolute inset-0"
              style={{ background: 'var(--color-scrim)' }}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Ajustes"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={MODAL_IN}
              className="relative z-10 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-bg p-5"
            >
              <div className="mb-3 text-sm font-semibold tracking-tight text-fg">Ajustes</div>
              <SettingsContent models={models} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
