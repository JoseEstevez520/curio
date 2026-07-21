import type { ChatMessage } from './types';

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
  const convo = conversation?.trim()
    ? `CONVERSATION SO FAR (for context, do not describe this):\n"""${conversation.trim()}"""\n\n`
    : '';

  return [
    {
      role: 'system',
      content:
        "You are Curio's describer. A reader clicked one word or phrase while reading. " +
        'Explain that term BRIEFLY (1-2 sentences, no preamble, no markdown, no headings) ' +
        'as it is used in the given sentence and conversation. ' +
        'CRITICAL: write your answer in the SAME LANGUAGE as the SENTENCE and CONVERSATION. ' +
        'If they are in Spanish, answer in Spanish. Do not translate the term; explain it.',
    },
    {
      role: 'user',
      content:
        `${convo}SENTENCE: "${sentence}"\n\nTERM: ${term}\n\n` +
        'Explain the term briefly, in the language of the text above.',
    },
  ];
}
