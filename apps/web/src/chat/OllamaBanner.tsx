import type { OllamaStatus } from './useModels';

interface OllamaBannerProps {
  status: OllamaStatus;
  onRetry: () => void;
}

/** Friendly, borderless notice when Ollama is unreachable or has no models pulled. */
export default function OllamaBanner({ status, onRetry }: OllamaBannerProps) {
  if (status === 'ok' || status === 'checking') return null;

  const message =
    status === 'unreachable'
      ? 'Ollama isn’t running. Start it with `ollama serve`, then retry.'
      : 'No models installed. Pull one with `ollama pull llama3.2:3b`, then retry.';

  return (
    <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl bg-bg-muted px-4 py-3 text-sm text-fg-secondary">
      <span>{message}</span>
      <button
        type="button"
        onClick={onRetry}
        className="shrink-0 rounded-full bg-bg-inset px-3 py-1.5 text-xs text-fg transition-colors duration-fast hover:bg-border"
      >
        Retry
      </button>
    </div>
  );
}
