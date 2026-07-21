import { useEffect } from 'react';
import { useChatStore, descriptionKey, type DescriptionEntry } from '../app/store';
import { chatStream } from '../ollama/client';
import { buildDescribeMessages } from '../ollama/prompts';
import { describeError } from '../chat/useChat';

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

    (async () => {
      try {
        let acc = '';
        for await (const delta of chatStream({
          model,
          messages: buildDescribeMessages(term, context),
          temperature: 0.2,
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
