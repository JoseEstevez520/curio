import {
  buildTypeChoiceMessages,
  buildFillMessages,
  buildDescribeMessages,
} from '../ollama/prompts';
import { typeChoiceJsonSchema, dataJsonSchema } from '../catalog/jsonSchema';
import { coerceFromParts } from '../catalog/coerce';
import { catalogMeta } from '../catalog/catalog';
import { CATALOG_TYPES, type CatalogType, type Envelope } from '../catalog/schemas';
import { OllamaProvider } from '../llm/ollama-provider';
import type { LlmProvider } from '../llm/provider';
import { cleanDescription } from './cleanDescription';

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
 * Generate a validated {@link Envelope} using any {@link LlmProvider}, two-stage
 * (DESIGN / ARCHITECTURE §6):
 *
 *   1. CHOOSE — a tiny classification constrained to `{ type, confidence }`.
 *   2. FILL   — populate ONLY the chosen component's schema (smaller schema = better fills
 *               on a 1–3B model).
 *
 * Every exit is a valid envelope: if stage 1 picks `plain-text` (or anything goes wrong),
 * we return the plain gloss; if stage 2's data fails Zod, `coerceFromParts` falls back to
 * plain-text too. The renderer therefore never sees anything unvalidated.
 *
 * This is the provider-agnostic core: it maps each stage's `numPredict` budget onto the
 * provider's `maxTokens` and calls {@link LlmProvider.complete}. {@link generateEnvelope} is
 * the thin Ollama wrapper over it.
 */
export async function generateEnvelopeWith(
  provider: LlmProvider,
  opts: Omit<GenerateOptions, 'model'>,
): Promise<Envelope> {
  const { term, context, conversation, fallbackText, signal } = opts;

  // Stage 1: choose a catalog type.
  const choiceRaw = await provider.complete({
    messages: buildTypeChoiceMessages(term, context, conversation),
    format: typeChoiceJsonSchema(),
    temperature: 0,
    maxTokens: 60,
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
  const fillRaw = await provider.complete({
    messages: buildFillMessages(term, context, catalogMeta(type), conversation),
    format: dataJsonSchema(type),
    temperature: 0.2,
    maxTokens: 500,
    signal,
  });

  return coerceFromParts(type, confidence, tryParse(fillRaw), fallbackText);
}

/**
 * Generate a validated {@link Envelope} for the modal via Ollama. Thin wrapper: builds an
 * {@link OllamaProvider} from `opts.model` and delegates to {@link generateEnvelopeWith}. The
 * signature and observable behavior are unchanged — the web app and extension call it as before.
 */
export async function generateEnvelope(opts: GenerateOptions): Promise<Envelope> {
  const provider = new OllamaProvider(opts.model);
  return generateEnvelopeWith(provider, opts);
}

/**
 * Produce a plain-text gloss for `term` with any {@link LlmProvider} — the single-shot path
 * the extension uses to get a description from whichever brain is available. Runs the same
 * label-free describe prompt used elsewhere and strips any leaked scaffolding via
 * {@link cleanDescription}.
 */
export async function describeWith(
  provider: LlmProvider,
  term: string,
  context: string,
  conversation?: string,
): Promise<string> {
  const text = await provider.complete({
    messages: buildDescribeMessages(term, context, conversation),
    temperature: 0.2,
    maxTokens: 120,
  });
  return cleanDescription(text);
}
