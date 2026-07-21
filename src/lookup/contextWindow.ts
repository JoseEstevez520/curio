import type { Token } from '../reading/tokenize';

const SENTENCE_END = /[.!?]/;

/**
 * Extract the sentence surrounding the token at `index` — the context we send to the
 * model so ambiguous words ("Mercury" the planet vs. the metal) are disambiguated.
 * Walks outward from the token until a sentence-ending punctuation token is hit.
 */
export function contextWindow(tokens: Token[], index: number): string {
  let start = 0;
  let end = tokens.length;

  for (let i = index - 1; i >= 0; i--) {
    if (!tokens[i].clickable && SENTENCE_END.test(tokens[i].text)) {
      start = i + 1;
      break;
    }
  }
  for (let i = index + 1; i < tokens.length; i++) {
    if (!tokens[i].clickable && SENTENCE_END.test(tokens[i].text)) {
      end = i + 1;
      break;
    }
  }

  return tokens
    .slice(start, end)
    .map((t) => t.text)
    .join('')
    .trim();
}
