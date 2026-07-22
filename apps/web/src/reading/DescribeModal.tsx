import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FloatingPortal } from '@floating-ui/react';
import { MODAL_IN, CatalogRenderer } from '@curio/core';
import { useGenerative } from '../lookup/useGenerative';
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
 * It opens with a clean uniform scale-up + fade (MODAL_IN) rather than a shared-element morph
 * from the popover: the morph looked jerky and distorted because the popover→modal scale is
 * anisotropic AND the generated content resizes the box a second time when it loads. A uniform
 * scale never distorts and never re-animates layout, so it stays smooth (UI-PREFERENCES §2:
 * suave por encima de todo). The flat scrim behind lives in SelectionPopover.
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
        {/* Clean uniform scale-up + fade (MODAL_IN) — never distorts (uniform scale) and never
            re-animates layout, so it stays smooth even as the generated content loads and the
            box resizes. transformOrigin center so it grows from the middle. */}
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={MODAL_IN}
          className="curio-modal-card"
          style={{ borderRadius: 16, transformOrigin: 'center' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="curio-modal-title"
        >
          <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 py-3">
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
          {/* Flexible, bounded body: fills the card up to its max-height and scrolls only when
              the content genuinely overflows (short answers show no scrollbar). */}
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 text-base leading-relaxed text-fg-secondary">
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
      </div>
    </FloatingPortal>
  );
}
