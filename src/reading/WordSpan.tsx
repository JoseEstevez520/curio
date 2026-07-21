import { useFloating, offset, flip, shift, autoUpdate, FloatingPortal } from '@floating-ui/react';
import { useChatStore } from '../app/store';
import Popover from './Popover';

interface WordSpanProps {
  messageId: string;
  index: number;
  term: string;
  context: string;
}

/** A clickable word inside an assistant message. Clicking pins its description open. */
export default function WordSpan({ messageId, index, term, context }: WordSpanProps) {
  const key = `${messageId}:${index}`;
  const openKey = useChatStore((s) => s.openKey);
  const setOpenKey = useChatStore((s) => s.setOpenKey);
  const isOpen = openKey === key;

  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    placement: 'bottom',
    middleware: [offset(6), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  return (
    <>
      <button
        ref={refs.setReference}
        type="button"
        className="entity"
        aria-expanded={isOpen}
        onClick={() => setOpenKey(isOpen ? null : key)}
      >
        {term}
      </button>
      {isOpen && (
        <FloatingPortal>
          <Popover
            ref={refs.setFloating}
            style={floatingStyles}
            messageId={messageId}
            term={term}
            context={context}
          />
        </FloatingPortal>
      )}
    </>
  );
}
