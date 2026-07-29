import { envelope, type Envelope } from './schemas';

/**
 * Turn anything the model produced into a VALID envelope, so the renderer can never crash.
 * We validate with Zod; on any failure (bad JSON already parsed to the wrong shape, unknown
 * type, missing fields, confidence out of range) we fall back to a `plain-text` envelope
 * carrying `fallbackText`. This is the single gate between raw model output and the UI —
 * nothing unvalidated ever reaches a component.
 */
export function coerceEnvelope(raw: unknown, fallbackText: string): Envelope {
  const parsed = envelope.safeParse(raw);
  if (parsed.success) return parsed.data;
  console.warn('[Curio coerce] Zod rejected envelope, falling back to plain-text:', envelope.safeParse(raw).error?.issues);
  return { type: 'plain-text', confidence: 0, data: { text: fallbackText } };
}

/**
 * Assemble a two-stage result (a chosen `type` + a separately-filled `data`) into an
 * envelope and validate it. Same fallback guarantee as {@link coerceEnvelope}.
 */
export function coerceFromParts(
  type: unknown,
  confidence: number,
  data: unknown,
  fallbackText: string,
): Envelope {
  return coerceEnvelope({ type, confidence, data }, fallbackText);
}
