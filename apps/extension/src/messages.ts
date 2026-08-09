// Typed protocol between the content script (page) and the background service worker.
// All Ollama calls happen in the background (extension origin, with host_permissions), so
// the content script never talks to localhost directly — it just asks for results.

import type { Envelope, OllamaModel } from '@curio/core';

export interface DescribeRequest {
  kind: 'describe';
  term: string;
  context: string;
  conversation?: string;
}
export interface GenerateRequest {
  kind: 'generate';
  term: string;
  context: string;
  conversation?: string;
  fallbackText?: string;
}
export interface StatusRequest {
  kind: 'status';
}

export type CurioRequest = DescribeRequest | GenerateRequest | StatusRequest;

/**
 * Which brain the extension is using: the browser's built-in AI, local Ollama, a cloud
 * (OpenAI-compatible, bring-your-own-key) endpoint, or nothing ready.
 */
export type Brain = 'chrome-ai' | 'ollama' | 'cloud' | 'none';

/**
 * The user's brain PREFERENCE (distinct from the resolved {@link Brain}): 'auto' tries the
 * built-in AI then Ollama (the zero-setup local path); 'cloud' forces the configured
 * OpenAI-compatible endpoint. Stored under STORAGE.brain.
 */
export type BrainPref = 'auto' | 'cloud';

export interface StatusData {
  brain: Brain;
  /** Installed Ollama models — only relevant (and populated) when brain === 'ollama'. */
  models: OllamaModel[];
}

/** A discriminated result so the content side always knows if it can trust `data`. */
export type CurioResponse<T> = { ok: true; data: T } | { ok: false; error: string };

export type DescribeResult = CurioResponse<string>;
export type GenerateResult = CurioResponse<Envelope>;
export type StatusResult = CurioResponse<StatusData>;

/** Storage keys shared across background / content / popup. */
export const STORAGE = {
  enabled: 'curio:enabled',
  model: 'curio:model',
  describeModel: 'curio:describeModel',
  /** The language Curio speaks in this browser: UI strings + the model's output. */
  locale: 'curio:locale',
  /** Brain preference: 'auto' (built-in AI → Ollama) or 'cloud'. See {@link BrainPref}. */
  brain: 'curio:brain',
  /** Cloud (OpenAI-compatible) endpoint base URL, e.g. https://api.groq.com/openai/v1. */
  cloudBaseUrl: 'curio:cloudBaseUrl',
  /** Bring-your-own API key for the cloud endpoint. Lives only in this browser's storage. */
  cloudApiKey: 'curio:cloudApiKey',
  /** Cloud model id, e.g. 'openai/gpt-oss-20b'. */
  cloudModel: 'curio:cloudModel',
} as const;
