import { motion } from 'framer-motion';
import { useChatStore } from '../app/store';
import { MASCOT_MORPH } from '../app/motion';
import { useSendMessage } from './useChat';
import { useModels } from './useModels';
import CurioLogo from '../branding/CurioLogo';
import Header from './Header';
import OllamaBanner from './OllamaBanner';
import Message from './Message';
import Composer from './Composer';
import ArticleView from './ArticleView';
import PhraseHighlight from '../reading/PhraseHighlight';
import SelectionPopover from '../reading/SelectionPopover';

export default function ChatView() {
  const messages = useChatStore((s) => s.messages);
  const mode = useChatStore((s) => s.mode);
  const isStreaming = useChatStore((s) => s.messages.some((m) => m.streaming));
  const inspecting = useChatStore((s) => s.selection !== null);
  const { models, status, reload } = useModels();
  const send = useSendMessage();
  const hasMessages = messages.length > 0;
  const reading = mode === 'read';

  return (
    <div className="flex h-screen flex-col bg-bg">
      <Header
        models={models}
        // In read mode the hero is gone, so the header carries the brand (and the mascot
        // morphs between the two whenever you switch surface).
        showBrand={hasMessages || reading}
        thinking={isStreaming}
        inspecting={inspecting}
      />
      <div className="flex-1 overflow-y-auto">
        {reading ? (
          <ArticleView />
        ) : (
          <div className="mx-auto w-full max-w-2xl px-4 py-10">
            <OllamaBanner status={status} onRetry={() => void reload()} />
            {!hasMessages ? (
              <div className="text-fg-muted">
                {/* Same layoutId as the header mascot: sending the first message flips to
                  the conversation and Framer morphs this logo up into the header slot. */}
                <motion.div
                  layoutId="curio-mascot"
                  transition={MASCOT_MORPH}
                  className="mb-4"
                  style={{ width: 112, height: 112 }}
                >
                  <CurioLogo size={112} alive track decorative />
                </motion.div>
                <h1 className="text-2xl font-bold tracking-tight text-fg">Curio</h1>
                <p className="mt-2 text-base">
                  Ask something below. In a reply, hover or click any word to see it explained
                  inline.
                </p>
              </div>
            ) : (
              messages.map((m) => <Message key={m.id} message={m} />)
            )}
          </div>
        )}
      </div>
      {/* The composer belongs to the chat only; the article reader has its own paste UI. */}
      {!reading && <Composer onSend={send} disabled={isStreaming} />}
      {/* PhraseHighlight before SelectionPopover so the popover portal stacks above it.
          Both stay mounted in either mode; they render null when nothing is selected. */}
      <PhraseHighlight />
      <SelectionPopover />
    </div>
  );
}
