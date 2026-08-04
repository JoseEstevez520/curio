import { Renderer } from '@openuidev/react-lang';
import type { Message as MessageModel } from '../app/store';
import MarkdownMessage from '../reading/MarkdownMessage';
import ClickableSurface from '../reading/clickable';
import { curioLibrary } from '../openui/library';
import { isRenderableLang } from '../openui/renderable';
import ExcalidrawView from '../mcp/ExcalidrawView';

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

  // Show the "thinking" dots while waiting. For Gen UI we keep them for the WHOLE generation:
  // partial OpenUI Lang parses into pieces that pop in out of order (the panel is written before
  // its children resolve), which reads as janky. Instead we reveal the complete panel at once,
  // staggered top-to-bottom (see Panel/Reveal). Plain text still streams token-by-token.
  if (message.streaming && (message.generative || !message.content)) {
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
      {message.generative && isRenderableLang(message.content) ? (
        // A composed-components reply: the model's OpenUI Lang → our Curio components. Wrapped
        // in ClickableSurface so the words INSIDE those components stay click-to-explain, just
        // like the Markdown reply (the components emit `.entity` word spans via toClickable).
        <ClickableSurface messageId={message.id}>
          {/* Reached only once the reply is complete (streaming shows the dots above), so the
              whole panel renders and reveals at once — no half-built, out-of-order pop-in. */}
          <Renderer response={message.content} library={curioLibrary} isStreaming={false} />
        </ClickableSurface>
      ) : (
        // Plain text — either a normal reply, or a Gen UI reply where the brain (often a small
        // local model) didn't produce a valid Panel. Degrade to Markdown so the answer still
        // reads, instead of a blank panel. MarkdownMessage brings its own clickable words.
        <MarkdownMessage
          messageId={message.id}
          content={message.content}
          streaming={message.streaming}
        />
      )}
      {!message.streaming && message.diagram && <ExcalidrawView diagram={message.diagram} />}
      {message.error && (
        <span className="text-sm text-fg-muted">
          {message.content ? ' ' : ''}
          {message.error}
        </span>
      )}
    </div>
  );
}
