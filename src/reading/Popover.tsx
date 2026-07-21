import { forwardRef, type HTMLAttributes } from 'react';
import { useDescribe } from '../lookup/useDescribe';

interface PopoverProps extends HTMLAttributes<HTMLDivElement> {
  messageId: string;
  term: string;
  context: string;
  onClose: () => void;
}

/** The inline description popover. Anchored to its word by Floating UI (see WordSpan). */
const Popover = forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  { messageId, term, context, onClose, ...rest },
  ref,
) {
  const entry = useDescribe(true, messageId, term, context);
  const loading = !entry || entry.status === 'loading';

  return (
    <div
      ref={ref}
      className="z-50 max-w-[320px] rounded-sm border border-border bg-bg p-3 text-sm text-fg-secondary"
      {...rest}
    >
      <div className="mb-1 flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-fg-muted">{term}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="-mr-1 rounded-xs px-1 text-fg-muted transition-colors duration-fast hover:text-fg"
        >
          ×
        </button>
      </div>
      {entry?.status === 'error' ? (
        <p className="text-fg-muted">⚠ {entry.error}</p>
      ) : entry?.text ? (
        <p className="whitespace-pre-wrap">
          {entry.text}
          {loading && <span className="ml-0.5 animate-pulse text-fg-muted">▍</span>}
        </p>
      ) : (
        <p className="text-fg-muted">Thinking…</p>
      )}
    </div>
  );
});

export default Popover;
