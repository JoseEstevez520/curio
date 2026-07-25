import { useEffect, useState } from 'react';
import { AnimatePresence, motion, type Transition } from 'framer-motion';
import { SCRIM_FADE, type OllamaModel } from '@curio/core';
import SettingsContent from './SettingsContent';
import SlidersIcon from './SlidersIcon';

// Shared-element transition (Material Design / srD4vo): the trigger and the centered dialog share
// ONE id, so opening MORPHS the little icon — it travels from the header and grows into the modal
// at the centre of the screen (and shrinks back to the icon on close). Framer's layoutId is our
// GSAP+FLIP. A bounce-free spring, a touch slower than the anchored one since it travels further.
const SURFACE_ID = 'curio-settings-modal-surface';
const MORPH: Transition = { type: 'spring', bounce: 0, duration: 0.5 };

/**
 * Candidate B — centered modal, opened as a shared-element transform. Clicking dims the screen with
 * a flat scrim (never a shadow, §5) while the settings icon itself grows and flies to the centre,
 * becoming the dialog; its contents fade in on top so they don't squash mid-morph. Closes on scrim
 * click or Escape, morphing back into the icon.
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
      {/* Reserve the icon's footprint so the header row doesn't jump when it flies to the centre. */}
      <div className="h-7 w-7">
        <AnimatePresence initial={false}>
          {!open && (
            <motion.button
              layoutId={SURFACE_ID}
              key="trigger"
              type="button"
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-label="Ajustes"
              title="Ajustes"
              onClick={() => setOpen(true)}
              transition={MORPH}
              style={{ borderRadius: 9999 }}
              className="grid h-7 w-7 place-items-center text-fg-muted transition-colors duration-fast hover:text-fg"
            >
              <SlidersIcon />
            </motion.button>
          )}
        </AnimatePresence>
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
              layoutId={SURFACE_ID}
              key="dialog"
              role="dialog"
              aria-modal="true"
              aria-label="Ajustes"
              transition={MORPH}
              style={{ borderRadius: 16 }}
              className="relative z-10 w-80 max-w-[calc(100vw-2rem)] overflow-hidden border border-border bg-bg"
            >
              <motion.div
                initial={{ opacity: 0, filter: 'blur(6px)' }}
                animate={{
                  opacity: 1,
                  filter: 'blur(0px)',
                  transition: { duration: 0.22, delay: 0.12 },
                }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                className="p-5"
              >
                <div className="mb-3 text-sm font-semibold tracking-tight text-fg">Ajustes</div>
                <SettingsContent models={models} />
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
