import { useMemo } from 'react';
import type { Message as MessageModel } from '../app/store';
import { tokenize } from '../reading/tokenize';
import WordSpan from '../reading/WordSpan';

interface MessageProps {
  message: MessageModel;
}

/** Render assistant prose with every content word turned into a clickable span. */
function InteractiveText({ messageId, content }: { messageId: string; content: string }) {
  const tokens = useMemo(() => tokenize(content), [content]);
  return (
    <>
      {tokens.map((tok, i) =>
        tok.clickable ? (
          <WordSpan key={i} messageId={messageId} index={i} term={tok.text} />
        ) : (
          <span key={i}>{tok.text}</span>
        ),
      )}
    </>
  );
}

export default function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';
  const label = isUser ? 'You' : 'Curio';

  return (
    <div className="mb-6">
      <div className="mb-2 text-xs font-medium text-fg-muted">{label}</div>
      {isUser ? (
        <div className="ml-auto max-w-[80%] rounded-md bg-bg-muted px-4 py-3 text-base text-fg-secondary">
          {message.content}
        </div>
      ) : (
        <div className="text-base leading-relaxed text-fg">
          <InteractiveText messageId={message.id} content={message.content} />
          {message.streaming && <span className="ml-0.5 animate-pulse text-fg-muted">▍</span>}
          {message.error && (
            <span className="text-sm text-fg-muted">
              {message.content ? ' ' : ''}⚠ {message.error}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
