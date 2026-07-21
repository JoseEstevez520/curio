import type { Message as MessageModel } from '../app/store';

interface MessageProps {
  message: MessageModel;
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
          {message.content}
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
