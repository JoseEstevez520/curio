import { useEffect, useRef, useState } from 'react';
import { curioLibrary } from './library';
import { getBrain } from '../llm/brain';
import { describeError } from '../chat/useChat';

/**
 * SPIKE (exp/openui) — drive OpenUI generation with the active brain (Groq, ideally).
 *
 * Flow: `library.prompt()` gives OpenUI's system prompt (the Lang spec + our component
 * signatures); we add a Curio task note; the model streams back OpenUI Lang, which the
 * <Renderer> parses progressively into our components. We do NOT set `format` (JSON mode) —
 * OpenUI Lang is not JSON, and forcing JSON would break it.
 */
export interface OpenUIState {
  response: string | null;
  isStreaming: boolean;
  error?: string;
}

const TASK_NOTE = [
  'You build a compact, elegant explanation panel for a single term a curious reader clicked.',
  'CRITICAL: the root MUST wrap ALL pieces in ONE array — `root = Panel([Heading(...), Prose(...), ...])`.',
  'Never pass pieces to Panel as separate arguments; they go inside that single array, in reading order.',
  'Compose the components that best express THIS term — do not force a fixed shape. Prefer a short',
  'Heading + Prose, then any structured pieces that genuinely help (DefinitionCard, FactTable, Timeline,',
  'KeyStat, Callout). Keep it tight: a few pieces, not a wall. Write all text in the same language as the',
  'term/context (default Spanish). Be factual and concise.',
].join(' ');

export function useOpenUI(active: boolean, term: string, context: string): OpenUIState {
  const [state, setState] = useState<OpenUIState>({ response: null, isStreaming: false });
  // Bump on each run so an in-flight stream from a previous term can't write stale text.
  const runRef = useRef(0);

  useEffect(() => {
    if (!active || !term.trim()) {
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
      { role: 'system' as const, content: `${curioLibrary.prompt()}\n\n${TASK_NOTE}` },
      { role: 'user' as const, content: `Term: ${term}\nContext: ${context}` },
    ];

    (async () => {
      try {
        let acc = '';
        if (provider.completeStream) {
          for await (const delta of provider.completeStream({ messages, signal: controller.signal })) {
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
  }, [active, term, context]);

  return state;
}
