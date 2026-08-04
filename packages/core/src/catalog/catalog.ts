import type { CatalogType } from './schemas';

/**
 * Human-facing metadata for each catalog entry. `whenToUse` is fed to the model in the
 * stage-1 prompt (pick a type) — keep each line short and decisive, since a small model
 * reads them literally. `title` is a fallback label for the modal when a component has no
 * title of its own.
 */
export interface CatalogEntryMeta {
  type: CatalogType;
  title: string;
  whenToUse: string;
}

/** Order matters: `plain-text` first as the safe default the model can always retreat to. */
export const CATALOG: readonly CatalogEntryMeta[] = [
  {
    type: 'plain-text',
    title: 'Description',
    whenToUse: 'Anything that does not clearly fit a richer type. The safe default.',
  },
  {
    type: 'definition-card',
    title: 'Definition',
    whenToUse: 'A single term, word or concept that needs a concise meaning.',
  },
  {
    type: 'fact-table',
    title: 'Facts',
    whenToUse: 'A thing described by a few key/value facts (measures, dates, attributes).',
  },
  {
    type: 'timeline',
    title: 'Timeline',
    whenToUse: 'Ordered events over time: a life, a war, a process, a history.',
  },
  {
    type: 'comparison',
    title: 'Comparison',
    whenToUse: 'Two or more things compared attribute by attribute ("X vs Y").',
  },
  {
    type: 'steps',
    title: 'Steps',
    whenToUse: 'An ordered how-to / instructions, or a simple list of items.',
  },
  {
    type: 'chart',
    title: 'Chart',
    whenToUse:
      'A few comparable QUANTITIES worth seeing as bars (sizes, populations, durations, %).',
  },
  {
    type: 'concept-diagram',
    title: 'Map',
    whenToUse:
      'A concept whose meaning is best SEEN as a small map of how it connects to related ideas.',
  },
] as const;

/** Look up a catalog entry's metadata by type. */
export function catalogMeta(type: CatalogType): CatalogEntryMeta {
  return CATALOG.find((c) => c.type === type) ?? CATALOG[0];
}
