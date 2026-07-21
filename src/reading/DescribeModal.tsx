import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FloatingPortal } from '@floating-ui/react';
import { MODAL_MORPH, CONTENT_FADE, SURFACE_LAYOUT_ID } from '../app/motion';
import DescriptionBody from './DescriptionBody';
import type { DescriptionEntry } from '../app/store';

interface DescribeModalProps {
  /** The word or phrase being described — shown as the modal title. */
  title: string;
  entry?: DescriptionEntry;
  /** Shrink back to the popover. */
  onClose: () => void;
}

/**
 * The "ver más" modal: the roomy home for a full description (and, in v1, generative-UI
 * components). It shares `SURFACE_LAYOUT_ID` with the popover, so opening it reads as the
 * small card GROWING into place — a smooth iOS-style morph, never a pop (DESIGN §9).
 *
 * The OBJECT (the card) morphs; the TEXT enters with a clean fade on top, so no text is
 * ever scaled between two sizes (DESIGN §9.3, UI-PREFERENCES §3). The flat scrim behind
 * lives in SelectionPopover so it can fade independently of the morph.
 */
export default function DescribeModal({ title, entry, onClose }: DescribeModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<Element | null>(null);

  // Escape closes; focus moves to the close button on open and returns to the trigger
  // on close (DESIGN §8). Capture phase so Escape reaches us before anything else.
  useEffect(() => {
    returnFocus.current = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      if (returnFocus.current instanceof HTMLElement) returnFocus.current.focus();
    };
  }, [onClose]);

  return (
    <FloatingPortal>
      {/* Centering layer: transparent and click-through; only the card catches clicks,
          so a click anywhere outside it lands on the scrim behind and closes. */}
      <div className="curio-modal-center">
        <motion.div
          layoutId={SURFACE_LAYOUT_ID}
          transition={MODAL_MORPH}
          className="curio-modal-card"
          style={{ borderRadius: 16 }}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          {/* Content is not part of the morph — it fades in on top while the box travels. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={CONTENT_FADE}
            className="flex min-h-0 flex-col"
          >
            <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-3">
              <h2 className="text-lg font-semibold leading-snug text-fg">{title}</h2>
              <button
                ref={closeRef}
                onClick={onClose}
                aria-label="Cerrar"
                className="-mr-1 -mt-0.5 shrink-0 rounded-md p-1 text-xl leading-none text-fg-muted transition-colors hover:text-fg"
              >
                &times;
              </button>
            </header>
            <div className="min-h-0 overflow-y-auto px-5 py-4 text-base leading-relaxed text-fg-secondary">
              <DescriptionBody entry={entry} />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </FloatingPortal>
  );
}
