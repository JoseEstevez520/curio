import type { ChatMessage } from '../ollama/types';
import type { CompletionRequest, LlmProvider } from './provider';
import type { LlmTool, LlmToolCall, ToolCompletionRequest, ToolCompletionResponse } from './tools';

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
  /**
   * Extra request headers, merged over the defaults. The web app uses this to carry the real
   * upstream base URL (`x-llm-base-url`) when `baseUrl` is a same-origin dev proxy that forwards
   * to any user-entered OpenAI-compatible endpoint (sidesteps browser CORS).
   */
  headers?: Record<string, string>;
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
  response_format?: { type: 'json_object' } | { type: 'json_schema'; json_schema: { name: string; schema: unknown } };
}

export class OpenAICompatibleProvider implements LlmProvider {
  readonly name: string;
  private readonly model: string;
  private readonly apiKeys: string[];
  private currentKeyIndex: number;
  private readonly baseUrl: string;
  private readonly extraHeaders: Record<string, string>;

  constructor(cfg: OpenAIProviderConfig) {
    this.name = cfg.name ?? 'openai';
    this.model = cfg.model;
    // Support multiple keys separated by comma, or a single key.
    const keys = (cfg.apiKey ?? '').split(',').map((k) => k.trim()).filter(Boolean);
    this.apiKeys = keys.length > 0 ? keys : [''];
    this.currentKeyIndex = 0;
    this.baseUrl = (cfg.baseUrl ?? GROQ_BASE_URL).replace(/\/$/, '');
    this.extraHeaders = cfg.headers ?? {};
  }

  private get apiKey(): string {
    return this.apiKeys[this.currentKeyIndex] ?? '';
  }

  private rotateKey(): boolean {
    if (this.apiKeys.length <= 1) return false;
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    return true;
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json', ...this.extraHeaders };
    if (this.apiKey) h.Authorization = `Bearer ${this.apiKey}`;
    return h;
  }

  /**
   * Build the request body using JSON mode (`json_object`). Kept separate so callers can retry a
   * `json_schema` request against providers that don't support structured output (e.g. DeepSeek).
   */
  private buildJsonBody(req: CompletionRequest, stream: boolean): ChatCompletionBody {
    const body: ChatCompletionBody = { model: this.model, messages: req.messages, stream };
    if (req.temperature !== undefined) body.temperature = req.temperature;
    if (req.maxTokens !== undefined) body.max_tokens = req.maxTokens;
    body.response_format = { type: 'json_object' };
    return body;
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
      // Prefer structured-output JSON Schema when a schema is available (e.g. a catalog envelope or
      // an Excalidraw elements array): Groq rejects `json_object` when the response needs an array
      // at the root (400 json_validate_failed). A schema guarantees the shape. The string form
      // ('json') still falls back to plain JSON mode.
      if (typeof req.format === 'object') {
        body.response_format = { type: 'json_schema', json_schema: { name: 'structured', schema: req.format } };
      } else {
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
    }
    return body;
  }

  private async post(req: CompletionRequest, stream: boolean): Promise<Response> {
    const wantsSchema = typeof req.format === 'object';
    const maxAttempts = this.apiKeys.length + 1;

    // First attempt: the ideal body (json_schema when a schema was requested).
    let body = JSON.stringify(this.buildBody(req, stream));
    let attempt = 0;
    let fellBackToJson = false;

    for (; attempt < maxAttempts; attempt++) {
      let response: Response;
      try {
        response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: this.headers(),
          body,
          signal: req.signal,
        });
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === 'AbortError') throw cause;
        throw new OpenAIError('Could not reach the model endpoint. Check the base URL / network.', {
          cause,
        });
      }

      // Rate limited — try the next key if available.
      if (response.status === 429 && this.rotateKey()) {
        continue;
      }

      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        // Some OpenAI-compatible providers (DeepSeek) don't support `json_schema` yet. Retry once
        // with plain JSON mode before failing — the caller still parses + validates the result.
        if (wantsSchema && !fellBackToJson && response.status === 400 && /unavailable|not support|unsupported|response_format/i.test(detail)) {
          body = JSON.stringify(this.buildJsonBody(req, stream));
          fellBackToJson = true;
          attempt = -1;
          continue;
        }
        const hint =
          response.status === 401
            ? ' — check your API key.'
            : response.status === 404
              ? ' — check the model id / base URL.'
              : response.status === 429
                ? ' — rate limited on all keys.'
                : '';
        throw new OpenAIError(`API returned HTTP ${response.status}${hint} ${detail}`.trim(), {
          status: response.status,
        });
      }
      return response;
    }

    throw new OpenAIError('Rate limited on all API keys.', { status: 429 });
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

  /**
   * Tool-calling completion. Sends the conversation with the model's available tools and returns
   * any tool calls the model requested (the caller runs them and feeds results back via
   * `runToolLoop`). Uses `tools` + `tool_choice: 'auto'` on the OpenAI-compatible API.
   */
  async completeWithTools(req: ToolCompletionRequest): Promise<ToolCompletionResponse> {
    const body = {
      model: this.model,
      messages: toOpenAIMessages(req.messages),
      tools: toOpenAITools(req.tools),
      tool_choice: 'auto' as const,
      stream: false,
      ...(req.temperature !== undefined ? { temperature: req.temperature } : {}),
      ...(req.maxTokens !== undefined ? { max_tokens: req.maxTokens } : {}),
    };

    const response = await this.postJson(body, req.signal);
    const json = (await response.json().catch(() => null)) as {
      choices?: { message?: { content?: string; tool_calls?: unknown[] } }[];
    } | null;
    const message = json?.choices?.[0]?.message;
    return {
      content: message?.content ?? '',
      toolCalls: (message?.tool_calls ?? []).flatMap(parseOpenAIToolCall),
    };
  }

  /**
   * Plain POST with the same key rotation + error shaping as {@link post}, but without the
   * JSON-schema body logic — used by tool-calling requests.
   */
  private async postJson(body: Record<string, unknown>, signal?: AbortSignal): Promise<Response> {
    const maxAttempts = this.apiKeys.length + 1;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      let response: Response;
      try {
        response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: this.headers(),
          body: JSON.stringify(body),
          signal,
        });
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === 'AbortError') throw cause;
        throw new OpenAIError('Could not reach the model endpoint. Check the base URL / network.', {
          cause,
        });
      }
      if (response.status === 429 && this.rotateKey()) continue;
      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        const hint =
          response.status === 401
            ? ' — check your API key.'
            : response.status === 404
              ? ' — check the model id / base URL.'
              : response.status === 429
                ? ' — rate limited on all keys.'
                : '';
        throw new OpenAIError(`API returned HTTP ${response.status}${hint} ${detail}`.trim(), {
          status: response.status,
        });
      }
      return response;
    }
    throw new OpenAIError('Rate limited on all API keys.', { status: 429 });
  }
}

