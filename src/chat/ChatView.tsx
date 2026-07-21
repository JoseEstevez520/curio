import { useChatStore } from '../app/store';
import Message from './Message';
import Composer from './Composer';

export default function ChatView() {
  const messages = useChatStore((s) => s.messages);
  const addUserMessage = useChatStore((s) => s.addUserMessage);

  return (
    <div className="flex h-screen flex-col bg-bg">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-measure px-6 py-12">
          {messages.length === 0 ? (
            <div className="text-fg-muted">
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
      <Composer onSend={addUserMessage} />
    </div>
  );
}
