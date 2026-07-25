import { useEffect, useState } from 'react';
import { AnimatePresence, motion, type Transition } from 'framer-motion';
import { SCRIM_FADE, type OllamaModel } from '@curio/core';
import SettingsContent from './SettingsContent';
import SlidersIcon from './SlidersIcon';

// No shared-element travel here: the trigger sits in the corner and the dialog is centred, so any
// morph has to cross half the screen — a long diagonal that reads as awkward however clean the
// FLIP is. Shared-element transforms only feel right when origin and destination are close. So the
// dialog just APPEARS: a subtle scale from its own centre + fade behind a flat scrim. Crisp, calm,
// no odd journey.
const DIALOG_IN: Transition = { type: 'spring', bounce: 0, duration: 0.34 };

/**
 * Candidate B — a plain centered modal. Clicking dims the screen with a flat scrim (never a shadow,
 * §5) and the dialog scales + fades into the centre. Closes on scrim click or Escape.
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
              initial={{ opacity: 0, scale: 0.95, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 4 }}
              transition={DIALOG_IN}
              className="relative z-10 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-bg p-5"
            >
              <div className="mb-3 flex items-center gap-2 text-fg">
                <SlidersIcon size={17} />
                <span className="text-sm font-semibold tracking-tight">Ajustes</span>
              </div>
              <SettingsContent models={models} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
