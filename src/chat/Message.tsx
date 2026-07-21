import { useMemo, useRef } from 'react';
import { useChatStore, type Message as MessageModel, type RectLike } from '../app/store';
import { tokenize } from '../reading/tokenize';
import { contextWindow } from '../lookup/contextWindow';
import WordSpan from '../reading/WordSpan';

interface MessageProps {
  message: MessageModel;
}

function toRectLike(r: DOMRect): RectLike {
  return {
    x: r.x,
    y: r.y,
    width: r.width,
    height: r.height,
    top: r.top,
    left: r.left,
    right: r.right,
    bottom: r.bottom,
  };
}

/** Render assistant prose with every content word turned into a clickable span. */
function InteractiveText({ messageId, content }: { messageId: string; content: string }) {
  const tokens = useMemo(() => tokenize(content), [content]);
  return (
    <>
      {tokens.map((tok, i) =>
        tok.clickable ? (
          <WordSpan
            key={i}
            messageId={messageId}
            index={i}
            term={tok.text}
            context={contextWindow(tokens, i)}
          />
        ) : (
          <span key={i}>{tok.text}</span>
        ),
      )}
    </>
  );
}

export default function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';
  const containerRef = useRef<HTMLDivElement>(null);

  // On mouse-up, if the user selected a phrase (2+ words) inside this message,
  // open a selection popover describing the whole phrase.
  const onMouseUp = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const el = containerRef.current;
    if (!el || !el.contains(range.commonAncestorContainer)) return;
    const text = sel.toString().trim();
    if (text.split(/\s+/).filter(Boolean).length < 2) return;
    useChatStore.getState().setSelection({
      messageId: message.id,
      text,
      rect: toRectLike(range.getBoundingClientRect()),
    });
  };

  if (isUser) {
    return (
      <div className="mb-6 flex justify-end">
        <div className="max-w-[80%] whitespace-pre-wrap rounded-3xl bg-bg-muted px-4 py-2.5 text-base text-fg">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseUp={onMouseUp}
      className="mb-6 text-base leading-relaxed text-fg"
    >
      <InteractiveText messageId={message.id} content={message.content} />
      {message.streaming && <span className="ml-0.5 animate-pulse text-fg-muted">▍</span>}
      {message.error && (
        <span className="text-sm text-fg-muted">
          {message.content ? ' ' : ''}
          {message.error}
        </span>
      )}
    </div>
  );
}
