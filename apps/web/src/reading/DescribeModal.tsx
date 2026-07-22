import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FloatingPortal } from '@floating-ui/react';
import { MODAL_IN, CatalogRenderer } from '@curio/core';
import { useDescribe } from '../lookup/useDescribe';
import { useGenerative } from '../lookup/useGenerative';
import DescriptionBody from './DescriptionBody';

interface DescribeModalProps {
  /** The word or phrase the modal opens on (the reader's click). */
  initialTerm: string;
  messageId: string;
  /** The block/sentence the term sits in (context for generation). */
  context: string;
  /** Shrink back to the popover. */
  onClose: () => void;
}

const FOCUSABLE = 'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])';

/**
 * The "ver más" modal: the roomy, richer home for a description. It leads with the short gloss
 * (the "little text"), then — when the term warrants it — a generative-UI component below, and
 * a row of RELATED links to explore next. All of it is PREFETCHED on the word click (see
 * SelectionPopover), so opening the modal shows a ready result, not a spinner.
 *
 * Related links make the modal explorable: clicking one navigates the modal in place to that
 * term (with a one-tap way back to where you started). It opens with a clean uniform scale-up +
 * fade (MODAL_IN) — smooth, never distorting. The flat scrim behind lives in SelectionPopover.
 */
export default function DescribeModal({
  initialTerm,
  messageId,
  context,
  onClose,
}: DescribeModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<Element | null>(null);

  // The term currently shown. Starts at the clicked word; related links navigate it in place.
  const [term, setTerm] = useState(initialTerm);

  // Gloss (the short lead text) + the rich component & related links, both keyed by `term`.
  // The initial term is already prefetched; navigating to a related term fetches on demand.
  const gloss = useDescribe(true, messageId, term, context);
  const gen = useGenerative(true, messageId, term, context, gloss?.text ?? '');
  const related = gen?.related ?? [];
  const showComponent =
    gen?.status === 'done' && gen.envelope && gen.envelope.type !== 'plain-text';

  // Escape closes; focus moves to the close button on open and returns to the trigger on
  // close; Tab is trapped inside the dialog (DESIGN §8). Capture phase so Escape/Tab reach us
  // first. `onClose` is memoized by the caller, so this runs once per open, not per token.
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
      <div className="curio-modal-center">
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
          <header className="flex shrink-0 items-start justify-between gap-3 px-5 pb-1 pt-4">
            <div className="min-w-0">
              {/* One-tap way back to the word you started on, once you've followed a link. */}
              {term !== initialTerm && (
                <button
                  type="button"
                  onClick={() => setTerm(initialTerm)}
                  className="mb-0.5 block truncate text-xs text-fg-muted transition-colors hover:text-fg"
                >
                  ‹ {initialTerm}
                </button>
              )}
              <h2 id="curio-modal-title" className="text-lg font-semibold leading-snug text-fg">
                {term}
              </h2>
            </div>
            <button
              ref={closeRef}
              onClick={onClose}
              aria-label="Cerrar"
              className="-mr-1 -mt-0.5 shrink-0 rounded-md p-1 text-xl leading-none text-fg-muted transition-colors hover:text-fg"
            >
              &times;
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 text-base leading-relaxed text-fg-secondary">
            {/* The "more": the fuller explanation. It shows the short gloss instantly (already
                cached from the popover) as a placeholder, then swaps to the deeper text once the
                prefetch lands — so the modal is never empty and always ends up saying more. */}
            {gen?.deep ? (
              <p className="whitespace-pre-wrap">{gen.deep}</p>
            ) : (
              <DescriptionBody entry={gloss} />
            )}

            {/* A visual only when the term genuinely warrants one (chart, timeline, map…). */}
            {showComponent && gen?.envelope && (
              <div className="mt-5">
                <CatalogRenderer envelope={gen.envelope} />
              </div>
            )}

            {/* Related links — explore next. Clean chip row (clicking navigates the modal to
                that term). Kept simple on purpose — it reads cleaner than a graph here. */}
            {related.length > 0 && (
              <div className="mt-7">
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.03em] text-fg-muted">
                  Relacionado
                </div>
                <div className="flex flex-wrap gap-2">
                  {related.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setTerm(r)}
                      className="rounded-full border border-border px-3 py-1 text-sm text-fg-secondary transition-colors hover:border-border-strong hover:text-accent"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </FloatingPortal>
  );
}
