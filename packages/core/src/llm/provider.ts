import type { ChatMessage, OllamaFormat } from '../ollama/types';

/**
 * One completion request, provider-agnostic. `format` optionally constrains the output to
 * valid structured JSON (a JSON Schema object, or the string 'json') — the same contract the
 * catalog's two-stage generation already relies on.
 */
export interface CompletionRequest {
  messages: ChatMessage[];
  format?: OllamaFormat;
  temperature?: number;
  /** Soft cap on generated tokens (providers that can't honor it may ignore it). */
  maxTokens?: number;
  signal?: AbortSignal;
}

/**
 * A pluggable "brain": anything that can complete a chat, optionally under a JSON-Schema
 * constraint. This is the seam that lets each surface pick its model without the engine
 * caring which — Ollama (web, desktop) or the browser's built-in Gemini Nano (extension).
 * Implementations live alongside this file (ollama-provider.ts, chrome-ai-provider.ts).
 */
export interface LlmProvider {
  /** Short id for logs/telemetry, e.g. 'ollama', 'groq' or 'chrome-ai'. */
  readonly name: string;
  /** Run one completion and return the full text (callers that need JSON parse it). */
  complete(req: CompletionRequest): Promise<string>;
  /**
   * Optional token-by-token streaming, used by the chat and the popover gloss so text appears
   * as it's generated. Providers that can't stream simply omit this; callers fall back to
   * {@link complete} and render the whole answer at once.
   */
  completeStream?(req: CompletionRequest): AsyncGenerator<string>;
}
