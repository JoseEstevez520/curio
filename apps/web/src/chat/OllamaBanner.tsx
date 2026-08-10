import type { OllamaStatus } from './useModels';
import { useChatStore } from '../app/store';

interface OllamaBannerProps {
  status: OllamaStatus;
  onRetry: () => void;
}

/**
 * Friendly, borderless notice when the local brain isn't ready. Deliberately BRAIN-AGNOSTIC:
 * Curio runs on a local model OR any OpenAI-compatible API (bring-your-own-key), so the copy
 * never assumes Ollama — it points at both paths. Localized via the active locale.
 */
export default function OllamaBanner({ status, onRetry }: OllamaBannerProps) {
  const locale = useChatStore((s) => s.locale);
  if (status === 'ok' || status === 'checking') return null;

  const copy =
    locale === 'es'
      ? {
          unreachable:
            'No se alcanza ningún modelo local. Arráncalo, o configura un endpoint de API, y reintenta.',
          noModels:
            'No hay ningún modelo disponible. Añade un modelo local o configura un endpoint de API, y reintenta.',
          retry: 'Reintentar',
        }
      : {
          unreachable:
            'No local model is reachable. Start one, or configure an API endpoint, then retry.',
          noModels:
            'No model available. Add a local model or configure an API endpoint, then retry.',
          retry: 'Retry',
        };

  const message = status === 'unreachable' ? copy.unreachable : copy.noModels;

  return (
    <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl bg-bg-muted px-4 py-3 text-sm text-fg-secondary">
      <span>{message}</span>
      <button
        type="button"
        onClick={onRetry}
        className="shrink-0 rounded-full bg-bg-inset px-3 py-1.5 text-xs text-fg transition-colors duration-fast hover:bg-border"
      >
        {copy.retry}
      </button>
    </div>
  );
}
