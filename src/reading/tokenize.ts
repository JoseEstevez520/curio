/** A single piece of a message: either a clickable word or inert glue (spaces, punctuation). */
export interface Token {
  text: string;
  clickable: boolean;
}

// Pure function words: never worth a lookup on their own, so they stay inert.
const STOPWORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'but',
  'if',
  'of',
  'to',
  'in',
  'on',
  'at',
  'by',
  'for',
  'with',
  'as',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'am',
  'it',
  'its',
  'this',
  'that',
  'these',
  'those',
  'i',
  'you',
  'he',
  'she',
  'we',
  'they',
  'me',
  'him',
  'her',
  'us',
  'them',
  'my',
  'your',
  'his',
  'our',
  'their',
  'from',
  'into',
  'over',
  'than',
  'then',
  'so',
  'not',
  'no',
  'do',
  'does',
  'did',
  'has',
  'have',
  'had',
  'will',
  'would',
  'can',
  'could',
  'should',
  'may',
  'might',
  'must',
  'about',
  'up',
  'out',
  'off',
  'via',
]);

// Runs of letters/digits (with internal apostrophes/hyphens) OR runs of everything else.
const TOKEN_RE = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*|[^\p{L}\p{N}]+/gu;
const WORD_RE = /[\p{L}\p{N}]/u;

/**
 * Split text into tokens, preserving all whitespace/punctuation so the original prose
 * renders verbatim. A token is clickable if it is a word of length > 1 and not a stopword.
 * Clickability is permissive by design — detection only gates decoration, never curiosity.
 */
export function tokenize(text: string): Token[] {
  const parts = text.match(TOKEN_RE) ?? [];
  return parts.map((t) => {
    const isWord = WORD_RE.test(t);
    const clickable = isWord && t.length > 1 && !STOPWORDS.has(t.toLowerCase());
    return { text: t, clickable };
  });
}
