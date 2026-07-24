import type { ChatMessage } from '../ollama/types';
import type { CompletionRequest, LlmProvider } from './provider';

/**
 * A pluggable cloud brain speaking the OpenAI Chat Completions API — the shape Groq, LocalAI,
 * OpenRouter, Together, LM Studio and most others expose. This is Curio's escape hatch from
 * "local only": the owner decided anyone can plug in whatever key/endpoint they want (Groq's
 * free tier is the default), while Ollama stays the local default. See CLAUDE.md.
 *
 * It talks the same {@link LlmProvider} contract as {@link OllamaProvider}, so the whole
 * describe / generate pipeline works through it unchanged. Streaming is Server-Sent Events;
 * structured output maps `format` onto `response_format` (JSON mode).
 */

/** Groq's OpenAI-compatible base. In the web app we default to the same-origin `/groq` proxy. */
export const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

export interface OpenAIProviderConfig {
  /** Model id, e.g. 'llama-3.3-70b-versatile' (Groq) or 'gpt-4o-mini'. */
  model: string;
  /** Bearer key. Optional so a keyless local endpoint (LM Studio, LocalAI) also works. */
  apiKey?: string;
  /** API base WITHOUT a trailing slash, e.g. 'https://api.groq.com/openai/v1' or '/groq'. */
  baseUrl?: string;
  /** Short id for logs; defaults to 'openai'. The web app passes 'groq'. */
  name?: string;
}

/** Error thrown by {@link OpenAICompatibleProvider}; mirrors OllamaError's shape loosely. */
export class OpenAIError extends Error {
  readonly status?: number;
  constructor(message: string, options?: { status?: number; cause?: unknown }) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = 'OpenAIError';
    this.status = options?.status;
  }
}

interface ChatCompletionBody {
  model: string;
  messages: ChatMessage[];
  stream: boolean;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' };
}

export class OpenAICompatibleProvider implements LlmProvider {
  readonly name: string;
  private readonly model: string;
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(cfg: OpenAIProviderConfig) {
    this.name = cfg.name ?? 'openai';
    this.model = cfg.model;
    this.apiKey = cfg.apiKey ?? '';
    this.baseUrl = (cfg.baseUrl ?? GROQ_BASE_URL).replace(/\/$/, '');
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.apiKey) h.Authorization = `Bearer ${this.apiKey}`;
    return h;
  }

  /**
   * Build the request body. When a `format` is requested we ask for JSON mode
   * (`response_format: { type: 'json_object' }`) and — because OpenAI-compatible JSON mode
   * requires the word "json" to appear in the prompt, and guarantees valid JSON but NOT schema
   * adherence — we nudge with a system line. The existing Zod coercion + plain-text fallback
   * already handle any shape mismatch, so this stays robust across models.
   */
  private buildBody(req: CompletionRequest, stream: boolean): ChatCompletionBody {
    let messages = req.messages;
    const body: ChatCompletionBody = { model: this.model, messages, stream };
    if (req.temperature !== undefined) body.temperature = req.temperature;
    if (req.maxTokens !== undefined) body.max_tokens = req.maxTokens;
    if (req.format !== undefined) {
      body.response_format = { type: 'json_object' };
      messages = [
        ...req.messages,
        {
          role: 'system',
          content: 'Respond with ONE valid JSON object only — no prose, no markdown fences.',
        },
      ];
      body.messages = messages;
    }
    return body;
  }

  private async post(req: CompletionRequest, stream: boolean): Promise<Response> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(this.buildBody(req, stream)),
        signal: req.signal,
      });
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === 'AbortError') throw cause;
      throw new OpenAIError('Could not reach the model endpoint. Check the base URL / network.', {
        cause,
      });
    }
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      const hint =
        response.status === 401
          ? ' — check your API key.'
          : response.status === 404
            ? ' — check the model id / base URL.'
            : '';
      throw new OpenAIError(`API returned HTTP ${response.status}${hint} ${detail}`.trim(), {
        status: response.status,
      });
    }
    return response;
  }

  async complete(req: CompletionRequest): Promise<string> {
    const response = await this.post(req, false);
    const json = (await response.json().catch(() => null)) as {
      choices?: { message?: { content?: string } }[];
    } | null;
    return json?.choices?.[0]?.message?.content ?? '';
  }

  /**
   * Stream a completion via SSE. Each `data:` line carries a JSON chunk whose
   * `choices[0].delta.content` is the next text fragment; the stream ends on `data: [DONE]`.
   * Partial lines split across network reads are buffered until a newline.
   */
  async *completeStream(req: CompletionRequest): AsyncGenerator<string> {
    const response = await this.post(req, true);
    if (!response.body) throw new OpenAIError('Response has no readable body.');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex = buffer.indexOf('\n');
        while (newlineIndex !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);
          newlineIndex = buffer.indexOf('\n');

          if (!line.startsWith('data:')) continue;
          const data = line.slice(5).trim();
          if (data === '[DONE]') return;

          let chunk: { choices?: { delta?: { content?: string } }[] } | null = null;
          try {
            chunk = JSON.parse(data);
          } catch {
            continue; // tolerate keep-alive / non-JSON lines
          }
          const delta = chunk?.choices?.[0]?.delta?.content;
          if (delta) yield delta;
        }
      }
    } finally {
      reader.cancel().catch(() => undefined);
      reader.releaseLock();
    }
  }
}
