import { useEffect } from 'react';
import { useChatStore, descriptionKey, type GenerativeEntry, type Message } from '../app/store';
import { generateEnvelope, generateRelated, generateDeep, fetchWikiSummary } from '@curio/core';
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
 * Resolve the generative-UI component + related links for `term` (the modal's rich content).
 * Runs when `active`; we PREFETCH it on word click (see SelectionPopover) so "Ver más" opens
 * to a ready component instead of a spinner. Cached per (model, message, term) in the store,
 * so opening the modal is instant once the prefetch lands.
 *
 * `fallbackText` is the plain gloss; it becomes the plain-text envelope when no richer
 * component is produced.
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
        // Fan out every source at once (prefetched on word click): the local deep explanation
        // (fallback text), an optional visual component, the related links, AND Wikipedia's
        // card (real photo + facts + link) — the "living" panel. All parallel, all cached, so
        // "Ver más" opens with everything ready and no extra wait.
        const [deep, envelope, related, wiki] = await Promise.all([
          generateDeep(model, { term, context, conversation, signal: controller.signal }),
          generateEnvelope({
            model,
            term,
            context,
            conversation,
            fallbackText: fallbackText.trim() || term,
            signal: controller.signal,
          }),
          generateRelated(model, { term, context, conversation, signal: controller.signal }),
          // Pass a short slice of the surrounding text as a hint so ambiguous terms resolve
          // to the right article (e.g. "Júpiter" → the planet, not the god).
          fetchWikiSummary(term, 'es', controller.signal, context.slice(0, 40)),
        ]);
        settled = true;
        useChatStore
          .getState()
          .setGenerative(key, { status: 'done', envelope, related, deep, wiki });
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
