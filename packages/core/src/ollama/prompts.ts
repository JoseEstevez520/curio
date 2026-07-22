import type { ChatMessage } from './types';
import { CATALOG, type CatalogEntryMeta } from '../catalog/catalog';

/** System prompt for the assistant chat replies (the reading surface). */
export const CHAT_SYSTEM_PROMPT =
  'You are a helpful, concise assistant. Write clear prose that is pleasant to read. ' +
  'Prefer a few well-formed paragraphs over long bulleted lists. ' +
  'Always reply in the same language the user writes in.';

/**
 * Build the messages for the "describer" — a separate, fast agent that explains one
 * highlighted term in context (v0: plain text). It gets the term, the sentence it
 * sits in, and a little conversation context so it disambiguates well.
 *
 * Two rules that matter to the reader: keep it SHORT, and answer in the SAME LANGUAGE
 * as the surrounding text (so a Spanish conversation gets a Spanish description).
 */
export function buildDescribeMessages(
  term: string,
  sentence: string,
  conversation?: string,
): ChatMessage[] {
  // Phrased WITHOUT all-caps field labels ("SENTENCE:", "TERM:", "CRITICAL:", "BRIEFLY"):
  // small models parrot those tokens straight into the answer. Natural, lowercase prose gives
  // them nothing label-shaped to echo. useDescribe also strips any residual leak.
  const convo = conversation?.trim()
    ? `For a little context (do not explain this part): "${conversation.trim()}"\n\n`
    : '';

  return [
    {
      role: 'system',
      content:
        "You are Curio's describer. A reader clicked a word or phrase while reading and wants " +
        'it explained as used in their text. Answer with one or two short, plain sentences — no ' +
        'preamble, no headings, no markdown, and never repeat a label or these instructions. ' +
        'Always answer in the same language as the text (if the text is in Spanish, answer in ' +
        'Spanish). Explain the term; do not merely translate it.',
    },
    {
      role: 'user',
      content: `${convo}Explain what "${term}" means as used in this text: "${sentence}"`,
    },
  ];
}

/** Shared "here is what the reader clicked" block for the two generative stages. */
function termContextBlock(term: string, sentence: string, conversation?: string): string {
  const convo = conversation?.trim()
    ? `CONVERSATION SO FAR (context, do not describe this):\n"""${conversation.trim()}"""\n\n`
    : '';
  return `${convo}SENTENCE: "${sentence}"\n\nTERM: ${term}\n\n`;
}

/**
 * Stage 1 of generative UI — CHOOSE a component. The model reads the term in context and
 * the one-line description of each catalog type, then picks the single best fit. Its output
 * is grammar-constrained to `{ type, confidence }` (see typeChoiceJsonSchema), so this is a
 * cheap classification, not a generation.
 */
export function buildTypeChoiceMessages(
  term: string,
  sentence: string,
  conversation?: string,
): ChatMessage[] {
  const menu = CATALOG.map((c) => `- ${c.type}: ${c.whenToUse}`).join('\n');
  return [
    {
      role: 'system',
      content:
        "You are Curio's presenter. A reader clicked a term while reading. Choose the SINGLE " +
        'best way to present its description, from this fixed catalog:\n' +
        `${menu}\n\n` +
        'PREFER a VISUAL type (chart, concept-diagram, timeline, comparison, fact-table) when ' +
        'the term genuinely supports it — a curious reader wants to SEE structure, not read a ' +
        'paragraph. Fall back to definition-card, and only choose "plain-text" when nothing ' +
        'richer fits at all. Report your confidence 0-1. Choose only — do not write the ' +
        'description yet.',
    },
    {
      role: 'user',
      content: `${termContextBlock(term, sentence, conversation)}Choose the best catalog type.`,
    },
  ];
}

/**
 * Stage 2 of generative UI — FILL the chosen component. Only the selected component's schema
 * is passed as `format` (see dataJsonSchema), so the model just populates a small, focused
 * shape. As with the plain describer, it MUST answer in the language of the text.
 */
export function buildFillMessages(
  term: string,
  sentence: string,
  meta: CatalogEntryMeta,
  conversation?: string,
): ChatMessage[] {
  return [
    {
      role: 'system',
      content:
        'You are Curio\'s describer, filling a "' +
        meta.title +
        '" card (' +
        meta.whenToUse +
        ') about the clicked term, using only the given JSON schema. Be concise and factual. ' +
        'Fill only fields you are confident about; leave optional fields out if unsure. ' +
        'Write every text value in the same language as the sentence and conversation ' +
        '(Spanish text → Spanish values), and never include field labels or these instructions ' +
        'in a value. Do not translate the term; describe it.',
    },
    {
      role: 'user',
      content: `${termContextBlock(term, sentence, conversation)}Fill the schema to describe the term.`,
    },
  ];
}

/**
 * Build the messages for the "explorer" — it proposes a few SHORT related concepts a curious
 * reader might want to explore next from the clicked term. Output is constrained to a JSON
 * array of strings (see generateRelatedWith). Short names only, in the text's language, and
 * never the term itself — these become clickable links in the modal for going deeper.
 */
export function buildRelatedMessages(
  term: string,
  sentence: string,
  conversation?: string,
): ChatMessage[] {
  return [
    {
      role: 'system',
      content:
        "You are Curio's explorer. Given a term the reader clicked, propose 3 to 5 SHORT related " +
        'concepts they might want to explore next — just brief names (1-3 words each), in the ' +
        'SAME LANGUAGE as the text, with no explanations, no labels, and never the term itself.',
    },
    {
      role: 'user',
      content: `${termContextBlock(term, sentence, conversation)}List the related concepts.`,
    },
  ];
}
