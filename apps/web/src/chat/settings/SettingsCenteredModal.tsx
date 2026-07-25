import { useEffect, useState } from 'react';
import { AnimatePresence, motion, type Transition } from 'framer-motion';
import { SCRIM_FADE, type OllamaModel } from '@curio/core';
import SettingsContent from './SettingsContent';
import SlidersIcon from './SlidersIcon';

// The CLEAN shared-element recipe (Material Design / srD4vo's data-shared-item, confirmed against
// Motion's shared-layout docs + Maxime Heckel's layout-animation pitfalls): DON'T morph the whole
// box — a 28px button stretched into a 320px modal distorts because the aspect ratio changes too
// much. Instead the modal appears on its own (subtle scale + fade, never stretched), and only the
// small ICON is shared: it travels from the header into the modal's title, its real position
// animating via layoutId (our GSAP+FLIP). That's the "el icono transiciona hacia su posición
// final" from the video, without the ugly box-morph.
const ICON_ID = 'curio-settings-icon';
const ICON_MORPH: Transition = { type: 'spring', bounce: 0, duration: 0.5 };
const DIALOG_IN: Transition = { type: 'spring', bounce: 0, duration: 0.4 };

/**
 * Candidate B — centered modal, opened as a shared-element transform done right. Clicking dims the
 * screen with a flat scrim (never a shadow, §5); the dialog scales+fades in at the centre while the
 * settings icon flies from the header into the dialog's title. Closes on scrim click or Escape,
 * the icon flying back.
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
        className="grid h-7 w-7 place-items-center rounded-full text-fg-muted transition-colors duration-fast hover:text-fg"
      >
        {/* The icon lives here when closed; when open it flies into the dialog title (same id). */}
        {!open && (
          <motion.span layoutId={ICON_ID} transition={ICON_MORPH} className="grid place-items-center">
            <SlidersIcon />
          </motion.span>
        )}
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
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 6 }}
              transition={DIALOG_IN}
              style={{ borderRadius: 16 }}
              className="relative z-10 w-80 max-w-[calc(100vw-2rem)] border border-border bg-bg p-5"
            >
              <div className="mb-3 flex items-center gap-2">
                {/* The same icon, now landed in the title — layoutId animates it here from the header. */}
                <motion.span
                  layoutId={ICON_ID}
                  transition={ICON_MORPH}
                  className="grid place-items-center text-fg-muted"
                >
                  <SlidersIcon />
                </motion.span>
                <span className="text-sm font-semibold tracking-tight text-fg">Ajustes</span>
              </div>
              <SettingsContent models={models} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
