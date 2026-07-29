import { useEffect, useRef, useSyncExternalStore } from 'react';
import { curioLibrary } from './library';
import { useActiveModelId, getBrain } from '../llm/brain';
import { describeError } from '../chat/useChat';

// Use the same brain as the chat — it already generates OpenUI correctly.

export interface OpenUIState {
  response: string | null;
  isStreaming: boolean;
  error?: string;
}

const EMPTY: OpenUIState = { response: null, isStreaming: false };

const TASK_NOTE = [
  'You build a compact, elegant explanation panel for a single term a curious reader clicked.',
  'CRITICAL: the root MUST wrap ALL pieces in ONE array — `root = Panel([Heading(...), Prose(...), ...])`.',
  'Never pass pieces to Panel as separate arguments; they go inside that single array, in reading order.',
  'Explain the CLICKED TERM, not the topic of the surrounding text. The context below is ONLY for',
  'disambiguation (e.g. "apple" → fruit vs company). If the term is a common word or adjective',
  '("informático", "es", "básico"), explain what it MEANS as used here — NEVER replace it with',
  'the broader theme of the text. Compose the components that best express THIS term — do not',
  'force a fixed shape. Prefer a short Heading + Prose, then any structured pieces that genuinely',
  'help (DefinitionCard, FactTable, Timeline, Steps, Comparison, BulletList, Quote, CodeBlock,',
  'KeyStat, Callout). Keep it tight: a few pieces, not a wall. Write all text in the same language',
  'as the term/context (default Spanish). Be factual and concise.',
  'The reader can ALREADY SEE the original text next to your panel — never repeat content it states',
  '(if the text lists items, do NOT re-list them). Your panel must ADD understanding on top: what the',
  'term really means, why it matters, how the ideas in the text connect.',
  'ALWAYS end with a Callout as the LAST component explaining why this term matters in THIS specific text',
  '— what role it plays here, what depends on it. Label it "En este texto" inside the callout text.',
].join(' ');

// ---- Shared cache (survives across component mounts) ----
const cache = new Map<string, OpenUIState>();
const listeners = new Set<() => void>();
let cacheVersion = 0;
function notify() { cacheVersion++; listeners.forEach((l) => l()); }
function setCache(key: string, state: OpenUIState) { cache.set(key, state); notify(); }
function getSnapshot() { return cacheVersion; }
function subscribe(cb: () => void) { listeners.add(cb); return () => listeners.delete(cb); }

function cacheKey(model: string, term: string): string {
  return `${model}:${term.trim().toLowerCase()}`;
}

/**
 * Drive OpenUI generation. Results are cached globally so the prefetch
 * (SelectionPopover) and the modal (DescribeModal) share the same result.
 */
export function useOpenUI(active: boolean, term: string, context: string): OpenUIState {
  const model = useActiveModelId('chat');
  const key = cacheKey(model, term);

  // Subscribe to cache changes — the version number changes on every update,
  // ensuring React detects the change (a Map reference never changes).
  useSyncExternalStore(subscribe, getSnapshot);
  const cached = cache.get(key);

  const runRef = useRef(0);

  useEffect(() => {
    if (!active || !term.trim()) return;
    // Already done, streaming, or errored — don't re-run
    if (cached && cached.response !== null) return;
    if (cached?.error) return;

    const { provider, ready, reason } = getBrain('chat');
    if (!ready) {
      setCache(key, { response: null, isStreaming: false, error: reason ?? 'No brain available.' });
      return;
    }

    const run = ++runRef.current;
    const controller = new AbortController();
    setCache(key, { response: '', isStreaming: true });

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
            setCache(key, { response: acc, isStreaming: true });
          }
        } else {
          acc = await provider.complete({ messages, signal: controller.signal });
        }
        if (run !== runRef.current) return;
        setCache(key, { response: acc, isStreaming: false });
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        if (run !== runRef.current) return;
        setCache(key, { response: null, isStreaming: false, error: describeError(e) });
      }
    })();

    return () => controller.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, key, model, term, context]);

  return cached ?? EMPTY;
}
