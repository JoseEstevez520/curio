import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useChatStore } from '../app/store';
import { MASCOT_MORPH } from '@curio/core';
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
  const brain = useChatStore((s) => s.brain);
  const isStreaming = useChatStore((s) => s.messages.some((m) => m.streaming));
  const inspecting = useChatStore((s) => s.selection !== null);
  // useModels still runs for its side effect (auto-selecting an installed Ollama model) and for the
  // banner status; the header no longer shows a model picker, so we don't need the list here.
  const { status, reload } = useModels();
  const send = useSendMessage();
  const hasMessages = messages.length > 0;
  const reading = mode === 'read';

  // Auto-scroll (the chat standard): stay pinned to the bottom as a reply streams in, but never
  // yank the reader down if they've scrolled up to reread — we only re-stick once they're back
  // near the bottom. A brand-new message (you send, or the reply begins) always scrolls down.
  const scrollRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);
  const prevCountRef = useRef(0);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    // "Near" the bottom, not exactly — an 80px slack tolerates the last line's leading.
    atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isNewMessage = messages.length > prevCountRef.current;
    prevCountRef.current = messages.length;
    if (isNewMessage || atBottomRef.current) {
      el.scrollTop = el.scrollHeight;
      atBottomRef.current = true;
    }
  }, [messages]);

  return (
    <div className="flex h-screen flex-col bg-bg">
      <Header
        // In read mode the hero is gone, so the header carries the brand (and the mascot
        // morphs between the two whenever you switch surface).
        showBrand={hasMessages || reading}
        thinking={isStreaming}
        inspecting={inspecting}
      />
      {/* Scroll clips its top edge, which would cut the mascot as it morphs down from the header
          into the hero (Leer → Chat vacío). The empty state has nothing to scroll, so drop the clip
          there; restore it once there's a conversation or an article to scroll. */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={`flex-1 ${hasMessages || reading ? 'overflow-y-auto' : 'overflow-visible'}`}
      >
        {reading ? (
          <ArticleView />
        ) : (
          <div className="mx-auto w-full max-w-2xl px-4 py-10">
            {/* Only nag about Ollama when it's the selected brain — Groq users don't need it. */}
            {brain === 'ollama' && <OllamaBanner status={status} onRetry={() => void reload()} />}
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
