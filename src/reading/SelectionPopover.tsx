import { useEffect } from 'react';
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
import { useDescribe } from '../lookup/useDescribe';
import DescriptionBody, { POPOVER_CLASS } from './DescriptionBody';

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

  const { refs, floatingStyles, context } = useFloating({
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

  const dismiss = useDismiss(context);
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
    <FloatingPortal>
      <div
        ref={refs.setFloating}
        style={floatingStyles}
        className={POPOVER_CLASS}
        {...getFloatingProps()}
      >
        <DescriptionBody entry={entry} />
      </div>
    </FloatingPortal>
  );
}
