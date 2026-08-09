// @curio/core — Curio's portable click-to-explain engine.
//
// Surface-agnostic: the same catalog, Ollama client, prompts, generation pipeline, tokenizer
// and motion tokens power the web app, the browser extension and (later) the desktop shell.
// Nothing here depends on a particular app store or DOM layout — the Ollama endpoint is
// configurable via `configureOllama` so each surface points it at the right place.

// Pluggable "brain": the provider seam, its impls (Ollama local, OpenAI-compatible cloud like
// Groq, Chrome built-in Gemini Nano), and the factory that picks one from a plain config.
export * from './llm/provider';
export * from './llm/ollama-provider';
export * from './llm/openai-provider';
export * from './llm/chrome-ai-provider';
export * from './llm/fallback-provider';
export * from './llm/factory';

// Motion tokens (shared-element morph, fades).
export * from './motion';

// Language layer: one locale setting drives UI strings AND the model's output language
// (the directive injected into prompts). Shared by web and extension.
export * from './i18n/locale';
export * from './i18n/strings';

// Ollama client (configurable base), model listing, prompt builders, shared types.
export * from './ollama/client';
export * from './ollama/models';
export * from './ollama/prompts';
export * from './ollama/types';

// Generative-UI catalog: Zod schemas + discriminated envelope, validation/coercion,
// component metadata, Zod→JSON-Schema helpers, and the JSON→component renderer.
export * from './catalog/schemas';
export * from './catalog/coerce';
export * from './catalog/catalog';
export * from './catalog/jsonSchema';
export { default as CatalogRenderer } from './catalog/CatalogRenderer';
// Exposed on its own too: the modal renders the reader's related links as a clickable graph.
export { default as ConceptDiagram } from './catalog/components/ConceptDiagram';

// Reading + lookup: word tokenizer, two-stage generation, prompt-leak sanitizer.
export * from './reading/tokenize';
export * from './lookup/generate';
export * from './lookup/cleanDescription';

// Open reference data (Wikipedia) — real photo + facts + link for the "ver más" panel.
export * from './wikipedia/client';
