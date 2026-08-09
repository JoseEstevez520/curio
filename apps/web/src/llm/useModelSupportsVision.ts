import { ollamaModelNameSuggestsVision } from '@curio/core';
import { useChatStore, type Brain } from '../app/store';

/**
 * Does the brain that will describe images actually "see"?
 *   • Groq / cloud (bring-your-own): TRUE — the user picked the model, so we let them opt in;
 *     we can't reliably introspect an arbitrary OpenAI-compatible endpoint.
 *   • Ollama: a name-based heuristic on the describe model (falls back to the chat model).
 *
 * Plain function so it can be read imperatively (e.g. inside a click handler via getState());
 * `useModelSupportsVision` is the reactive hook wrapper.
 */
export function brainSeesVision(s: {
  brain: Brain;
  model: string | null;
  describeModel: string | null;
}): boolean {
  if (s.brain === 'groq') return true;
  const model = s.describeModel ?? s.model;
  return model ? ollamaModelNameSuggestsVision(model) : false;
}

/** Reactive: whether the active describe model can see. Drives the header's image toggle. */
export function useModelSupportsVision(): boolean {
  return useChatStore(brainSeesVision);
}
