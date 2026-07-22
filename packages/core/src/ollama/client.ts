// Core Ollama client wrapper.
//
// Dependency-free: native fetch + ReadableStream reader + TextDecoder. All calls
// go through the same-origin `/ollama` proxy (see vite.config.ts), so there is no
// CORS and no user configuration. Browser-side only.

import type { ChatMessage, ChatParams, OllamaFormat } from './types';

/**
 * Base prefix for every Ollama request. Configurable so the same core works on any surface:
 *   • web app  → '/ollama'            (Vite proxy forwards /ollama/* → :11434/*, no CORS)
 *   • extension / desktop → 'http://localhost:11434' (direct; needs OLLAMA_ORIGINS set)
 * Defaults to the web proxy path so the web app needs no configuration.
 */
let ollamaBase = '/ollama';

/** Point the core at a different Ollama endpoint (e.g. the extension calls localhost directly). */
export function configureOllama(baseUrl: string): void {
  ollamaBase = baseUrl.replace(/\/$/, '');
}

/** The current Ollama base prefix. */
export function getOllamaBase(): string {
  return ollamaBase;
}

/** Discriminates *why* a call failed so callers can react appropriately. */
export type OllamaErrorKind =
  | 'unreachable' // fetch rejected — Ollama is not running / network error
  | 'http' // server responded with a non-2xx status
  | 'parse'; // response body could not be parsed as expected

/** Typed error thrown by every helper in this module. */
export class OllamaError extends Error {
  readonly kind: OllamaErrorKind;
  /** HTTP status code, when `kind === 'http'`. */
  readonly status?: number;

  constructor(
    kind: OllamaErrorKind,
    message: string,
    options?: { status?: number; cause?: unknown },
  ) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = 'OllamaError';
    this.kind = kind;
    this.status = options?.status;
  }
}

/**
 * Base fetch helper. Prefixes `path` with `/ollama` and normalizes failures into
 * an {@link OllamaError}. A rejected fetch (daemon down, DNS, connection refused)
 * becomes `kind: 'unreachable'`; a non-2xx response becomes `kind: 'http'`.
 */
export async function ollamaFetch(path: string, init?: RequestInit): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(`${ollamaBase}${path}`, init);
  } catch (cause) {
    // A DOMException with name 'AbortError' means the caller cancelled — re-throw
    // it untouched so callers can distinguish cancellation from an outage.
    if (cause instanceof DOMException && cause.name === 'AbortError') {
      throw cause;
    }
    throw new OllamaError('unreachable', 'Could not reach Ollama. Is it running?', { cause });
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    const suffix = detail ? `: ${detail}` : '';
    throw new OllamaError('http', `Ollama returned HTTP ${response.status}${suffix}`, {
      status: response.status,
    });
  }

  return response;
}

/** Request body shape for `POST /api/chat`. */
interface ChatRequestBody {
  model: string;
  messages: ChatMessage[];
  stream: boolean;
  format?: OllamaFormat;
  keep_alive?: string;
  options?: { temperature?: number; num_predict?: number };
}

/** A single NDJSON chunk from `/api/chat` (fields we care about). */
interface ChatStreamChunk {
  message?: { role?: string; content?: string };
  done?: boolean;
}

function buildChatBody(params: ChatParams, stream: boolean): ChatRequestBody {
  const body: ChatRequestBody = {
    model: params.model,
    messages: params.messages,
    stream,
  };
  if (params.format !== undefined) {
    body.format = params.format;
  }
  if (params.keepAlive !== undefined) {
    body.keep_alive = params.keepAlive;
  }
  if (params.temperature !== undefined || params.numPredict !== undefined) {
    body.options = {};
    if (params.temperature !== undefined) body.options.temperature = params.temperature;
    if (params.numPredict !== undefined) body.options.num_predict = params.numPredict;
  }
  return body;
}

function parseChatChunk(line: string): ChatStreamChunk {
  let value: unknown;
  try {
    value = JSON.parse(line);
  } catch (cause) {
    throw new OllamaError('parse', `Malformed NDJSON chunk from Ollama: ${line}`, { cause });
  }
  if (typeof value !== 'object' || value === null) {
    throw new OllamaError('parse', 'Expected a JSON object in the Ollama stream.');
  }
  return value as ChatStreamChunk;
}

/**
 * Stream a chat completion. POSTs `/api/chat` with `stream: true`, reads the
 * response body as newline-delimited JSON (NDJSON), and yields each
 * `message.content` delta as it arrives. Completes when a chunk reports
 * `done: true`. Partial lines split across network chunks are buffered until a
 * newline is seen.
 *
 * The primary streaming primitive: used for assistant replies and, later, for
 * streaming structured descriptions into the popover.
 */
export async function* chatStream(params: ChatParams): AsyncGenerator<string> {
  const response = await ollamaFetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildChatBody(params, true)),
    signal: params.signal,
  });

  if (!response.body) {
    throw new OllamaError('parse', 'Ollama response has no readable body.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      let newlineIndex = buffer.indexOf('\n');
      while (newlineIndex !== -1) {
        const line = buffer.slice(0, newlineIndex).trim();
        buffer = buffer.slice(newlineIndex + 1);

        if (line) {
          const chunk = parseChatChunk(line);
          const delta = chunk.message?.content;
          if (delta) {
            yield delta;
          }
          if (chunk.done) {
            return;
          }
        }

        newlineIndex = buffer.indexOf('\n');
      }
    }

    // Flush any trailing line that arrived without a terminating newline.
    const tail = buffer.trim();
    if (tail) {
      const chunk = parseChatChunk(tail);
      const delta = chunk.message?.content;
      if (delta) {
        yield delta;
      }
    }
  } finally {
    // Release the lock; cancel any still-buffered stream data on early exit.
    reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}

/**
 * Non-streaming convenience: accumulate a streamed chat completion and return the
 * full assistant text. Accepts the same params as {@link chatStream}.
 */
export async function chat(params: ChatParams): Promise<string> {
  let text = '';
  for await (const delta of chatStream(params)) {
    text += delta;
  }
  return text;
}
