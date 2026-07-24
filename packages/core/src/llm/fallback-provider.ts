import { OpenAIError } from './openai-provider';
import type { CompletionRequest, LlmProvider } from './provider';

/**
 * Whether an error is worth trying the next provider for. Rate limits (429) and server errors
 * (5xx) are transient/quota problems the fallback can dodge; anything else (bad key, abort,
 * programming error) should surface as-is.
 */
function isRetriable(e: unknown): boolean {
  return e instanceof OpenAIError && (e.status === 429 || (e.status ?? 0) >= 500);
}

/**
 * Tries a list of brains in order, moving to the next only on a retriable failure (e.g. Groq's
 * daily token limit → fall back to a lighter model with its own quota). Streaming falls back
 * ONLY if the first provider fails before yielding anything — never mid-stream, so output is
 * never duplicated or spliced. Aborts propagate immediately.
 */
export class FallbackProvider implements LlmProvider {
  readonly name = 'fallback';
  private readonly providers: LlmProvider[];

  constructor(providers: LlmProvider[]) {
    if (providers.length === 0) throw new Error('FallbackProvider needs at least one provider');
    this.providers = providers;
  }

  async complete(req: CompletionRequest): Promise<string> {
    for (let i = 0; i < this.providers.length; i++) {
      try {
        return await this.providers[i].complete(req);
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') throw e;
        if (i === this.providers.length - 1 || !isRetriable(e)) throw e;
      }
    }
    // Unreachable: the loop either returns or throws.
    throw new Error('FallbackProvider: no providers');
  }

  async *completeStream(req: CompletionRequest): AsyncGenerator<string> {
    for (let i = 0; i < this.providers.length; i++) {
      const provider = this.providers[i];
      let started = false;
      try {
        if (provider.completeStream) {
          for await (const delta of provider.completeStream(req)) {
            started = true;
            yield delta;
          }
        } else {
          const text = await provider.complete(req);
          started = true;
          yield text;
        }
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') throw e;
        // Never fall back once tokens have started streaming — the partial output can't be undone.
        if (started || i === this.providers.length - 1 || !isRetriable(e)) throw e;
      }
    }
  }
}
