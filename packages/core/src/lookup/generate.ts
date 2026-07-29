import {
  buildTypeChoiceMessages,
  buildFillMessages,
  buildDescribeMessages,
  buildDeepDescribeMessages,
  buildContextualizerMessages,
  buildConnectorMessages,
  buildRelatedMessages,
  buildWikiEntityMessages,
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

/**
 * Types that earn the modal's middle slot: they SHOW structure a sentence can't. Text-shaped
 * types (definition-card, fact-table) and plain-text render as the gloss alone (no middle).
 */
const VISUAL_TYPES = new Set<CatalogType>([
  'chart',
  'concept-diagram',
  'timeline',
  'comparison',
  'steps',
]);

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
  console.log('[Curio GenUI] Stage 1 raw:', choiceRaw, '→ parsed:', choice);
  if (choice && typeof choice === 'object') {
    const c = choice as { type?: unknown; confidence?: unknown };
    if (typeof c.type === 'string' && (CATALOG_TYPES as readonly string[]).includes(c.type)) {
      type = c.type as CatalogType;
    }
    if (typeof c.confidence === 'number') confidence = c.confidence;
  }
  console.log('[Curio GenUI] Stage 1 chose:', type, 'confidence:', confidence);

  // plain-text skips stage 2 — everything else gets filled via its schema.
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

  console.log('[Curio GenUI] Stage 2 raw:', fillRaw);
  const fillParsed = tryParse(fillRaw);
  console.log('[Curio GenUI] Stage 2 parsed:', fillParsed);
  const result = coerceFromParts(type, confidence, fillParsed, fallbackText);
  console.log('[Curio GenUI] Final envelope:', result.type);
  return result;
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

export interface DeepOptions {
  term: string;
  context: string;
  conversation?: string;
  signal?: AbortSignal;
}

/**
 * Produce the DEEP explanation (a few sentences) shown in the modal — the actual "more" behind
 * "Ver más", distinct from the one-line popover gloss. Uses any provider; sanitized like the
 * gloss. Longer token budget so it can breathe.
 */
export async function describeDeepWith(provider: LlmProvider, opts: DeepOptions): Promise<string> {
  try {
    const text = await provider.complete({
      messages: buildDeepDescribeMessages(opts.term, opts.context, opts.conversation),
      temperature: 0.3,
      maxTokens: 350,
      signal: opts.signal,
    });
    return cleanDescription(text);
  } catch (e) {
    // Cancellation must propagate; any other failure just means no deeper text (the modal
    // falls back to the gloss) — it must not blank the component or related links.
    if (e instanceof DOMException && e.name === 'AbortError') throw e;
    return '';
  }
}

/** Ollama wrapper for {@link describeDeepWith}. */
export function generateDeep(model: string, opts: DeepOptions): Promise<string> {
  return describeDeepWith(new OllamaProvider(model), opts);
}

/**
 * Produce the CONTEXTUALIZER text — why this term appears in THIS text, what depends on it.
 * 2-3 sentences, plain prose. Never throws except on cancellation.
 */
export async function contextualizeWith(provider: LlmProvider, opts: DeepOptions): Promise<string> {
  try {
    const text = await provider.complete({
      messages: buildContextualizerMessages(opts.term, opts.context, opts.conversation),
      temperature: 0.3,
      maxTokens: 250,
      signal: opts.signal,
    });
    return cleanDescription(text);
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e;
    return '';
  }
}

/**
 * Produce the CONNECTOR text — which other terms in the text relate to this one, and how.
 * 2-3 sentences, plain prose. Never throws except on cancellation.
 */
export async function connectWith(provider: LlmProvider, opts: DeepOptions): Promise<string> {
  try {
    const text = await provider.complete({
      messages: buildConnectorMessages(opts.term, opts.context, opts.conversation),
      temperature: 0.3,
      maxTokens: 250,
      signal: opts.signal,
    });
    return cleanDescription(text);
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e;
    return '';
  }
}

export interface WikiEntity {
  /** Canonical Wikipedia article title, or null when the term isn't a specific entity. */
  title: string | null;
  /** Wikipedia language code, e.g. 'es'. */
  lang: string;
}

const WIKI_ENTITY_SCHEMA: OllamaFormat = {
  type: 'object',
  properties: { title: { type: 'string' }, lang: { type: 'string' } },
  required: ['title', 'lang'],
  additionalProperties: false,
};

export interface EntityOptions {
  term: string;
  context: string;
  conversation?: string;
  signal?: AbortSignal;
}

/**
 * Resolve, IN CONTEXT, the Wikipedia entity a term refers to — or null when it isn't a specific
 * entity. This drives the modal's photo: only a real, correctly-disambiguated entity gets one, so
 * a common/ambiguous word never pulls a random article. Uses any provider (JSON-constrained).
 * Never throws except on cancellation; on any failure returns `{ title: null }`, so the modal just
 * shows no photo — the LLM's own in-context description is always the source of truth.
 */
export async function resolveWikiEntityWith(
  provider: LlmProvider,
  opts: EntityOptions,
): Promise<WikiEntity> {
  try {
    const raw = await provider.complete({
      messages: buildWikiEntityMessages(opts.term, opts.context, opts.conversation),
      format: WIKI_ENTITY_SCHEMA,
      temperature: 0,
      maxTokens: 60,
      signal: opts.signal,
    });
    const parsed = tryParse(raw) as { title?: unknown; lang?: unknown } | undefined;
    const title =
      parsed && typeof parsed.title === 'string' && parsed.title.trim()
        ? parsed.title.trim()
        : null;
    const lang =
      parsed && typeof parsed.lang === 'string' && /^[a-z]{2,3}$/i.test(parsed.lang.trim())
        ? parsed.lang.trim().toLowerCase()
        : 'es';
    return { title, lang };
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e;
    return { title: null, lang: 'es' };
  }
}

/** Ollama wrapper for {@link resolveWikiEntityWith}. */
export function resolveWikiEntity(model: string, opts: EntityOptions): Promise<WikiEntity> {
  return resolveWikiEntityWith(new OllamaProvider(model), opts);
}
