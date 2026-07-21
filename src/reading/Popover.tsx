import { forwardRef, type HTMLAttributes } from 'react';
import { useDescribe } from '../lookup/useDescribe';
import DescriptionBody, { POPOVER_CLASS } from './DescriptionBody';

interface PopoverProps extends HTMLAttributes<HTMLDivElement> {
  messageId: string;
  term: string;
  context: string;
}

/** The inline description popover for a single clicked word. Anchored by Floating UI
 *  (see WordSpan). Dismissed by clicking outside or pressing Escape. */
const Popover = forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  { messageId, term, context, ...rest },
  ref,
) {
  const entry = useDescribe(true, messageId, term, context);
  return (
    <div ref={ref} className={POPOVER_CLASS} {...rest}>
      <DescriptionBody entry={entry} />
    </div>
  );
});

export default Popover;
