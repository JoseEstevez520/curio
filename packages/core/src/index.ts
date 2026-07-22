// @curio/core — Curio's portable click-to-explain engine.
//
// Surface-agnostic: the same catalog, Ollama client, prompts, generation pipeline, tokenizer
// and motion tokens power the web app, the browser extension and (later) the desktop shell.
// Nothing here depends on a particular app store or DOM layout — the Ollama endpoint is
// configurable via `configureOllama` so each surface points it at the right place.

// Motion tokens (shared-element morph, fades).
export * from './motion';

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

// Reading + lookup: word tokenizer, two-stage generation, prompt-leak sanitizer.
export * from './reading/tokenize';
export * from './lookup/generate';
export * from './lookup/cleanDescription';
