import { chat } from '../ollama/client';
import { buildTypeChoiceMessages, buildFillMessages } from '../ollama/prompts';
import { typeChoiceJsonSchema, dataJsonSchema } from '../catalog/jsonSchema';
import { coerceFromParts } from '../catalog/coerce';
import { catalogMeta } from '../catalog/catalog';
import { CATALOG_TYPES, type CatalogType, type Envelope } from '../catalog/schemas';

export interface GenerateOptions {
  model: string;
  term: string;
  /** The sentence / block the term sits in. */
  context: string;
  /** A little conversation context so the model disambiguates well. */
  conversation?: string;
  /** Plain-text gloss to show if generation can't produce a richer component. */
  fallbackText: string;
  signal?: AbortSignal;
}

/** Parse a JSON string defensively; returns `undefined` on any failure. */
function tryParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/**
 * Generate a validated {@link Envelope} for the modal, two-stage (DESIGN / ARCHITECTURE §6):
 *
 *   1. CHOOSE — a tiny classification constrained to `{ type, confidence }`.
 *   2. FILL   — populate ONLY the chosen component's schema (smaller schema = better fills
 *               on a 1–3B model).
 *
 * Every exit is a valid envelope: if stage 1 picks `plain-text` (or anything goes wrong),
 * we return the plain gloss; if stage 2's data fails Zod, `coerceFromParts` falls back to
 * plain-text too. The renderer therefore never sees anything unvalidated.
 */
export async function generateEnvelope(opts: GenerateOptions): Promise<Envelope> {
  const { model, term, context, conversation, fallbackText, signal } = opts;

  // Stage 1: choose a catalog type.
  const choiceRaw = await chat({
    model,
    messages: buildTypeChoiceMessages(term, context, conversation),
    format: typeChoiceJsonSchema(),
    temperature: 0,
    numPredict: 60,
    keepAlive: '10m',
    signal,
  });

  let type: CatalogType = 'plain-text';
  let confidence = 0;
  const choice = tryParse(choiceRaw);
  if (choice && typeof choice === 'object') {
    const c = choice as { type?: unknown; confidence?: unknown };
    if (typeof c.type === 'string' && (CATALOG_TYPES as readonly string[]).includes(c.type)) {
      type = c.type as CatalogType;
    }
    if (typeof c.confidence === 'number') confidence = c.confidence;
  }

  // Plain-text needs no second call — the gloss is already the answer.
  if (type === 'plain-text') {
    return { type: 'plain-text', confidence, data: { text: fallbackText } };
  }

  // Stage 2: fill the chosen component's schema.
  const fillRaw = await chat({
    model,
    messages: buildFillMessages(term, context, catalogMeta(type), conversation),
    format: dataJsonSchema(type),
    temperature: 0.2,
    numPredict: 500,
    keepAlive: '10m',
    signal,
  });

  return coerceFromParts(type, confidence, tryParse(fillRaw), fallbackText);
}
