import type { Message as MessageModel } from '../app/store';
import MarkdownMessage from '../reading/MarkdownMessage';

interface MessageProps {
  message: MessageModel;
}

export default function Message({ message }: MessageProps) {
  if (message.role === 'user') {
    return (
      <div className="mb-6 flex justify-end">
        <div className="max-w-[80%] whitespace-pre-wrap rounded-3xl bg-bg-muted px-4 py-2.5 text-base text-fg">
          {message.content}
        </div>
      </div>
    );
  }

  // While the assistant reply is on its way but no token has landed yet, show the "thinking"
  // dots so the wait never looks like a dead screen (the header mascot also wobbles).
  if (message.streaming && !message.content) {
    return (
      <div className="mb-6" role="status" aria-label="Pensando">
        <div className="curio-dots">
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 text-base leading-relaxed text-fg">
      <MarkdownMessage
        messageId={message.id}
        content={message.content}
        streaming={message.streaming}
      />
      {message.error && (
        <span className="text-sm text-fg-muted">
          {message.content ? ' ' : ''}
          {message.error}
        </span>
      )}
    </div>
  );
}
