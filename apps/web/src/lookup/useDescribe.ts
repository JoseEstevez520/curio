import { useEffect } from 'react';
import { useChatStore, descriptionKey, type DescriptionEntry, type Message } from '../app/store';
import { buildDescribeMessages, buildDescribeImageMessages, describeImageWith } from '@curio/core';
import { cleanDescription } from '@curio/core';
import { describeError } from '../chat/useChat';
import { getBrain, useActiveModelId } from '../llm/brain';

/** Cheap, stable fingerprint of a (possibly huge) image data URL for the cache key. */
function hashImage(dataUrl: string): string {
  let h = 5381;
  for (let i = 0; i < dataUrl.length; i++) h = ((h << 5) + h + dataUrl.charCodeAt(i)) | 0;
  return `${dataUrl.length.toString(36)}.${(h >>> 0).toString(36)}`;
}

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
  /** When set, describe THIS image (data URL) instead of the text `term` — vision branch. */
  image?: string,
  /** Image branch only: ask for a longer description (the modal's "See more"). */
  long?: boolean,
): DescriptionEntry | undefined {
  // The describer is a separate, faster agent: for Ollama it prefers the small model, falling
  // back to chat's; for Groq it's the one selected model. The brain+model is part of the cache
  // key (see useActiveModelId), so switching never serves a stale answer.
  const model = useActiveModelId('describe');
  // The language is part of the cache identity: switching locale must not serve a description
  // generated in the previous language.
  const locale = useChatStore((s) => s.locale);
  // Images and text never share a cache slot: the "term" for an image is a fingerprint of its
  // bytes plus the depth (short popover vs. long modal), so the two lengths don't collide either.
  const cacheTerm = image ? `image:${long ? 'long' : 'short'}:${hashImage(image)}` : term;
  const key = descriptionKey(`${model}:${locale}`, messageId, cacheTerm);
  const entry = useChatStore((s) => s.descriptions[key]);

  useEffect(() => {
    if (!active) return;
    // Cache hit: a finished (done) or in-flight (loading) result — don't recompute. An
    // `error` entry is NOT a hit: retry it (e.g. Ollama was down, now it's up).
    if (entry && entry.status !== 'error') return;

    const state = useChatStore.getState();
    const { provider, ready, reason } = getBrain('describe');
    if (!ready) {
      state.setDescription(key, { status: 'error', text: '', error: reason ?? 'No brain available.' });
      return;
    }

    const controller = new AbortController();
    // Settled once the request finishes on its own (done/error); if it's still false when
    // the effect tears down, the lookup was cancelled mid-flight — drop the stuck `loading`
    // entry so reopening the term retries instead of showing a caret forever.
    let settled = false;
    state.setDescription(key, { status: 'loading', text: '' });

    // Image branch: vision models describe the whole picture. The core helper (describeImageWith)
    // isn't streaming, so we show dots then the finished sentence; the longer modal variant reuses
    // the same prompt with a higher token budget.
    if (image) {
      (async () => {
        try {
          let text: string;
          if (long) {
            const raw = await provider.complete({
              messages: buildDescribeImageMessages(image, context, state.locale),
              temperature: 0.2,
              maxTokens: 320,
            });
            text = cleanDescription(raw);
          } else {
            text = await describeImageWith(provider, image, context, state.locale);
          }
          settled = true;
          useChatStore.getState().setDescription(key, { status: 'done', text });
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
    }

    const conversation = conversationContext(state.messages, messageId);
    const messages = buildDescribeMessages(term, context, conversation, state.locale);
    const req = { messages, temperature: 0.2, maxTokens: 60, signal: controller.signal };

    (async () => {
      try {
        let acc = '';
        if (provider.completeStream) {
          for await (const delta of provider.completeStream(req)) {
            acc += delta;
            useChatStore
              .getState()
              .setDescription(key, { status: 'loading', text: cleanDescription(acc) });
          }
        } else {
          acc = await provider.complete(req);
        }
        settled = true;
        useChatStore
          .getState()
          .setDescription(key, { status: 'done', text: cleanDescription(acc) });
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
