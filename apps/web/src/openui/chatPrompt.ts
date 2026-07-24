import { curioLibrary } from './library';

/**
 * System prompt for GENERATIVE chat: the assistant answers by composing Curio's components
 * (OpenUI Lang) instead of plain text. `library.prompt()` teaches the Lang + our component
 * signatures; this note frames it as a chat answer where normal prose is just `Prose`.
 */
const CHAT_TASK_NOTE = [
  'You are Curio, a helpful assistant answering in a chat. Instead of plain text, you RESPOND BY',
  'COMPOSING the available components. Normal paragraphs are `Prose`; use `Heading` for a title,',
  'and richer pieces (DefinitionCard, FactTable, Timeline, KeyStat, Callout) whenever they express',
  'the answer better than prose. CRITICAL: the root MUST wrap ALL pieces in ONE array —',
  '`root = Panel([Heading(...), Prose(...), ...])`. Never pass pieces to Panel as separate arguments.',
  'Answer in the same language as the user. Be helpful, concise, and factual; do not overload the',
  'panel — a few well-chosen pieces beat a wall.',
].join(' ');

/** The full system prompt string for generative chat (OpenUI spec + our library + the note). */
export function openUIChatSystemPrompt(): string {
  return `${curioLibrary.prompt()}\n\n${CHAT_TASK_NOTE}`;
}

/**
 * Task note for TRANSFORMING an article/text into Gen UI: same components, but the job is to
 * re-express the given text as a lively, skimmable panel — never to invent facts.
 */
const ARTICLE_TASK_NOTE = [
  'You are given an article or text. RE-EXPRESS it as an engaging, skimmable panel by COMPOSING',
  'the available components — keep the information FAITHFUL (do not invent facts), but make it',
  'lively and clear: a Heading, Prose for the narrative, and richer pieces (DefinitionCard for key',
  'terms, FactTable for data, Timeline for dates/events, KeyStat for a striking figure, Callout for',
  'a highlight) to surface what matters. CRITICAL: the root MUST wrap ALL pieces in ONE array —',
  '`root = Panel([Heading(...), Prose(...), ...])`. Never pass pieces to Panel as separate arguments.',
  'Answer in the same language as the text. Cover the whole text, but stay tight — quality over volume.',
].join(' ');

/** System prompt for transforming pasted text into a Gen UI reading (OpenUI spec + library + note). */
export function openUIArticleSystemPrompt(): string {
  return `${curioLibrary.prompt()}\n\n${ARTICLE_TASK_NOTE}`;
}
