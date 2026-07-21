import { useEffect } from 'react';
import { useChatStore, descriptionKey, type GenerativeEntry, type Message } from '../app/store';
import { generateEnvelope } from './generate';
import { describeError } from '../chat/useChat';

/** The user turn that prompted this reply, trimmed — a little disambiguating context. */
function conversationContext(messages: Message[], messageId: string): string {
  const idx = messages.findIndex((m) => m.id === messageId);
  if (idx < 0) return '';
  for (let i = idx - 1; i >= 0; i--) {
    if (messages[i].role === 'user') return messages[i].content.slice(0, 400);
  }
  return '';
}

/**
 * Resolve the generative-UI component for `term` (the modal's rich content). Lazy: only
 * runs when `active` (i.e. the modal is open), so a plain click never pays for generation.
 * Cached per (message, term) in the store, so reopening the modal is instant.
 *
 * `fallbackText` is the plain gloss already shown in the popover; it becomes the plain-text
 * envelope whenever a richer component isn't produced.
 */
export function useGenerative(
  active: boolean,
  messageId: string,
  term: string,
  context: string,
  fallbackText: string,
): GenerativeEntry | undefined {
  const key = descriptionKey(messageId, term);
  const entry = useChatStore((s) => s.generatives[key]);

  useEffect(() => {
    if (!active) return;
    if (entry) return; // cache hit (done or in-flight)

    const state = useChatStore.getState();
    // Structured output needs the more capable model; fall back to the describer's.
    const model = state.model ?? state.describeModel;
    if (!model) {
      state.setGenerative(key, {
        status: 'error',
        error: 'No model available. Pull one with `ollama pull llama3.2:3b`.',
      });
      return;
    }

    const controller = new AbortController();
    state.setGenerative(key, { status: 'loading' });
    const conversation = conversationContext(state.messages, messageId);

    (async () => {
      try {
        const envelope = await generateEnvelope({
          model,
          term,
          context,
          conversation,
          fallbackText: fallbackText.trim() || term,
          signal: controller.signal,
        });
        useChatStore.getState().setGenerative(key, { status: 'done', envelope });
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        useChatStore.getState().setGenerative(key, { status: 'error', error: describeError(e) });
      }
    })();

    return () => controller.abort();
    // Keyed on (active, key): read the latest fallbackText via closure at fire time; we
    // don't want a change in the streaming gloss to re-trigger generation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, key]);

  return entry;
}
