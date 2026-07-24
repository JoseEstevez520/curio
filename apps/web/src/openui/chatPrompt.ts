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