export interface ListModelsConfig {
  baseUrl?: string;
  apiKey?: string;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

/**
 * List the models an OpenAI-compatible endpoint offers (`GET /models`), so the UI can populate a
 * picker automatically — the cloud counterpart to Ollama's `/api/tags`. Returns the ids sorted;
 * throws {@link OpenAIError} on a bad key / unreachable endpoint / endpoint that doesn't implement
 * `/models` (some don't — the caller falls back to a manual model field).
 */
export async function listOpenAIModels(cfg: ListModelsConfig): Promise<string[]> {
  const base = (cfg.baseUrl ?? GROQ_BASE_URL).replace(/\/$/, '');
  const h: Record<string, string> = { ...(cfg.headers ?? {}) };
  if (cfg.apiKey) h.Authorization = `Bearer ${cfg.apiKey}`;

  let response: Response;
  try {
    response = await fetch(`${base}/models`, { headers: h, signal: cfg.signal });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause;
    throw new OpenAIError('Could not reach the endpoint to list models.', { cause });
  }
  if (!response.ok) {
    throw new OpenAIError(`HTTP ${response.status} listing models.`, { status: response.status });
  }
  const json = (await response.json().catch(() => null)) as { data?: { id?: string }[] } | null;
  return (json?.data ?? [])
    .map((m) => m.id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0)
    .sort((a, b) => a.localeCompare(b));
}

// ---------------------------------------------------------------------------
// Tool-calling wire format conversion (provider-agnostic <-> OpenAI-compatible)
// ---------------------------------------------------------------------------

/** Convert Curio messages (role: 'tool' with toolCallId, assistant with toolCalls) to the
 *  OpenAI message shape (`tool_calls` + `tool_call_id`). */
function toOpenAIMessages(messages: ToolCompletionRequest['messages']): Record<string, unknown>[] {
  return messages.map((message) => {
    if (message.role === 'tool') {
      return { role: 'tool', tool_call_id: message.toolCallId, content: message.content };
    }
    const base: Record<string, unknown> = { role: message.role, content: message.content };
    if (message.toolCalls?.length) {
      base.tool_calls = message.toolCalls.map((call) => ({
        id: call.id,
        type: 'function',
        function: { name: call.name, arguments: JSON.stringify(call.arguments) },
      }));
    }
    return base;
  });
}

/** Convert Curio {@link LlmTool}s to the OpenAI `tools` array. */
function toOpenAITools(tools: LlmTool[]): Record<string, unknown>[] {
  return tools.map((tool) => ({
    type: 'function',
    function: { name: tool.name, description: tool.description, parameters: tool.inputSchema },
  }));
}

/** Parse one OpenAI `tool_calls` entry into a Curio {@link LlmToolCall}. */
function parseOpenAIToolCall(raw: unknown): LlmToolCall[] {
  if (typeof raw !== 'object' || raw === null) return [];
  const call = raw as { id?: unknown; function?: { name?: unknown; arguments?: unknown } };
  if (typeof call.function?.name !== 'string') return [];
  const id = typeof call.id === 'string' ? call.id : `call_${Math.random().toString(36).slice(2, 10)}`;
  let args: Record<string, unknown> = {};
  if (typeof call.function.arguments === 'string') {
    try {
      const parsed = JSON.parse(call.function.arguments);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) args = parsed;
    } catch {
      // malformed arguments — surface as empty so the executor reports the real error
    }
  }
  return [{ id, name: call.function.name, arguments: args }];
}
