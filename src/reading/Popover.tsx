import { forwardRef, type HTMLAttributes } from 'react';
import { useDescribe } from '../lookup/useDescribe';

interface PopoverProps extends HTMLAttributes<HTMLDivElement> {
  messageId: string;
  term: string;
  context: string;
}

/** The inline description popover. Anchored to its word by Floating UI (see WordSpan).
 *  Dismissed by clicking outside or pressing Escape (wired via useDismiss in WordSpan). */
const Popover = forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  { messageId, term, context, ...rest },
  ref,
) {
  const entry = useDescribe(true, messageId, term, context);
  const loading = !entry || entry.status === 'loading';

  return (
    <div
      ref={ref}
      className="curio-popover z-50 max-w-[320px] rounded-sm border border-border bg-bg px-3 py-2 text-sm leading-normal text-fg-secondary"
      {...rest}
    >
      {entry?.status === 'error' ? (
        <p className="text-fg-muted">{entry.error}</p>
      ) : entry?.text ? (
        <p className="whitespace-pre-wrap">
          {entry.text}
          {loading && <span className="ml-0.5 animate-pulse text-fg-faint">▍</span>}
        </p>
      ) : (
        <p className="text-fg-faint" aria-label="Loading">
          …
        </p>
      )}
    </div>
  );
});

export default Popover;
