import { chat, chatStream, chatWithTools, chatWithToolsStream } from '../ollama/client';
import type { CompletionRequest, LlmProvider } from './provider';
import type { ToolCompletionRequest, ToolCompletionResponse, ToolStreamSink } from './tools';

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

  completeStream(req: CompletionRequest): AsyncGenerator<string> {
    return chatStream({
      model: this.model,
      messages: req.messages,
      format: req.format,
      temperature: req.temperature,
      numPredict: req.maxTokens,
      keepAlive: this.keepAlive,
      signal: req.signal,
    });
  }

  async completeWithTools(req: ToolCompletionRequest): Promise<ToolCompletionResponse> {
    return chatWithTools({
      model: this.model,
      messages: req.messages,
      tools: req.tools,
      temperature: req.temperature,
      keepAlive: this.keepAlive,
      signal: req.signal,
    });
  }

  async *completeWithToolsStream(req: ToolCompletionRequest, sink: ToolStreamSink): AsyncGenerator<string> {
    yield* chatWithToolsStream(
      {
        model: this.model,
        messages: req.messages,
        tools: req.tools,
        temperature: req.temperature,
        keepAlive: this.keepAlive,
        signal: req.signal,
      },
      sink,
    );
  }
}
