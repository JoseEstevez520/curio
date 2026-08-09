import type { ChatMessage } from './types';
import { CATALOG, type CatalogEntryMeta } from '../catalog/catalog';
import { DEFAULT_LOCALE, LANGUAGE_NAMES, languageDirective, type Locale } from '../i18n/locale';

/**
 * System prompt for the assistant chat replies (the reading surface). The reply LANGUAGE is
 * driven by the configured `locale` (see {@link languageDirective}), not by the language of the
 * user's message — Curio's language is a setting, consistent across every surface.
 */
export function buildChatSystemPrompt(locale: Locale = DEFAULT_LOCALE): string {
  return (
    'You are a helpful, concise assistant. Write clear prose that is pleasant to read. ' +
    'Prefer a few well-formed paragraphs over long bulleted lists. ' +
    languageDirective(locale)
  );
}

/**
 * Backward-compatible default (English) chat system prompt. Prefer {@link buildChatSystemPrompt}
 * with an explicit locale; this alias keeps existing call sites compiling until they pass one.
 */
export const CHAT_SYSTEM_PROMPT = buildChatSystemPrompt(DEFAULT_LOCALE);

/**
 * Build the messages for the "describer" — a separate, fast agent that explains one
 * highlighted term in context (v0: plain text). It gets the term, the sentence it
 * sits in, and a little conversation context so it disambiguates well.
 *
 * Two rules that matter to the reader: keep it SHORT, and answer in the CONFIGURED language
 * (via `locale`), so the description matches whatever language Curio is set to.
 */
export function buildDescribeMessages(
  term: string,
  sentence: string,
  conversation?: string,
  locale: Locale = DEFAULT_LOCALE,
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
        "You are Curio's describer. A reader clicked a word or phrase while reading and wants a " +
        'QUICK glimpse. Answer with EXACTLY ONE short, plain sentence — no more — with no ' +
        'preamble, no headings, no markdown, and never repeating a label or these instructions. ' +
        `${languageDirective(locale)} Explain the term; do not merely translate it.`,
    },
    {
      role: 'user',
      content: `${convo}Explain what "${term}" means as used in this text: "${sentence}"`,
    },
  ];
}

/**
 * Build the messages for the WIKIPEDIA ENTITY RESOLVER — a tiny classification that decides, IN
 * CONTEXT, whether the term names a real encyclopedic entity with its own Wikipedia article, and
 * if so its canonical title + language. This is what lets the modal show a photo ONLY for a real,
 * correctly-disambiguated entity (never a random article for a common word). The model has the
 * context, so it disambiguates far better than a blind Wikipedia search. The article language
 * follows the configured `locale`, so the photo + facts match Curio's language.
 */
export function buildWikiEntityMessages(
  term: string,
  sentence: string,
  conversation?: string,
  locale: Locale = DEFAULT_LOCALE,
): ChatMessage[] {
  const convo = conversation?.trim()
    ? `For a little context (do not explain this part): "${conversation.trim()}"\n\n`
    : '';
  return [
    {
      role: 'system',
      content:
        'You decide whether a term, AS USED in the given text, names a specific real-world ENTITY ' +
        'that has its own Wikipedia article — a person, place, organization, work, event, species, ' +
        'named concept, etc. Reply ONLY with a JSON object {"title": string, "lang": string}. ' +
        `"title": the EXACT canonical Wikipedia article title for that entity, in ${LANGUAGE_NAMES[locale]} ` +
        '(e.g. "Júpiter (planeta)", "Muhammad Ali", "Boxeo"). If the term is a common ' +
        'word, a generic or abstract term, a function word, or does not refer to one specific ' +
        'article-worthy entity, set "title" to an EMPTY STRING. "lang": the Wikipedia language ' +
        `code for ${LANGUAGE_NAMES[locale]} ("${locale}"). Do not invent titles; when unsure, use "".`,
    },
    {
      role: 'user',
      content: `${convo}Term: "${term}"\nText: "${sentence}"`,
    },
  ];
}

/**
 * Build the messages for the DEEP explanation — the fuller read a reader gets on "See more".
 * Where {@link buildDescribeMessages} is a one-line glimpse for the popover, this is a proper
 * few-sentence explanation (what it is, a key aspect or two, something genuinely interesting),
 * so opening the modal actually shows MORE. Plain prose in the configured language — no headings,
 * no markdown, no labels.
 */
