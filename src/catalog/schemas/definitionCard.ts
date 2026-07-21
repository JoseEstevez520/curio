import { z } from 'zod';

/**
 * A term / word / concept that needs a concise meaning. The bread-and-butter card for a
 * reader clicking an unfamiliar word. Everything past `term` + `definition` is optional so
 * a small model can fill just what it's sure about.
 */
export const definitionCardData = z.object({
  term: z.string(),
  definition: z.string().max(600),
  /** e.g. "noun", "verb", "sustantivo" — free-form, model's language. */
  partOfSpeech: z.string().max(40).optional(),
  examples: z.array(z.string().max(240)).max(3).optional(),
  synonyms: z.array(z.string().max(60)).max(6).optional(),
});

export type DefinitionCardData = z.infer<typeof definitionCardData>;
