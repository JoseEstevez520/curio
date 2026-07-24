import { useEffect, useRef, useState } from 'react';
import { getBrain } from '../llm/brain';
import { describeError } from '../chat/useChat';

/**
 * Generic Gen UI streamer: given a full system prompt (OpenUI spec + Curio library + a task
 * note) and a user message, stream the model's OpenUI Lang back. The caller feeds the result
 * to <Renderer>. Used by the article "transform with Gen UI" view; the standalone demo has its
 * own tiny variant. Not set as JSON (OpenUI Lang isn't JSON).
 */
export interface GenUIState {
  response: string | null;
  isStreaming: boolean;
  error?: string;
}

export function useGenUI(active: boolean, systemPrompt: string, userMessage: string): GenUIState {
  const [state, setState] = useState<GenUIState>({ response: null, isStreaming: false });
  // Bump per run so a stale in-flight stream can't overwrite a newer one.
  const runRef = useRef(0);

  useEffect(() => {
    if (!active || !userMessage.trim()) {
      setState({ response: null, isStreaming: false });
      return;
    }

    const { provider, ready, reason } = getBrain('chat');
    if (!ready) {
      setState({ response: null, isStreaming: false, error: reason ?? 'No brain available.' });
      return;
    }

    const run = ++runRef.current;
    const controller = new AbortController();
    setState({ response: '', isStreaming: true });

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userMessage },
    ];

    (async () => {
      try {
        let acc = '';
        if (provider.completeStream) {
          for await (const delta of provider.completeStream({
            messages,
            signal: controller.signal,
          })) {
            if (run !== runRef.current) return;
            acc += delta;
            setState({ response: acc, isStreaming: true });
          }
        } else {
          acc = await provider.complete({ messages, signal: controller.signal });
        }
        if (run !== runRef.current) return;
        setState({ response: acc, isStreaming: false });
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        if (run !== runRef.current) return;
        setState({ response: null, isStreaming: false, error: describeError(e) });
      }
    })();

    return () => controller.abort();
  }, [active, systemPrompt, userMessage]);

  return state;
}
