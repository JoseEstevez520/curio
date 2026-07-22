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
export interface ModelsRequest {
  kind: 'models';
}
export interface PingRequest {
  kind: 'ping';
}

export type CurioRequest = DescribeRequest | GenerateRequest | ModelsRequest | PingRequest;

/** A discriminated result so the content side always knows if it can trust `data`. */
export type CurioResponse<T> = { ok: true; data: T } | { ok: false; error: string };

export type DescribeResult = CurioResponse<string>;
export type GenerateResult = CurioResponse<Envelope>;
export type ModelsResult = CurioResponse<OllamaModel[]>;
export type PingResult = CurioResponse<boolean>;

/** Storage keys shared across background / content / popup. */
export const STORAGE = {
  enabled: 'curio:enabled',
  model: 'curio:model',
  describeModel: 'curio:describeModel',
} as const;
