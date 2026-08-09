// Does the active model "see"? This drives the image-describe FLAG: it only shows up when the
// current model is vision-capable. For Ollama we can tell from the model metadata; for a cloud
// (bring-your-own) endpoint we can't reliably introspect, so the surface decides (typically:
// let the user opt in, since they picked the model).

import type { OllamaModel } from '../ollama/types';

/**
 * Name fragments of well-known Ollama vision models. Matched loosely against the model tag, as a
 * fallback when the `details.families` metadata doesn't already flag vision. Not exhaustive — new
 * vision models appear often — but covers the common ones; the family check catches the rest.
 */
const OLLAMA_VISION_NAME_HINTS = [
  'llava',
  'vision',
  'moondream',
  'qwen2-vl',
  'qwen2.5-vl',
  'minicpm-v',
  'bakllava',
  'granite3.2-vision',
  'llama4',
  'gemma3',
  'mistral-small3.1',
];

/** Family names Ollama reports for models with an image encoder. */
const OLLAMA_VISION_FAMILIES = ['clip', 'mllama'];

/**
 * Best-effort: does this Ollama model accept images? Checks the reported families first (a `clip`
 * or `mllama` encoder, or any family containing "vision"), then falls back to matching the tag
 * against known vision-model names. Returns false for a missing model.
 */
export function ollamaModelSupportsVision(model: OllamaModel | null | undefined): boolean {
  if (!model) return false;
  const families = model.details?.families ?? (model.details?.family ? [model.details.family] : []);
  const fam = families.map((f) => f.toLowerCase());
  if (fam.some((f) => OLLAMA_VISION_FAMILIES.includes(f) || f.includes('vision'))) return true;
  const name = (model.model ?? model.name ?? '').toLowerCase();
  return OLLAMA_VISION_NAME_HINTS.some((hint) => name.includes(hint));
}

/** The same check by bare tag, when only the name string is on hand (no full model object). */
export function ollamaModelNameSuggestsVision(name: string): boolean {
  const n = name.toLowerCase();
  return OLLAMA_VISION_NAME_HINTS.some((hint) => n.includes(hint));
}
