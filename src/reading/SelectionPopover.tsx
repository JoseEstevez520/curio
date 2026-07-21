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
 * Describes a multi-word text SELECTION inside an assistant message. Anchored to the
 * selection's bounding rect via a Floating UI virtual element. Reuses useDescribe, so
 * a selected phrase is cached and explained just like a single word.
 */
export default function SelectionPopover() {
  const selection = useChatStore((s) => s.selection);
  const setSelection = useChatStore((s) => s.setSelection);
  const messages = useChatStore((s) => s.messages);

  const { refs, floatingStyles, context } = useFloating({
    open: true,
    onOpenChange: (open) => {
      if (!open) setSelection(null);
    },
    placement: 'bottom',
    middleware: [offset(6), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const dismiss = useDismiss(context, { ancestorScroll: true });
  const role = useRole(context, { role: 'tooltip' });
  const { getFloatingProps } = useInteractions([dismiss, role]);

  // Anchor to the stored selection rectangle via a virtual reference element.
  const rect = selection?.rect;
  useEffect(() => {
    if (!rect) return;
    refs.setReference({ getBoundingClientRect: () => rect as DOMRect });
  }, [refs, rect]);

  const content = selection
    ? (messages.find((m) => m.id === selection.messageId)?.content ?? '')
    : '';
  // Hook must run every render; it no-ops when there is no active selection.
  const entry = useDescribe(
    Boolean(selection),
    selection?.messageId ?? '',
    selection?.text ?? '',
    content.slice(0, 600),
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
