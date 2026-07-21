import { useChatStore } from '../app/store';
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

  return (
    <div className="flex h-screen flex-col bg-bg">
      <Header models={models} />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-4 py-10">
          <OllamaBanner status={status} onRetry={() => void reload()} />
          {messages.length === 0 ? (
            <div className="text-fg-muted">
              <CurioLogo size={72} alive track className="mb-4" />
              <h1 className="text-2xl font-bold tracking-tight text-fg">Curio</h1>
              <p className="mt-2 text-base">
                Ask something below. In a reply, hover or click any word to see it explained inline.
              </p>
            </div>
          ) : (
            messages.map((m) => <Message key={m.id} message={m} />)
          )}
        </div>
      </div>
      <Composer onSend={send} disabled={isStreaming} />
      <SelectionPopover />
    </div>
  );
}
