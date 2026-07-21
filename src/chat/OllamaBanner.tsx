import type { OllamaStatus } from './useModels';

interface OllamaBannerProps {
  status: OllamaStatus;
  onRetry: () => void;
}

/** Friendly hairline banner when Ollama is unreachable or has no models pulled. */
export default function OllamaBanner({ status, onRetry }: OllamaBannerProps) {
  if (status === 'ok' || status === 'checking') return null;

  const message =
    status === 'unreachable'
      ? 'Ollama isn’t running. Start it with `ollama serve`, then retry.'
      : 'No models installed. Pull one with `ollama pull llama3.2:3b`, then retry.';

  return (
    <div className="border-b border-border bg-bg-subtle px-6 py-2">
      <div className="mx-auto flex max-w-measure items-center justify-between gap-3 text-sm text-fg-secondary">
        <span>⚠ {message}</span>
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 rounded-sm border border-border px-3 py-1 text-xs text-fg transition-colors duration-fast hover:bg-bg-muted"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
