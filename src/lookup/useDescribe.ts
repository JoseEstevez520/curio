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
  // The describer is a separate, faster agent: prefer its small model, fall back to chat's.
  // The model is part of the cache key, so switching models never serves a stale answer.
  const model = useChatStore((s) => s.describeModel ?? s.model ?? '');
  const key = descriptionKey(model, messageId, term);
  const entry = useChatStore((s) => s.descriptions[key]);

  useEffect(() => {
    if (!active) return;
    // Cache hit: a finished (done) or in-flight (loading) result — don't recompute. An
    // `error` entry is NOT a hit: retry it (e.g. Ollama was down, now it's up).
    if (entry && entry.status !== 'error') return;

    const state = useChatStore.getState();
    if (!model) {
      state.setDescription(key, {
        status: 'error',
        text: '',
        error: 'No model available. Pull one with `ollama pull llama3.2:3b`.',
      });
      return;
    }

    const controller = new AbortController();
    // Settled once the request finishes on its own (done/error); if it's still false when
    // the effect tears down, the lookup was cancelled mid-flight — drop the stuck `loading`
    // entry so reopening the term retries instead of showing a caret forever.
    let settled = false;
    state.setDescription(key, { status: 'loading', text: '' });
    const conversation = conversationContext(state.messages, messageId);

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
        settled = true;
        useChatStore.getState().setDescription(key, { status: 'done', text: acc.trim() });
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        settled = true;
        useChatStore
          .getState()
          .setDescription(key, { status: 'error', text: '', error: describeError(e) });
      }
    })();

    return () => {
      controller.abort();
      if (!settled) useChatStore.getState().clearDescription(key);
    };
    // `entry` intentionally excluded: we key the fetch on (active, key, model) and read the
    // latest entry via getState to avoid re-triggering on every streamed token.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, key, model]);

  return entry;
}
