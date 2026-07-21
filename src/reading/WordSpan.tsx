import { useChatStore } from '../app/store';

interface WordSpanProps {
  messageId: string;
  index: number;
  term: string;
}

/** A clickable word inside an assistant message. Clicking pins its description open. */
export default function WordSpan({ messageId, index, term }: WordSpanProps) {
  const key = `${messageId}:${index}`;
  const openKey = useChatStore((s) => s.openKey);
  const setOpenKey = useChatStore((s) => s.setOpenKey);
  const isOpen = openKey === key;

  return (
    <button
      type="button"
      className="entity"
      aria-expanded={isOpen}
      onClick={() => setOpenKey(isOpen ? null : key)}
    >
      {term}
    </button>
  );
}
