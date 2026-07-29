import { useEffect } from 'react';
import { useChatStore, descriptionKey, type GenerativeEntry, type Message } from '../app/store';
import {
  generateRelatedWith,
  resolveWikiEntityWith,
  fetchWikiByExactTitle,
} from '@curio/core';
import { describeError } from '../chat/useChat';
import { getBrain, useActiveModelId } from '../llm/brain';

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
  // Structured output uses the capable/chat brain. The brain+model is part of the cache key
  // (useActiveModelId), so switching never serves a component built by another.
  const model = useActiveModelId('chat');
  const key = descriptionKey(model, messageId, term);
  const entry = useChatStore((s) => s.generatives[key]);

  useEffect(() => {
    if (!active) return;
    // Cache hit: a finished (done) or in-flight (loading) result. An `error` entry is NOT a
    // hit — retry it (e.g. Ollama was down, now it's up).
    if (entry && entry.status !== 'error') return;

    const state = useChatStore.getState();
    const { provider, ready, reason } = getBrain('chat');
    if (!ready) {
      state.setGenerative(key, { status: 'error', error: reason ?? 'No brain available.' });
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
        // (the description, always LLM-authored and in-context), an optional visual component, the
        // related links, AND — for the photo — the Wikipedia card. All parallel, all cached, so
        // "Ver más" opens with everything ready and no extra wait.
        //
        // The photo is gated by the LLM: it first decides the canonical entity IN CONTEXT (or that
        // the word isn't a specific entity at all), and only then do we fetch Wikipedia by that
        // EXACT title. So a common/ambiguous word never pulls a random article/photo — if there's
        // no clear entity (or the exact title misses), there's simply no photo.
        const wikiPromise = (async () => {
          const entity = await resolveWikiEntityWith(provider, {
            term,
            context,
            conversation,
            signal: controller.signal,
          });
          if (!entity.title) return null;
          return fetchWikiByExactTitle(entity.title, entity.lang, controller.signal);
        })();

        // Only related + wiki — OpenUI handles the description now.
        const [related, wiki] = await Promise.all([
          generateRelatedWith(provider, { term, context, conversation, signal: controller.signal }),
          wikiPromise,
        ]);
        settled = true;
        useChatStore
          .getState()
          .setGenerative(key, { status: 'done', related, wiki });
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
