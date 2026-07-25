import { useEffect, useState } from 'react';
import { AnimatePresence, motion, type Transition } from 'framer-motion';
import { SCRIM_FADE, type OllamaModel } from '@curio/core';
import SettingsContent from './SettingsContent';
import SlidersIcon from './SlidersIcon';

// Improved shared-element transform. A LONE icon flying to the centre felt orphaned; in the video
// what travels is icon + label TOGETHER — a coherent group. So the trigger is a small "⚙ Ajustes"
// chip and that whole group is the shared element (layoutId): on open it flies from the header and
// grows into the dialog's title. The modal box appears on its own (scale + fade, no box-morph, so
// nothing stretches). Framer's layoutId is our GSAP+FLIP.
const TITLE_ID = 'curio-settings-title';
const TITLE_MORPH: Transition = { type: 'spring', bounce: 0, duration: 0.5 };
const DIALOG_IN: Transition = { type: 'spring', bounce: 0, duration: 0.42 };

/**
 * Candidate B (improved) — centered modal opened as a shared-element transform where the icon+label
 * group travels as a unit. Scrim dims the screen; the dialog scales+fades in at the centre while
 * the "⚙ Ajustes" chip flies from the header and becomes the dialog title. Its body fades in on top.
 * Closes on scrim click or Escape, the title flying back to the chip.
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
      {/* Fixed footprint so the header row doesn't shift when the chip flies to the centre. */}
      <div className="flex h-7 w-[92px] items-center justify-end">
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label="Ajustes"
          title="Ajustes"
          onClick={() => setOpen(true)}
          className="flex h-7 items-center gap-1.5 rounded-full px-2 text-xs text-fg-muted transition-colors duration-fast hover:text-fg"
        >
          {/* The icon+label group lives here when closed; when open it flies to the dialog title. */}
          {!open && (
            <motion.span
              layoutId={TITLE_ID}
              transition={TITLE_MORPH}
              className="flex items-center gap-1.5"
            >
              <SlidersIcon size={15} />
              <span className="font-medium">Ajustes</span>
            </motion.span>
          )}
        </button>
      </div>

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
              initial={{ scale: 0.96, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97, y: 6, opacity: 0 }}
              transition={DIALOG_IN}
              style={{ borderRadius: 16 }}
              className="relative z-10 w-80 max-w-[calc(100vw-2rem)] border border-border bg-bg p-5"
            >
              {/* The same group, landed as the title — layoutId animates it here from the chip. */}
              <motion.span
                layoutId={TITLE_ID}
                transition={TITLE_MORPH}
                className="mb-3 flex items-center gap-2 text-fg"
              >
                <SlidersIcon size={17} />
                <span className="text-sm font-semibold tracking-tight">Ajustes</span>
              </motion.span>

              {/* Body fades in on top so it doesn't ride the title's morph. */}
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.24, delay: 0.12 } }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
              >
                <SettingsContent models={models} />
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
