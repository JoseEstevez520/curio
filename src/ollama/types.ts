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
  /** Constrain output to JSON / a JSON Schema (Ollama structured output). */
  format?: OllamaFormat;
  /** Abort signal to cancel the request (and stop the underlying stream). */
  signal?: AbortSignal;
}
