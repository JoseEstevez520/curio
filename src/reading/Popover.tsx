import { forwardRef, type HTMLAttributes } from 'react';
import { useDescribe } from '../lookup/useDescribe';

interface PopoverProps extends HTMLAttributes<HTMLDivElement> {
  messageId: string;
  term: string;
  context: string;
}

/** The inline description popover. Anchored to its word by Floating UI (see WordSpan). */
const Popover = forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  { messageId, term, context, ...rest },
  ref,
) {
  const entry = useDescribe(true, messageId, term, context);
  const loading = !entry || entry.status === 'loading';

  return (
    <div
      ref={ref}
      role="tooltip"
      className="z-50 max-w-[320px] rounded-sm border border-border bg-bg p-3 text-sm text-fg-secondary"
      {...rest}
    >
      <div className="mb-1 text-xs font-medium text-fg-muted">{term}</div>
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
