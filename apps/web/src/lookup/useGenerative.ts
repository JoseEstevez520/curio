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
  // Structured output needs the more capable model; fall back to the describer's. The model
  // is part of the cache key, so switching models never serves a component built by another.
  const model = useChatStore((s) => s.model ?? s.describeModel ?? '');
  const key = descriptionKey(model, messageId, term);
  const entry = useChatStore((s) => s.generatives[key]);

  useEffect(() => {
    if (!active) return;
    // Cache hit: a finished (done) or in-flight (loading) result. An `error` entry is NOT a
    // hit — retry it (e.g. Ollama was down, now it's up).
    if (entry && entry.status !== 'error') return;

    const state = useChatStore.getState();
    if (!model) {
      state.setGenerative(key, {
        status: 'error',
        error: 'No model available. Pull one with `ollama pull llama3.2:3b`.',
      });
      return;
    }

    const controller = new AbortController();
    // See useDescribe: if still false at teardown, the generation was cancelled mid-flight,
    // so drop the stuck `loading` entry and let reopening retry (no infinite skeleton).
    let settled = false;
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
        settled = true;
        useChatStore.getState().setGenerative(key, { status: 'done', envelope });
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        settled = true;
        useChatStore.getState().setGenerative(key, { status: 'error', error: describeError(e) });
      }
    })();

    return () => {
      controller.abort();
      if (!settled) useChatStore.getState().clearGenerative(key);
    };
    // Keyed on (active, key, model): read the latest fallbackText via closure at fire time;
    // we don't want a change in the streaming gloss to re-trigger generation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, key, model]);

  return entry;
}
