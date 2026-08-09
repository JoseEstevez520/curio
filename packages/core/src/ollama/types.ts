// Shared types for the Ollama client wrapper.
//
// Everything here is browser-safe (no Node APIs). The client talks to the local
// Ollama daemon through the same-origin `/ollama` proxy configured in vite.config.ts.

/** Role of a single message in a chat conversation. */
export type ChatRole = 'system' | 'user' | 'assistant';

/** One turn in a chat conversation sent to / received from Ollama. */
export interface ChatMessage {
  role: ChatRole;
  content: string;
  /**
   * Optional images attached to this turn, as **data URLs** (e.g. `data:image/png;base64,…`).
   * Provider-agnostic on purpose: each provider serializes them to its own wire format (Ollama
   * → bare base64 in `images`; OpenAI-compatible → `content` parts with `image_url`). Only vision
   * models make use of them; text-only models / providers ignore them.
   */
  images?: string[];
}

/** Strip a data-URL prefix (`data:image/png;base64,`) down to bare base64, for wire formats
 *  (Ollama) that want the raw payload. A value that is already bare base64 passes through. */
export function dataUrlToBase64(dataUrl: string): string {
  const comma = dataUrl.indexOf(',');
  return dataUrl.startsWith('data:') && comma !== -1 ? dataUrl.slice(comma + 1) : dataUrl;
}

/**
 * A model as returned by Ollama's `GET /api/tags` endpoint.
 *
 * The shape is matched loosely: `name` is always present, the rest are optional
 * so we tolerate variations across Ollama versions without breaking parsing.
 */
export interface OllamaModel {
  /** Full tag, e.g. `llama3.2:3b`. */
  name: string;
  /** Model identifier (often identical to `name`). */
  model?: string;
  /** Size on disk in bytes. */
  size?: number;
  /** SHA-256 digest of the model. */
  digest?: string;
  /** ISO timestamp of the last modification. */
  modified_at?: string;
  /** Extra metadata (quantization, family, parameter size, …). */
  details?: {
    format?: string;
    family?: string;
    families?: string[];
    parameter_size?: string;
    quantization_level?: string;
  };
}

/**
 * Ollama's structured-output `format` field. Either the literal string `'json'`
 * or a JSON Schema object (used for the generative-UI catalog in v1).
 */
export type OllamaFormat = 'json' | Record<string, unknown>;

/** Parameters shared by the chat helpers. */
export interface ChatParams {
  /** Model tag, e.g. `llama3.2:3b`. */
  model: string;
  /** Conversation so far, oldest first. */
  messages: ChatMessage[];
  /** Sampling temperature (lower = more deterministic). */
  temperature?: number;
  /** Cap on generated tokens (Ollama `num_predict`) — keeps short answers fast. */
  numPredict?: number;
  /** How long Ollama keeps the model loaded after the call, e.g. '10m'. Keeps it warm. */
  keepAlive?: string;
  /** Constrain output to JSON / a JSON Schema (Ollama structured output). */
  format?: OllamaFormat;
  /** Abort signal to cancel the request (and stop the underlying stream). */
  signal?: AbortSignal;
}