export function buildDeepDescribeMessages(
  term: string,
  sentence: string,
  conversation?: string,
  locale: Locale = DEFAULT_LOCALE,
): ChatMessage[] {
  return [
    {
      role: 'system',
      content:
        "You are Curio's describer writing the fuller explanation a curious reader sees when " +
        'they choose to go deeper. The reader has ALREADY seen a one-line definition, so do NOT ' +
        'just restate what it is — go further: how it works, why it matters, an example, or a ' +
        'genuinely interesting fact. Write 3 to 5 short sentences of plain prose — no headings, ' +
        `no markdown, no labels, no repeating these instructions. ${languageDirective(locale)}`,
    },
    {
      role: 'user',
      content: `${termContextBlock(term, sentence, conversation)}Explain it more fully.`,
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
 * cheap classification, not a generation — no language directive needed (it emits no prose).
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
        "You are Curio's presenter. A reader clicked a term while reading. Your job is to choose " +
        'the BEST component type to explain it. Catalog:\n' +
        `${menu}\n\n` +
        'ALWAYS choose a structured type. Use "definition-card" for general concepts, people, ' +
        'places, or things. Use "fact-table" for things with key properties or specs. Use ' +
        '"timeline" for things with dated events. Use "chart" for things with quantities. Use ' +
        '"concept-diagram" for things with relationships. Use "comparison" for things that contrast. ' +
        'Use "steps" for processes. Only choose "plain-text" if absolutely nothing else fits. ' +
        'Report your confidence 0-1. Choose only — do not write the description yet.',
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
 * shape. As with the plain describer, it MUST answer in the configured language.
 */
export function buildFillMessages(
  term: string,
  sentence: string,
  meta: CatalogEntryMeta,
  conversation?: string,
  locale: Locale = DEFAULT_LOCALE,
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
        `${languageDirective(locale)} Write every text VALUE in that language, and never include ` +
        'field labels or these instructions in a value. Do not translate the term; describe it.',
    },
    {
      role: 'user',
      content: `${termContextBlock(term, sentence, conversation)}Fill the schema to describe the term.`,
    },
  ];
}

/**
 * Build the messages for the CONTEXTUALIZER — explains what role this term plays in THIS
 * specific document. Not "what is X" (the definer does that) but "why does X appear here,
 * what claim depends on it, what would be lost without it". 2-3 sentences, plain prose.
 */
export function buildContextualizerMessages(
  term: string,
  sentence: string,
  conversation?: string,
  locale: Locale = DEFAULT_LOCALE,
): ChatMessage[] {
  return [
    {
      role: 'system',
      content:
        "You are Curio's contextualizer. The reader already knows WHAT the term is — your job is " +
        'to explain what role it plays in THIS specific text. Why does the author mention it here? ' +
        'What claim or argument depends on it? What would be lost if you removed it from the text? ' +
        'Write 2 to 3 short sentences of plain prose — no headings, no markdown, no labels. ' +
        languageDirective(locale),
    },
    {
      role: 'user',
      content: `${termContextBlock(term, sentence, conversation)}Explain why this term appears here.`,
    },
  ];
}

/**
 * Build the messages for the CONNECTOR — identifies which other terms in the text relate to
 * this one, and how. Not a list of generic associations but specific relationships within
 * this document. 2-3 sentences, plain prose.
 */
export function buildConnectorMessages(
  term: string,
  sentence: string,
  conversation?: string,
  locale: Locale = DEFAULT_LOCALE,
): ChatMessage[] {
  return [
    {
      role: 'system',
      content:
        "You are Curio's connector. The reader already knows what the term IS and why the author " +
        'mentions it. Your job is to explain which OTHER terms or ideas in the same text relate ' +
        'to this one, and HOW — does it depend on them, contradict them, extend them, exemplify ' +
        'them? Name the specific terms and describe the relationship in 2 to 3 short sentences ' +
        'of plain prose — no headings, no markdown, no labels. ' +
        languageDirective(locale),
    },
    {
      role: 'user',
      content: `${termContextBlock(term, sentence, conversation)}What relates to this term in this text?`,
    },
  ];
}

/**
 * Build the messages for the "explorer" — it proposes a few SHORT related concepts a curious
 * reader might want to explore next from the clicked term. Output is constrained to a JSON
 * array of strings (see generateRelatedWith). Short names only, in the configured language, and
 * never the term itself — these become clickable links in the modal for going deeper.
 */
export function buildRelatedMessages(
  term: string,
  sentence: string,
  conversation?: string,
  locale: Locale = DEFAULT_LOCALE,
): ChatMessage[] {
  return [
    {
      role: 'system',
      content:
        "You are Curio's explorer. Given a term the reader clicked, propose 3 to 5 SHORT related " +
        'concepts they might want to explore next — just brief names (1-3 words each), with no ' +
        `explanations, no labels, and never the term itself. ${languageDirective(locale)}`,
    },
    {
      role: 'user',
      content: `${termContextBlock(term, sentence, conversation)}List the related concepts.`,
    },
  ];
}
