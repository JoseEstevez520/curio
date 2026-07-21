// Model discovery + reachability checks against the local Ollama daemon.
// Browser-side only; goes through the same-origin `/ollama` proxy.

import { ollamaFetch, OllamaError } from './client';
import type { OllamaModel } from './types';

/** Response shape of `GET /api/tags`. */
interface TagsResponse {
  models?: OllamaModel[];
}

function isOllamaModel(value: unknown): value is OllamaModel {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { name?: unknown }).name === 'string'
  );
}

/**
 * List installed models via `GET /api/tags`. Returns the `models` array (empty
 * if Ollama reports no models). If Ollama is unreachable, the {@link OllamaError}
 * with `kind: 'unreachable'` propagates so the caller can show an onboarding banner.
 */
export async function listModels(signal?: AbortSignal): Promise<OllamaModel[]> {
  const response = await ollamaFetch('/api/tags', { signal });

  let body: unknown;
  try {
    body = await response.json();
  } catch (cause) {
    throw new OllamaError('parse', 'Could not parse the /api/tags response.', { cause });
  }

  const models = (body as TagsResponse).models;
  if (!Array.isArray(models)) {
    return [];
  }
  return models.filter(isOllamaModel);
}

/**
 * Reachability probe: resolves `true` if `/api/tags` responds (Ollama is up),
 * `false` if it is unreachable. HTTP-level errors still count as "reachable"
 * (the daemon answered), so only network failures return `false`. Used by the
 * "Ollama not running" banner slice. Cancellation (AbortError) is re-thrown.
 */
export async function pingOllama(signal?: AbortSignal): Promise<boolean> {
  try {
    await ollamaFetch('/api/tags', { signal });
    return true;
  } catch (error) {
    if (error instanceof OllamaError && error.kind === 'unreachable') {
      return false;
    }
    if (error instanceof OllamaError) {
      // The daemon answered (e.g. an HTTP error) — it is reachable.
      return true;
    }
    // Propagate cancellations and anything unexpected.
    throw error;
  }
}
