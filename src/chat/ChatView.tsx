import { useCallback } from 'react';
import { useChatStore } from '../app/store';
import { withViewTransition } from '../app/viewTransition';
import { useSendMessage } from './useChat';
import { useModels } from './useModels';
import CurioLogo from '../branding/CurioLogo';
import Header from './Header';
import OllamaBanner from './OllamaBanner';
import Message from './Message';
import Composer from './Composer';
import SelectionPopover from '../reading/SelectionPopover';

export default function ChatView() {
  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.messages.some((m) => m.streaming));
  const { models, status, reload } = useModels();
  const send = useSendMessage();
  const hasMessages = messages.length > 0;

  // Sending the first message flips the empty state into a conversation. Wrap that
  // one flip in a View Transition so the hero mascot + wordmark morph up into the
  // header (shared-element transition); later sends update plainly.
  const handleSend = useCallback(
    (text: string) => {
      if (hasMessages) {
        void send(text);
      } else {
        withViewTransition(() => void send(text));
      }
    },
    [hasMessages, send],
  );

  return (
    <div className="flex h-screen flex-col bg-bg">
      <Header models={models} showBrand={hasMessages} />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-4 py-10">
          <OllamaBanner status={status} onRetry={() => void reload()} />
          {!hasMessages ? (
            <div className="text-fg-muted">
              <CurioLogo size={72} alive track decorative className="vt-mascot mb-4" />
              <h1 className="vt-wordmark text-2xl font-bold tracking-tight text-fg">Curio</h1>
              <p className="mt-2 text-base">
                Ask something below. In a reply, hover or click any word to see it explained inline.
              </p>
            </div>
          ) : (
            messages.map((m) => <Message key={m.id} message={m} />)
          )}
        </div>
      </div>
      <Composer onSend={handleSend} disabled={isStreaming} />
      <SelectionPopover />
    </div>
  );
}
