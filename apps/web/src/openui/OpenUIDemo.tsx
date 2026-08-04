import { useState } from 'react';
import { Renderer } from '@openuidev/react-lang';
import { useChatStore } from '../app/store';
import { curioLibrary } from './library';
import { useOpenUI } from './useOpenUI';
import BrainControls from '../chat/BrainControls';

/**
 * SPIKE (exp/openui) — a self-contained page to feel OpenUI composing Curio's components with
 * Groq. Reach it at `/?openui`. Type a term + a little context, hit Generate, and watch the
 * model assemble our monochrome pieces in streaming. Not wired into the chat/modal yet — this
 * is the "does the pipeline work and look like Curio?" proof.
 */
export default function OpenUIDemo() {
  const brain = useChatStore((s) => s.brain);
  const [term, setTerm] = useState('');
  const [context, setContext] = useState('');
  const [submitted, setSubmitted] = useState<{ term: string; context: string } | null>(null);
  const [showSource, setShowSource] = useState(false);

  const { response, isStreaming, error } = useOpenUI(
    submitted !== null,
    submitted?.term ?? '',
    submitted?.context ?? '',
  );

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center justify-between gap-3 px-4 py-3">
        <span className="text-sm font-semibold tracking-tight text-fg">Curio · OpenUI spike</span>
        <BrainControls models={[]} />
      </header>

      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        {brain !== 'groq' && (
          <p className="mb-4 rounded-2xl bg-bg-muted px-4 py-3 text-sm text-fg-secondary">
            Tip: switch the brain to <strong>Groq</strong> (top-right) — level-3 composition wants a
            fast, capable model.
          </p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (term.trim()) setSubmitted({ term: term.trim(), context: context.trim() });
          }}
          className="flex flex-col gap-2"
        >
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Term (e.g. Mercury, Photosynthesis, Bauhaus)"
            className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus-visible:border-border-focus"
          />
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Optional context sentence — disambiguates the term"
            rows={2}
            className="resize-none rounded-lg border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus-visible:border-border-focus"
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="self-start rounded-full bg-fg px-4 py-1.5 text-sm text-bg transition-opacity duration-fast hover:opacity-90"
            >
              Generate
            </button>
            <label className="flex items-center gap-1.5 text-xs text-fg-muted">
              <input
                type="checkbox"
                checked={showSource}
                onChange={(e) => setShowSource(e.target.checked)}
              />
              show OpenUI Lang
            </label>
            {isStreaming && <span className="text-xs text-fg-muted">generando…</span>}
          </div>
        </form>

        {error && (
          <p className="mt-6 rounded-2xl bg-bg-muted px-4 py-3 text-sm text-fg-secondary">{error}</p>
        )}

        {response && (
          <div className="mt-8 flex flex-col gap-3">
            <Renderer response={response} library={curioLibrary} isStreaming={isStreaming} />
          </div>
        )}

        {showSource && response && (
          <pre className="mt-6 overflow-x-auto whitespace-pre-wrap rounded-lg border border-border bg-bg-muted p-3 text-xs text-fg-muted">
            {response}
          </pre>
        )}
      </div>
    </div>
  );
}
