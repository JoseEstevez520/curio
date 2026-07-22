import {
  buildTypeChoiceMessages,
  buildFillMessages,
  buildDescribeMessages,
  buildRelatedMessages,
} from '../ollama/prompts';
import { typeChoiceJsonSchema, dataJsonSchema } from '../catalog/jsonSchema';
import { coerceFromParts } from '../catalog/coerce';
import { catalogMeta } from '../catalog/catalog';
import { CATALOG_TYPES, type CatalogType, type Envelope } from '../catalog/schemas';
import { OllamaProvider } from '../llm/ollama-provider';
import type { LlmProvider } from '../llm/provider';
import type { OllamaFormat } from '../ollama/types';
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

/**
 * JSON-Schema constraint for the related-concepts call. Wrapped in an OBJECT with a
 * `minItems` array — a bare top-level array makes small models (e.g. llama3.2:3b) satisfy the
 * schema with an empty `[]`; an object + minItems reliably coaxes 3-5 real items out of them.
 */
const RELATED_SCHEMA: OllamaFormat = {
  type: 'object',
  properties: {
    related: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 5 },
  },
  required: ['related'],
  additionalProperties: false,
};

export interface RelatedOptions {
  term: string;
  context: string;
  conversation?: string;
  signal?: AbortSignal;
}

/**
 * Propose a few SHORT related concepts to explore next from `term`, using any provider.
 * Constrained to a JSON array of strings; parsed defensively. Returns [] on any non-abort
 * failure (related links are a nice-to-have — they must never break the modal). Filters out
 * blanks and the term itself, capped at 5. These render as clickable links in the modal.
 */
export async function generateRelatedWith(
  provider: LlmProvider,
  opts: RelatedOptions,
): Promise<string[]> {
  try {
    const raw = await provider.complete({
      messages: buildRelatedMessages(opts.term, opts.context, opts.conversation),
      format: RELATED_SCHEMA,
      temperature: 0.4,
      maxTokens: 120,
      signal: opts.signal,
    });
    const parsed = tryParse(raw);
    // Accept the object form `{ related: [...] }` (what the schema asks for) or a bare array.
    const list = Array.isArray(parsed)
      ? parsed
      : parsed &&
          typeof parsed === 'object' &&
          Array.isArray((parsed as { related?: unknown }).related)
        ? (parsed as { related: unknown[] }).related
        : [];
    const term = opts.term.trim().toLowerCase();
    const seen = new Set<string>();
    const out: string[] = [];
    for (const item of list) {
      if (typeof item !== 'string') continue;
      const s = item.trim();
      const key = s.toLowerCase();
      if (!s || key === term || seen.has(key)) continue;
      seen.add(key);
      out.push(s);
      if (out.length === 5) break;
    }
    return out;
  } catch (e) {
    // Cancellation must propagate so the caller can bail cleanly; everything else → no links.
    if (e instanceof DOMException && e.name === 'AbortError') throw e;
    return [];
  }
}

/** Ollama wrapper for {@link generateRelatedWith}. */
export function generateRelated(model: string, opts: RelatedOptions): Promise<string[]> {
  return generateRelatedWith(new OllamaProvider(model), opts);
}
