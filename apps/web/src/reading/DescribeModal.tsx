import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FloatingPortal } from '@floating-ui/react';
import { MODAL_MORPH, CONTENT_FADE, SURFACE_LAYOUT_ID } from '@curio/core';
import { useGenerative } from '../lookup/useGenerative';
import { CatalogRenderer } from '@curio/core';
import GenerativeSkeleton from './GenerativeSkeleton';

interface DescribeModalProps {
  /** The word or phrase being described — shown as the modal title. */
  title: string;
  messageId: string;
  /** The block/sentence the term sits in (context for generation). */
  context: string;
  /** Plain gloss already shown in the popover; the fallback when no richer component fits. */
  glossText: string;
  /** Shrink back to the popover. */
  onClose: () => void;
}

/**
 * The "ver más" modal: the roomy home for a full description — in v1, a generative-UI
 * component chosen and filled by the model (with a plain-text fallback). It shares
 * `SURFACE_LAYOUT_ID` with the popover, so opening it reads as the small card GROWING into
 * place — a smooth iOS-style morph, never a pop (DESIGN §9).
 *
 * The card morphs and its content travels with it, but the content is counter-scaled
 * (layout="position") so the card's non-uniform scale never stretches the text — the object
 * morphs, the text just rides along crisp and fades in (DESIGN §9.3, UI-PREFERENCES §3). The
 * flat scrim behind lives in SelectionPopover so it can fade independently of the morph.
 */
const FOCUSABLE = 'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])';

export default function DescribeModal({
  title,
  messageId,
  context,
  glossText,
  onClose,
}: DescribeModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<Element | null>(null);

  // The modal being mounted means it's open; generate the rich component now (lazy).
  const gen = useGenerative(true, messageId, title, context, glossText);

  // Escape closes; focus moves to the close button on open and returns to the trigger on
  // close; Tab is trapped inside the dialog (DESIGN §8). Capture phase so Escape/Tab reach
  // us first. `onClose` is memoized by the caller, so this runs once per open, not per token.
  useEffect(() => {
    returnFocus.current = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      // Focus trap: keep Tab / Shift+Tab cycling within the card, never out to the page.
      const card = cardRef.current;
      if (!card) return;
      const items = Array.from(card.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      );
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !card.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !card.contains(active))) {
        e.preventDefault();
        first.focus();
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
        {/* One card morphs from the popover (shared layoutId). The content is a CHILD with
            layout="position", so Framer counter-scales it every frame: it travels WITH the card
            (coherent morph, not a box sliding in from the side) yet its text is never stretched
            by the card's non-uniform scale. The layout transition MUST match the card's
            (MODAL_MORPH) or the correction desyncs; opacity fades on its own. */}
        <motion.div
          ref={cardRef}
          layoutId={SURFACE_LAYOUT_ID}
          transition={MODAL_MORPH}
          className="curio-modal-card"
          // 16 === --radius-xl; inline so Framer keeps the corners crisp while the card morphs.
          style={{ borderRadius: 16 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="curio-modal-title"
        >
          <motion.div
            layout="position"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ layout: MODAL_MORPH, opacity: CONTENT_FADE }}
            className="flex min-h-0 flex-col"
          >
            <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-3">
              <h2 id="curio-modal-title" className="text-lg font-semibold leading-snug text-fg">
                {title}
              </h2>
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
              {!gen || gen.status === 'loading' ? (
                <GenerativeSkeleton />
              ) : gen.status === 'error' ? (
                <p role="alert" className="text-fg-muted">
                  {gen.error}
                </p>
              ) : gen.envelope ? (
                <CatalogRenderer envelope={gen.envelope} />
              ) : (
                <p className="whitespace-pre-wrap">{glossText}</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </FloatingPortal>
  );
}
