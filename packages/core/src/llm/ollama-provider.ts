import { chat } from '../ollama/client';
import type { CompletionRequest, LlmProvider } from './provider';

/**
 * The Ollama brain: completes via the local daemon (base set by `configureOllama`). Used by
 * the web app and desktop, and as the extension's fallback when the browser has no built-in AI.
 */
export class OllamaProvider implements LlmProvider {
  readonly name = 'ollama';

  constructor(
    private readonly model: string,
    /** How long the daemon keeps the model warm between calls. */
    private readonly keepAlive: string = '10m',
  ) {}

  complete(req: CompletionRequest): Promise<string> {
    return chat({
      model: this.model,
      messages: req.messages,
      format: req.format,
      temperature: req.temperature,
      numPredict: req.maxTokens,
      keepAlive: this.keepAlive,
      signal: req.signal,
    });
  }
}
