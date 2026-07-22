import { useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useFloating,
  offset,
  flip,
  shift,
  size,
  autoUpdate,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
} from '@floating-ui/react';
import { useChatStore } from '../app/store';
import { SCRIM_FADE } from '@curio/core';
import { useDescribe } from '../lookup/useDescribe';
import DescriptionBody, { POPOVER_CLASS } from './DescriptionBody';
import DescribeModal from './DescribeModal';

/** Sticky composer height reserved at the bottom so the popover never opens over it. */
const COMPOSER_HEIGHT = 80;
/** Viewport padding for flip/shift/size — 12px on three sides, composer clearance below. */
const PADDING = { top: 12, right: 12, bottom: COMPOSER_HEIGHT + 12, left: 12 };
/** Never shrink the popover below this, even in tight vertical space. */
const MIN_HEIGHT = 96;

/**
 * Describes the open word or phrase. Anchored to the LIVE DOM (the word element, or a
 * Range for a phrase) so the popover FOLLOWS the text on scroll. The open word stays
 * highlighted. Reuses useDescribe, so words and phrases are cached the same way.
 */
export default function SelectionPopover() {
  const selection = useChatStore((s) => s.selection);
  const setSelection = useChatStore((s) => s.setSelection);
  const expanded = useChatStore((s) => s.expanded);
  const setExpanded = useChatStore((s) => s.setExpanded);
  // Stable so DescribeModal's focus effect doesn't re-run on every streamed gloss token
  // (which would yank focus back to the close button and lose the return target).
  const collapse = useCallback(() => setExpanded(false), [setExpanded]);

  const { refs, floatingStyles, context, isPositioned } = useFloating({
    open: true,
    onOpenChange: (open) => {
      if (!open) setSelection(null);
    },
    // Prefer below the word, but flip above when there's no room — so a word near the
    // bottom never opens over the sticky composer. `padding` keeps the popover clear of
    // the viewport edges, and a taller bottom padding reserves room for the composer
    // (~80px) so flip/shift/size all treat that band as unavailable space.
    placement: 'bottom',
    middleware: [
      offset(6),
      flip({ padding: PADDING }),
      shift({ padding: PADDING }),
      size({
        padding: PADDING,
        apply({ availableHeight, elements }) {
          // Cap the popover to the space that's actually free; content scrolls if taller.
          elements.floating.style.maxHeight = `${Math.max(MIN_HEIGHT, Math.round(availableHeight))}px`;
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  // While the modal is open the popover must not self-dismiss: a click on the scrim should
  // shrink back to the popover, not clear the whole selection.
  const dismiss = useDismiss(context, { enabled: !expanded });
  const role = useRole(context, { role: 'tooltip' });
  const { getFloatingProps } = useInteractions([dismiss, role]);

  // Anchor to the live element (word) or range (phrase) so scrolling keeps it in place.
  useEffect(() => {
    if (!selection) return;
    if (selection.el) {
      refs.setReference(selection.el);
      return;
    }
    if (selection.range) {
      const range = selection.range;
      refs.setReference({
        getBoundingClientRect: () => range.getBoundingClientRect(),
        contextElement: selection.block ?? undefined,
      });
    }
  }, [selection, refs]);

  // Keep the clicked word highlighted (accent) while its description is open.
  useEffect(() => {
    const el = selection?.el;
    if (!el) return;
    el.classList.add('entity-open');
    return () => el.classList.remove('entity-open');
  }, [selection]);

  // The selected phrase gets a soft, rounded band drawn by PhraseHighlight (mounted in
  // ChatView) — the CSS Custom Highlight API can't do padding or border-radius.

  // Hook must run every render; it no-ops when there is no active selection.
  const entry = useDescribe(
    Boolean(selection),
    selection?.messageId ?? '',
    selection?.text ?? '',
    selection?.context ?? '',
  );

  if (!selection) return null;

  return (
    <>
      {/* Small popover (the "vistazo"). Stays mounted while the modal is open so it's still
          there when the modal closes. It fades/rises in via the .curio-popover CSS animation. */}
      <FloatingPortal>
        <div
          ref={refs.setFloating}
          // Hide until Floating UI has an actual computed position — otherwise the first
          // frame (or a mis-timed re-anchor, e.g. after switching mode and back) can paint
          // the popover at the viewport's top-left corner before it snaps to the word.
          style={{ ...floatingStyles, visibility: isPositioned ? 'visible' : 'hidden' }}
          className="z-50"
          {...getFloatingProps()}
        >
          {!expanded && (
            <div className={POPOVER_CLASS}>
              <DescriptionBody entry={entry} />
              {/* "Ver más" only once the gloss is ready — showing it over the loading dots
                  (nothing to expand yet) reads as broken. Hidden while loading and on error. */}
              {entry?.status === 'done' && (
                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  className="mt-2 text-xs font-medium text-accent transition-colors hover:text-accent-hover hover:underline"
                >
                  Ver más
                </button>
              )}
            </div>
          )}
        </div>
      </FloatingPortal>

      {/* Flat scrim (a dim, never a shadow — DESIGN §5). Fades on its own so the card can
          morph cleanly underneath. Clicking it shrinks back to the popover. */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="curio-scrim"
            className="curio-scrim"
            onClick={collapse}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={SCRIM_FADE}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Modal card — mounted/unmounted instantly (not inside AnimatePresence) so the
          layoutId is unique on every commit and the morph both ways stays clean. */}
      {expanded && (
        <DescribeModal
          title={selection.text}
          messageId={selection.messageId}
          context={selection.context}
          glossText={entry?.text ?? ''}
          onClose={collapse}
        />
      )}
    </>
  );
}
