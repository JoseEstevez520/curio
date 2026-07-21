import { useEffect } from 'react';
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
} from '@floating-ui/react';
import { useChatStore } from '../app/store';
import { useDescribe } from '../lookup/useDescribe';
import DescriptionBody, { POPOVER_CLASS } from './DescriptionBody';

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
    placement: 'bottom',
    middleware: [offset(6), flip(), shift({ padding: 8 })],
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
