import { z } from 'zod';
import type { OllamaFormat } from '../ollama/types';
import { CATALOG_TYPES, type CatalogType } from './schemas';
import { dataSchemas } from './schemas';

/**
 * Convert a Zod schema to the JSON Schema Ollama expects in its `format` field. Ollama
 * grammar-constrains generation to the schema, which is the reliable path for small models.
 * We drop the `$schema` meta key — Ollama only wants the shape itself.
 */
function toOllamaFormat(schema: z.ZodType): OllamaFormat {
  const json = z.toJSONSchema(schema) as Record<string, unknown>;
  delete json.$schema;
  return json;
}

/**
 * Stage-2 format: the JSON Schema for one chosen component's `data`. Passing only the
 * selected component's schema (not the whole union) keeps it small, which measurably
 * improves fill accuracy on a 1–3B model.
 */
export function dataJsonSchema(type: CatalogType): OllamaFormat {
  return toOllamaFormat(dataSchemas[type]);
}

/**
 * Stage-1 format: a tiny classification schema — pick a catalog `type` and self-rate
 * `confidence`. Cheap and fast; the model only has to choose, not fill.
 */
export function typeChoiceJsonSchema(): OllamaFormat {
  const schema = z.object({
    type: z.enum(CATALOG_TYPES),
    confidence: z.number().min(0).max(1),
  });
  return toOllamaFormat(schema);
}
