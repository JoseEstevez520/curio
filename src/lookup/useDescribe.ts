import { useEffect } from 'react';
import { useChatStore, descriptionKey, type DescriptionEntry, type Message } from '../app/store';
import { chatStream } from '../ollama/client';
import { buildDescribeMessages } from '../ollama/prompts';
import { describeError } from '../chat/useChat';

/** A little conversation context: the user turn that prompted this reply, trimmed. */
function conversationContext(messages: Message[], messageId: string): string {
  const idx = messages.findIndex((m) => m.id === messageId);
  if (idx < 0) return '';
  for (let i = idx - 1; i >= 0; i--) {
    if (messages[i].role === 'user') return messages[i].content.slice(0, 400);
  }
  return '';
}

/**
 * Resolve the description for `term` (as used in `context`) within a message.
 * Lazy: only runs when `active` is true. Cached per (message, term) in the store,
 * so reopening the same word is instant and never recomputes.
 */
export function useDescribe(
  active: boolean,
  messageId: string,
  term: string,
  context: string,
): DescriptionEntry | undefined {
  const key = descriptionKey(messageId, term);
  const entry = useChatStore((s) => s.descriptions[key]);

  useEffect(() => {
    if (!active) return;
    // Cache hit (done or in-flight) → don't recompute.
    if (entry) return;

    const { model, setDescription } = useChatStore.getState();
    if (!model) {
      setDescription(key, {
        status: 'error',
        text: '',
        error: 'No model available. Pull one with `ollama pull llama3.2:3b`.',
      });
      return;
    }

    const controller = new AbortController();
    setDescription(key, { status: 'loading', text: '' });
    const conversation = conversationContext(useChatStore.getState().messages, messageId);

    (async () => {
      try {
        let acc = '';
        for await (const delta of chatStream({
          model,
          messages: buildDescribeMessages(term, context, conversation),
          temperature: 0.2,
          numPredict: 120,
          keepAlive: '10m',
          signal: controller.signal,
        })) {
          acc += delta;
          useChatStore.getState().setDescription(key, { status: 'loading', text: acc });
        }
        useChatStore.getState().setDescription(key, { status: 'done', text: acc.trim() });
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        useChatStore
          .getState()
          .setDescription(key, { status: 'error', text: '', error: describeError(e) });
      }
    })();

    return () => controller.abort();
    // `entry` intentionally excluded: we key the fetch on (active, key) and read the
    // latest entry via getState to avoid re-triggering on every streamed token.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, key]);

  return entry;
}
