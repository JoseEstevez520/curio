import { Renderer } from '@openuidev/react-lang';
import type { Message as MessageModel } from '../app/store';
import MarkdownMessage from '../reading/MarkdownMessage';
import ClickableSurface from '../reading/clickable';
import { curioLibrary } from '../openui/library';

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
      {message.generative ? (
        // A composed-components reply: the model's OpenUI Lang → our Curio components. Wrapped
        // in ClickableSurface so the words INSIDE those components stay click-to-explain, just
        // like the Markdown reply (the components emit `.entity` word spans via toClickable).
        <ClickableSurface messageId={message.id} streaming={message.streaming}>
          <Renderer
            response={message.content}
            library={curioLibrary}
            isStreaming={message.streaming}
          />
        </ClickableSurface>
      ) : (
        <MarkdownMessage
          messageId={message.id}
          content={message.content}
          streaming={message.streaming}
        />
      )}
      {message.error && (
        <span className="text-sm text-fg-muted">
          {message.content ? ' ' : ''}
          {message.error}
        </span>
      )}
    </div>
  );
}
